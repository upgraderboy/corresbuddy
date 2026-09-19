/**
 * Email Domain Validation & Institutional Academic Data Parser
 *
 * Supported Production Domains:
 * - @nitt.edu (NIT Trichy)
 * - @vit.ac.in (VIT Vellore)
 *
 * Supported Testing Domain (ONLY when ALLOW_TEST_EMAILS=true or NODE_ENV !== 'production'):
 * - @celestia-trichy.me
 *
 * Note: @gmail.com is strictly rejected.
 */

export const isTestEmailAllowed = () => {
  return (
    process.env.ALLOW_TEST_EMAILS === 'true' ||
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test'
  );
};

export const parseAndValidateEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') {
    throw new Error('Valid email address is required.');
  }

  const email = rawEmail.toLowerCase().trim();
  const atIndex = email.lastIndexOf('@');
  if (atIndex === -1) {
    throw new Error('Invalid email format.');
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex);

  // 1. Check if domain is allowed
  const isProdAllowed = domain === '@nitt.edu' || domain === '@vit.ac.in';
  const isTestAllowed = domain === '@celestia-trichy.me' && isTestEmailAllowed();

  if (!isProdAllowed && !isTestAllowed) {
    if (domain === '@gmail.com') {
      throw new Error(
        'Public email providers (@gmail.com) are not accepted. Please use your institutional email (@nitt.edu or @vit.ac.in).'
      );
    }
    if (domain === '@celestia-trichy.me') {
      throw new Error(
        'The test email domain @celestia-trichy.me is only permitted in development/testing mode.'
      );
    }
    throw new Error(
      `Email domain '${domain}' is not allowed. Only institutional emails (@nitt.edu, @vit.ac.in) are permitted.`
    );
  }

  // 2. Check for administrative emails
  if (localPart === 'admin' || localPart.startsWith('admin.')) {
    return {
      normalizedEmail: email,
      role: 'ADMIN',
      college: domain === '@nitt.edu' ? 'NIT Trichy' : domain === '@vit.ac.in' ? 'VIT Vellore' : 'Test',
      program: 'Administration',
      branch: 'Administration',
      batchYear: null,
      rollNumber: null,
      isInstitutional: true,
      isAdmin: true,
    };
  }

  // 3. NIT Trichy format: e.g. 205126009@nitt.edu
  // Pattern: 4 digits (Dept/Program code) + 2 digits (Year) + 3 digits (Roll)
  // e.g. 2051 (MCA) + 26 (Year 2026) + 009 (Roll 9) -> NIT Trichy
  if (domain === '@nitt.edu') {
    const nitMatch = localPart.match(/^(\d{4})(\d{2})(\d{3})$/);
    if (!nitMatch) {
      throw new Error(
        'Invalid NIT Trichy email format. Expected: 205126009@nitt.edu (4-digit Dept Code + 2-digit Year + 3-digit Roll Number).'
      );
    }

    const deptCode = nitMatch[1];
    const yearPrefix = parseInt(nitMatch[2], 10);
    const batchYear = yearPrefix < 50 ? 2000 + yearPrefix : 1900 + yearPrefix;
    const rollNumber = parseInt(nitMatch[3], 10);

    // Determine program and branch based on department code
    let program = 'B.Tech';
    let branch = 'Engineering';
    if (deptCode === '2051') {
      program = 'MCA';
      branch = 'Computer Applications';
    } else if (deptCode === '1061') {
      program = 'B.Tech';
      branch = 'Computer Science & Engineering';
    } else if (deptCode === '1081') {
      program = 'B.Tech';
      branch = 'Electronics & Communication Engineering';
    } else if (deptCode === '1071') {
      program = 'B.Tech';
      branch = 'Electrical & Electronics Engineering';
    } else if (deptCode === '1111') {
      program = 'B.Tech';
      branch = 'Mechanical Engineering';
    } else if (deptCode === '1031') {
      program = 'B.Tech';
      branch = 'Civil Engineering';
    }

    return {
      normalizedEmail: email,
      role: 'STUDENT',
      college: 'NIT Trichy',
      program,
      branch,
      batchYear,
      rollNumber,
      institutionCode: deptCode,
      isInstitutional: true,
      isAdmin: false,
    };
  }

  // 4. VIT format: e.g. 25MCA0141@vit.ac.in
  // Pattern: 2 digits (year) + letters (program) + digits (roll)
  if (domain === '@vit.ac.in') {
    const vitMatch = localPart.match(/^(\d{2})([a-z]+)(\d{1,5})$/i);
    if (!vitMatch) {
      throw new Error(
        'Invalid VIT email format. Expected: 25MCA0141@vit.ac.in (Year + Program + Roll Number).'
      );
    }

    const yearPrefix = parseInt(vitMatch[1], 10);
    const batchYear = yearPrefix < 50 ? 2000 + yearPrefix : 1900 + yearPrefix;
    const program = vitMatch[2].toUpperCase();
    const rollNumber = parseInt(vitMatch[3], 10);

    return {
      normalizedEmail: email,
      role: 'STUDENT',
      college: 'VIT Vellore',
      program,
      branch: program === 'MCA' ? 'Computer Applications' : program,
      batchYear,
      rollNumber,
      isInstitutional: true,
      isAdmin: false,
    };
  }

  // 5. Celestia Test format: e.g. 25mca0141@celestia-trichy.me
  // Matches VIT pattern
  if (domain === '@celestia-trichy.me') {
    const testMatch = localPart.match(/^(\d{2})([a-z]+)(\d{1,5})$/i);
    if (!testMatch) {
      throw new Error(
        'Invalid test student email format. Expected: 25mca0141@celestia-trichy.me (Year + Program + Roll Number).'
      );
    }

    const yearPrefix = parseInt(testMatch[1], 10);
    const batchYear = yearPrefix < 50 ? 2000 + yearPrefix : 1900 + yearPrefix;
    const program = testMatch[2].toUpperCase();
    const rollNumber = parseInt(testMatch[3], 10);

    return {
      normalizedEmail: email,
      role: 'STUDENT',
      college: 'Test',
      program,
      branch: program === 'MCA' ? 'Computer Applications' : program,
      batchYear,
      rollNumber,
      isInstitutional: true,
      isAdmin: false,
    };
  }

  throw new Error('Unsupported email domain.');
};

export default {
  isTestEmailAllowed,
  parseAndValidateEmail,
};

