import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';
import { syncGenerationalLineage } from '../src/modules/corres/corres.service.js';

async function main() {
  console.log('🌱 Seeding CorresBuddy database with prototype and batch data...');

  const passwordHash = await bcrypt.hash('password', 10);

  // 1. Batches
  const batchesData = [
    { year: 2026, program: 'MCA', branch: 'Computer Applications', college: 'VIT Vellore', status: 'ACTIVE' },
    { year: 2025, program: 'MCA', branch: 'Computer Applications', college: 'VIT Vellore', status: 'ACTIVE' },
    { year: 2024, program: 'MCA', branch: 'Computer Applications', college: 'VIT Vellore', status: 'ACTIVE' },
    { year: 2023, program: 'MCA', branch: 'Computer Applications', college: 'VIT Vellore', status: 'ALUMNI' },
    { year: 2022, program: 'MCA', branch: 'Computer Applications', college: 'VIT Vellore', status: 'ALUMNI' },
  ];

  for (const b of batchesData) {
    await prisma.batch.upsert({
      where: {
        year_program_branch: {
          year: b.year,
          program: b.program,
          branch: b.branch,
        },
      },
      update: {},
      create: b,
    });
  }
  console.log('✅ Batches created');

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@vitstudent.ac.in',
      passwordHash,
      role: 'ADMIN',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      status: 'ACTIVE',
    },
  });

  // 3. Generational Lineage Users for Roll 09
  // 2022 / Roll 9
  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Arjun Verma',
      email: 'arjun@vitstudent.ac.in',
      passwordHash,
      role: 'ALUMNI',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2022,
      rollNumber: 9,
      headline: 'Software Engineer at FinTech',
      bio: 'Alumnus from batch 2022. Working on distributed systems.',
      status: 'ACTIVE',
    },
  });

  // 2023 / Roll 9
  const divya = await prisma.user.upsert({
    where: { email: 'divya@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Divya Nair',
      email: 'divya@vitstudent.ac.in',
      passwordHash,
      role: 'ALUMNI',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2023,
      rollNumber: 9,
      headline: 'Product Analyst',
      bio: 'Passionate about product management and databases.',
      status: 'ACTIVE',
    },
  });

  // 2024 / Roll 9
  const karthik = await prisma.user.upsert({
    where: { email: 'karthik@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Karthik Suresh',
      email: 'karthik@vitstudent.ac.in',
      passwordHash,
      role: 'ALUMNI',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2024,
      rollNumber: 9,
      headline: 'Full-Stack Developer',
      bio: 'Strong in DSA and Operating Systems.',
      status: 'ACTIVE',
    },
  });

  // 2025 / Roll 9 — Corres
  const priya = await prisma.user.upsert({
    where: { email: 'priya@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Priya Menon',
      email: 'priya@vitstudent.ac.in',
      passwordHash,
      role: 'SENIOR',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2025,
      rollNumber: 9,
      headline: 'Placed at a product company; strong in DBMS & interview prep',
      bio: 'Happy to help my juniors navigate placements and coursework!',
      status: 'ACTIVE',
      isTopPerformer: true,
    },
  });

  // Fallback Top Performer Senior
  const rahul = await prisma.user.upsert({
    where: { email: 'rahul@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Rahul Iyer',
      email: 'rahul@vitstudent.ac.in',
      passwordHash,
      role: 'SENIOR',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2025,
      rollNumber: 114,
      headline: 'Batch 2025 · Top Performer',
      bio: 'Academic excellence award winner. Research enthusiast.',
      status: 'ACTIVE',
      isTopPerformer: true,
    },
  });

  // 2026 / Roll 9 — Current Student (Ak)
  const ak = await prisma.user.upsert({
    where: { email: 'ak@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Ak',
      email: 'ak@vitstudent.ac.in',
      passwordHash,
      role: 'STUDENT',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2026,
      rollNumber: 9,
      headline: 'Student · Batch 2026',
      bio: 'MCA student interested in backend systems and API design.',
      status: 'ACTIVE',
    },
  });

  // Additional 2026 Students
  const sanjay = await prisma.user.upsert({
    where: { email: 'sanjay@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Sanjay R.',
      email: 'sanjay@vitstudent.ac.in',
      passwordHash,
      role: 'STUDENT',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2026,
      rollNumber: 41,
      status: 'ACTIVE',
    },
  });

  const meera = await prisma.user.upsert({
    where: { email: 'meera@vitstudent.ac.in' },
    update: {},
    create: {
      name: 'Meera K.',
      email: 'meera@vitstudent.ac.in',
      passwordHash,
      role: 'STUDENT',
      college: 'VIT Vellore',
      program: 'MCA',
      branch: 'Computer Applications',
      batchYear: 2026,
      rollNumber: 87,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Users created');

  // 4. Streaks
  const usersWithStreaks = [
    { id: priya.id, current: 7, longest: 14, thisMonth: 5 },
    { id: rahul.id, current: 4, longest: 8, thisMonth: 3 },
    { id: karthik.id, current: 3, longest: 12, thisMonth: 2 },
    { id: divya.id, current: 5, longest: 10, thisMonth: 4 },
    { id: arjun.id, current: 2, longest: 6, thisMonth: 1 },
    { id: ak.id, current: 0, longest: 0, thisMonth: 0 },
  ];

  for (const u of usersWithStreaks) {
    await prisma.streak.upsert({
      where: { userId: u.id },
      update: {
        currentStreak: u.current,
        longestStreak: u.longest,
        thisMonthCount: u.thisMonth,
        lastContributionDate: new Date(),
      },
      create: {
        userId: u.id,
        currentStreak: u.current,
        longestStreak: u.longest,
        thisMonthCount: u.thisMonth,
        lastContributionDate: new Date(),
      },
    });
  }

  // 5. Corres Assignments
  // Ak (2026/9) -> Priya Menon (2025/9) — SAME_ROLL
  await prisma.corresAssignment.upsert({
    where: { id: 'seed-assign-ak-priya' },
    update: {},
    create: {
      id: 'seed-assign-ak-priya',
      juniorId: ak.id,
      seniorId: priya.id,
      juniorBatchYear: 2026,
      seniorBatchYear: 2025,
      type: 'SAME_ROLL',
      reason: 'Same roll number found in batch 2025',
      status: 'ACTIVE',
    },
  });

  // Sanjay (2026/41) -> Priya Menon
  await prisma.corresAssignment.upsert({
    where: { id: 'seed-assign-sanjay-priya' },
    update: {},
    create: {
      id: 'seed-assign-sanjay-priya',
      juniorId: sanjay.id,
      seniorId: priya.id,
      juniorBatchYear: 2026,
      seniorBatchYear: 2025,
      type: 'SAME_ROLL',
      reason: 'Same roll number found in batch 2025',
      status: 'ACTIVE',
    },
  });

  // Meera (2026/87) -> Priya Menon
  await prisma.corresAssignment.upsert({
    where: { id: 'seed-assign-meera-priya' },
    update: {},
    create: {
      id: 'seed-assign-meera-priya',
      juniorId: meera.id,
      seniorId: priya.id,
      juniorBatchYear: 2026,
      seniorBatchYear: 2025,
      type: 'SAME_ROLL',
      reason: 'Same roll number found in batch 2025',
      status: 'ACTIVE',
    },
  });

  // Fallback assignment example: Rahul Iyer
  console.log('✅ Corres Assignments created');

  // 6. Resources
  const resourcesData = [
    {
      id: 'res-1',
      title: 'DBMS Complete Notes — Unit 1 to 5',
      description: 'Comprehensive notes covering ER diagrams, relational calculus, normalization up to BCNF, transactions, and indexing.',
      category: 'Notes',
      subject: 'DBMS',
      contributorId: priya.id,
      batchYear: 2025,
      tags: ['DBMS', 'CAT-2', 'Exam'],
      fileType: 'pdf',
    },
    {
      id: 'res-2',
      title: 'MCA Placement Interview Experience — Product Co.',
      description: 'Complete breakdown of rounds, technical coding questions, and system design discussion for product company campus placements.',
      category: 'Interview Experiences',
      subject: 'Placements',
      contributorId: priya.id,
      batchYear: 2025,
      tags: ['Placements', 'Interview'],
      fileType: 'doc',
    },
    {
      id: 'res-3',
      title: 'Handwritten DSA Problem Patterns',
      description: 'Two pointers, sliding window, topological sort, and DP patterns with diagrams and handwritten tips.',
      category: 'Notes',
      subject: 'DSA',
      contributorId: karthik.id,
      batchYear: 2024,
      tags: ['DSA', 'Handwritten'],
      fileType: 'image',
    },
    {
      id: 'res-4',
      title: 'Semester 1 Timetable — MCA Core',
      description: 'Structured weekly timetable balancing lectures, lab preparation, and self-study.',
      category: 'Timetables',
      subject: 'General',
      contributorId: divya.id,
      batchYear: 2023,
      tags: ['Timetable'],
      fileType: 'pdf',
    },
    {
      id: 'res-5',
      title: 'CAT-1 Previous Year Question Bank',
      description: 'Compiled questions from 2022, 2023, and 2024 for Operating Systems CAT-1.',
      category: 'Previous-Year Material',
      subject: 'Operating Systems',
      contributorId: karthik.id,
      batchYear: 2024,
      tags: ['OS', 'CAT-1'],
      fileType: 'pdf',
    },
    {
      id: 'res-6',
      title: 'Study Plan — Clearing Backlogs in Sem 2',
      description: 'Step-by-step strategy for handling arrear subjects while maintaining regular semester CGPA.',
      category: 'Study Plans',
      subject: 'General',
      contributorId: priya.id,
      batchYear: 2025,
      tags: ['Study Plan'],
      fileType: 'doc',
    },
    {
      id: 'res-7',
      title: 'Useful Links — Free DSA Practice Platforms',
      description: 'Curated list of question banks, roadmaps, and mock interview tools.',
      category: 'Useful Links',
      subject: 'DSA',
      contributorId: arjun.id,
      batchYear: 2022,
      tags: ['DSA', 'Links'],
      fileType: 'link',
    },
    {
      id: 'res-8',
      title: 'Advice — Choosing a Final Year Project',
      description: 'How to pick a project topic that impresses placement interviewers without becoming unmanageable.',
      category: 'Advice',
      subject: 'Project',
      contributorId: divya.id,
      batchYear: 2023,
      tags: ['Project', 'Advice'],
      fileType: 'doc',
    },
  ];

  for (const r of resourcesData) {
    const safeResource = {
      ...r,
      tags: Array.isArray(r.tags) ? JSON.stringify(r.tags) : r.tags,
    };
    await prisma.resource.upsert({
      where: { id: r.id },
      update: {},
      create: safeResource,
    });
  }
  console.log('✅ Resources created');

  // 7. Saved Resource for Ak
  await prisma.savedResource.upsert({
    where: {
      userId_resourceId: {
        userId: ak.id,
        resourceId: 'res-1',
      },
    },
    update: {},
    create: {
      userId: ak.id,
      resourceId: 'res-1',
    },
  });

  // 8. Q&A
  const q1 = await prisma.question.upsert({
    where: { id: 'q-1' },
    update: {},
    create: {
      id: 'q-1',
      title: 'How should I prepare for the DBMS CAT-2 exam?',
      description: 'The syllabus covers normalization, transactions and indexing. Not sure how deep to go for CAT-2 — any pointers from someone who\'s taken it?',
      subject: 'DBMS',
      askerId: ak.id,
      isAnswered: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: 'ans-1' },
    update: {},
    create: {
      id: 'ans-1',
      questionId: q1.id,
      authorId: priya.id,
      content: 'Focus heavily on normalization (up to BCNF) and transaction isolation levels — those carried the most weight last year. I shared my unit notes in Resources, worth going through before the exam.',
      isAccepted: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: 'ans-2' },
    update: {},
    create: {
      id: 'ans-2',
      questionId: q1.id,
      authorId: karthik.id,
      content: 'Agree with Priya. Also practice ER-to-relational mapping by hand, it came up as a full question for us.',
      isAccepted: false,
    },
  });

  await prisma.question.upsert({
    where: { id: 'q-2' },
    update: {},
    create: {
      id: 'q-2',
      title: 'Best approach to crack MCA placements at product companies?',
      description: 'Looking for advice on DSA roadmap vs full-stack projects.',
      subject: 'Placements',
      askerId: sanjay.id,
      isAnswered: true,
    },
  });

  await prisma.question.upsert({
    where: { id: 'q-3' },
    update: {},
    create: {
      id: 'q-3',
      title: 'Any recommended project ideas using MERN stack?',
      description: 'Need suggestions for an intermediate level project for 2nd year.',
      subject: 'Project',
      askerId: ak.id,
      isAnswered: false,
    },
  });

  console.log('✅ Q&A created');

  // 9. Conversations and Messages
  const [p1, p2] = [ak.id, priya.id].sort();
  const conv1 = await prisma.conversation.upsert({
    where: {
      participant1Id_participant2Id: {
        participant1Id: p1,
        participant2Id: p2,
      },
    },
    update: {},
    create: {
      participant1Id: p1,
      participant2Id: p2,
    },
  });

  const chatMessages = [
    { senderId: priya.id, content: 'Hey! Saw your question on DBMS CAT-2, hope the notes helped.' },
    { senderId: ak.id, content: 'Yes, they were really clear. Thank you!' },
    { senderId: ak.id, content: 'Also wanted to ask — any tips for the placement resume review?' },
    { senderId: priya.id, content: 'Sure, send me your resume draft whenever.' },
  ];

  for (const m of chatMessages) {
    await prisma.message.create({
      data: {
        conversationId: conv1.id,
        senderId: m.senderId,
        content: m.content,
        isRead: true,
      },
    });
  }

  // Conversation 2 with Rahul
  const [pr1, pr2] = [ak.id, rahul.id].sort();
  const conv2 = await prisma.conversation.upsert({
    where: {
      participant1Id_participant2Id: {
        participant1Id: pr1,
        participant2Id: pr2,
      },
    },
    update: {},
    create: {
      participant1Id: pr1,
      participant2Id: pr2,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      senderId: ak.id,
      content: 'Thanks for the reference!',
      isRead: true,
    },
  });

  console.log('✅ Conversations created');

  // 10. Notifications for Ak
  const notifs = [
    {
      recipientId: ak.id,
      type: 'message',
      title: 'Priya Menon sent you a message',
      message: '"Sure, send me your resume draft whenever."',
      isRead: false,
    },
    {
      recipientId: ak.id,
      type: 'answer',
      title: 'Your question was answered',
      message: 'Priya Menon answered "How should I prepare for the DBMS CAT-2 exam?"',
      isRead: false,
    },
    {
      recipientId: ak.id,
      type: 'resource',
      title: 'New resource from your Corres',
      message: 'Priya Menon added "DBMS Complete Notes — Unit 1 to 5"',
      isRead: true,
    },
    {
      recipientId: ak.id,
      type: 'corres_assigned',
      title: 'Corres assigned',
      message: 'You were matched with Priya Menon (Batch 2025, Roll 9) — same roll number.',
      isRead: true,
    },
  ];

  for (const n of notifs) {
    await prisma.notification.create({ data: n });
  }

  // 11. Synchronize generational lineage for roll 9
  await syncGenerationalLineage(9, 'MCA', 'Computer Applications', 'VIT Vellore');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

