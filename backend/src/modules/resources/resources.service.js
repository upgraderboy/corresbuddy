import prisma from '../../config/db.js';
import { uploadFileToS3, getDownloadUrl } from '../../config/s3.js';
import { recordContribution } from '../contributions/contributions.service.js';

export const listResources = async (query = {}) => {
  const { search, category, subject, batch, author, tag, page = 1, limit = 50 } = query;

  const take = Math.min(parseInt(limit, 10) || 50, 100);
  const skip = ((parseInt(page, 10) || 1) - 1) * take;

  const where = {
    isApproved: true,
    ...(category && category !== 'All' && { category: { equals: category, mode: 'insensitive' } }),
    ...(subject && { subject: { equals: subject, mode: 'insensitive' } }),
    ...(batch && { batchYear: parseInt(batch, 10) }),
    ...(author && { contributor: { name: { contains: author, mode: 'insensitive' } } }),
    ...(tag && { tags: { contains: tag } }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { subject: { contains: search } },
        { tags: { contains: search } },
      ],
    }),
  };

  const [total, resources] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            batchYear: true,
            rollNumber: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
  ]);

  const parsedResources = resources.map((r) => {
    let tags = r.tags;
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = tags ? [tags] : [];
      }
    }
    return {
      ...r,
      tags: Array.isArray(tags) ? tags : [],
    };
  });

  return {
    total,
    page: parseInt(page, 10) || 1,
    limit: take,
    totalPages: Math.ceil(total / take),
    resources: parsedResources,
  };
};

export const getResourceById = async (id, userId = null) => {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      contributor: {
        select: {
          id: true,
          name: true,
          batchYear: true,
          rollNumber: true,
          role: true,
          headline: true,
        },
      },
      savedBy: userId
        ? {
            where: { userId },
          }
        : false,
    },
  });

  if (!resource) throw new Error('Resource not found');

  let parsedTags = resource.tags;
  if (typeof parsedTags === 'string') {
    try {
      parsedTags = JSON.parse(parsedTags);
    } catch {
      parsedTags = parsedTags ? [parsedTags] : [];
    }
  }

  return {
    ...resource,
    tags: Array.isArray(parsedTags) ? parsedTags : [],
    isSaved: userId ? resource.savedBy?.length > 0 : false,
  };
};

export const createResource = async (data, user) => {
  const { title, description, category = 'Notes', subject = 'General', tags = [], fileType = 'pdf' } = data;

  const parsedTags = Array.isArray(tags)
    ? JSON.stringify(tags)
    : typeof tags === 'string' && tags.startsWith('[')
    ? tags
    : JSON.stringify(typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : []);

  const resource = await prisma.resource.create({
    data: {
      title,
      description,
      category,
      subject,
      tags: parsedTags,
      fileType,
      contributorId: user.id,
      batchYear: user.batchYear || 2025,
      isApproved: true,
    },
    include: {
      contributor: {
        select: { id: true, name: true, batchYear: true },
      },
    },
  });

  // Record contribution
  const contribType = category.toUpperCase().includes('NOTE')
    ? 'NOTE'
    : category.toUpperCase().includes('ADVICE')
    ? 'ADVICE'
    : category.toUpperCase().includes('TIMETABLE')
    ? 'TIMETABLE'
    : category.toUpperCase().includes('STUDY PLAN')
    ? 'STUDY_PLAN'
    : 'RESOURCE';

  await recordContribution({
    userId: user.id,
    type: contribType,
    referenceId: resource.id,
    title: resource.title,
    batchYear: user.batchYear || 2025,
  });

  // Notify assigned juniors
  const assignments = await prisma.corresAssignment.findMany({
    where: { seniorId: user.id, status: 'ACTIVE' },
  });

  for (const a of assignments) {
    await prisma.notification.create({
      data: {
        recipientId: a.juniorId,
        type: 'resource',
        title: 'New resource from your Corres',
        message: `${user.name} added "${resource.title}"`,
        data: JSON.stringify({ resourceId: resource.id }),
      },
    });
  }

  return resource;
};

export const uploadResourceFile = async (resourceId, file, user) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) throw new Error('Resource not found');
  if (resource.contributorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Unauthorized to upload file for this resource');
  }

  const ext = file.originalname.split('.').pop() || 'pdf';
  const s3Key = `resources/${resource.id}_${Date.now()}.${ext}`;

  const fileUrl = await uploadFileToS3(file.buffer, s3Key, file.mimetype);

  const updated = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      s3Key,
      fileUrl,
      fileSize: file.size,
      fileType: ext.toLowerCase(),
    },
  });

  return updated;
};

export const getResourceDownloadUrl = async (id) => {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw new Error('Resource not found');

  await prisma.resource.update({
    where: { id },
    data: { downloadsCount: { increment: 1 } },
  });

  if (resource.s3Key) {
    return await getDownloadUrl(resource.s3Key);
  }

  return resource.fileUrl || '#';
};

export const updateResource = async (id, data, user) => {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw new Error('Resource not found');
  if (resource.contributorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const { title, description, category, subject, tags } = data;
  return await prisma.resource.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(subject && { subject }),
      ...(tags && { tags: Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()) }),
    },
  });
};

export const deleteResource = async (id, user) => {
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) throw new Error('Resource not found');
  if (resource.contributorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return await prisma.resource.delete({ where: { id } });
};

export const saveResource = async (resourceId, userId) => {
  return await prisma.savedResource.upsert({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
    update: {},
    create: {
      userId,
      resourceId,
    },
  });
};

export const unsaveResource = async (resourceId, userId) => {
  return await prisma.savedResource.deleteMany({
    where: {
      userId,
      resourceId,
    },
  });
};

export const getSavedResources = async (userId) => {
  const saved = await prisma.savedResource.findMany({
    where: { userId },
    include: {
      resource: {
        include: {
          contributor: {
            select: { id: true, name: true, batchYear: true },
          },
        },
      },
    },
    orderBy: { savedAt: 'desc' },
  });

  return saved.map((s) => s.resource);
};

export default {
  listResources,
  getResourceById,
  createResource,
  uploadResourceFile,
  getResourceDownloadUrl,
  updateResource,
  deleteResource,
  saveResource,
  unsaveResource,
  getSavedResources,
};

