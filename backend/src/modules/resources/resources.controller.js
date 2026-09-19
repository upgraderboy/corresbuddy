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
    const url = await resourcesService.getResourceDownloadUrl(req.params.id);
    res.json({ success: true, downloadUrl: url });
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

