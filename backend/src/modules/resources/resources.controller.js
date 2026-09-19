import path from 'path';
import fs from 'fs';
import prisma from '../../config/db.js';
import * as resourcesService from './resources.service.js';

export const listResources = async (req, res, next) => {
  try {
    const result = await resourcesService.listResources(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getResource = async (req, res, next) => {
  try {
    const resource = await resourcesService.getResourceById(req.params.id, req.user?.id);
    res.json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const resource = await resourcesService.createResource(req.body, req.user);
    res.status(201).json({ success: true, message: 'Resource created successfully', resource });
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const resource = await resourcesService.uploadResourceFile(req.params.id, req.file, req.user);
    res.json({ success: true, message: 'File uploaded successfully', resource });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const resource = await resourcesService.updateResource(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'Resource updated', resource });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    await resourcesService.deleteResource(req.params.id, req.user);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    next(error);
  }
};

export const getDownload = async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const cleanFilename = (resource.title || 'resource')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '.' + (resource.fileType || 'pdf');

    const url = await resourcesService.getResourceDownloadUrl(req.params.id);
    res.json({ success: true, downloadUrl: url, filename: cleanFilename });
  } catch (error) {
    next(error);
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    // Increment downloads count
    await prisma.resource.update({
      where: { id: req.params.id },
      data: { downloadsCount: { increment: 1 } },
    });

    const cleanFilename = (resource.title || 'resource')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_') + '.' + (resource.fileType || 'pdf');

    // Check if local file exists
    if (resource.fileUrl && resource.fileUrl.startsWith('/uploads/')) {
      const localPath = path.join(process.cwd(), resource.fileUrl);
      if (fs.existsSync(localPath)) {
        res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
        return res.sendFile(localPath);
      }
    }

    // Otherwise redirect or return download URL
    const url = await resourcesService.getResourceDownloadUrl(req.params.id);
    if (url.startsWith('http')) {
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      return res.redirect(url);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
    res.json({ success: true, downloadUrl: url, filename: cleanFilename });
  } catch (error) {
    next(error);
  }
};

export const saveResource = async (req, res, next) => {
  try {
    await resourcesService.saveResource(req.params.id, req.user.id);
    res.json({ success: true, message: 'Resource saved' });
  } catch (error) {
    next(error);
  }
};

export const unsaveResource = async (req, res, next) => {
  try {
    await resourcesService.unsaveResource(req.params.id, req.user.id);
    res.json({ success: true, message: 'Resource unsaved' });
  } catch (error) {
    next(error);
  }
};

export const getSaved = async (req, res, next) => {
  try {
    const resources = await resourcesService.getSavedResources(req.user.id);
    res.json({ success: true, resources });
  } catch (error) {
    next(error);
  }
};

export default {
  listResources,
  getResource,
  createResource,
  uploadFile,
  updateResource,
  deleteResource,
  getDownload,
  saveResource,
  unsaveResource,
  getSaved,
};

