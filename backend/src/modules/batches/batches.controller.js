import * as batchesService from './batches.service.js';

export const listBatches = async (req, res, next) => {
  try {
    const batches = await batchesService.listBatches(req.query);
    res.json({ success: true, batches });
  } catch (error) {
    next(error);
  }
};

export const getBatch = async (req, res, next) => {
  try {
    const batch = await batchesService.getBatchById(req.params.id);
    res.json({ success: true, batch });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const batch = await batchesService.createBatch(req.body);
    res.status(201).json({ success: true, message: 'Batch created', batch });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  try {
    const batch = await batchesService.updateBatch(req.params.id, req.body);
    res.json({ success: true, message: 'Batch updated', batch });
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req, res, next) => {
  try {
    await batchesService.deleteBatch(req.params.id);
    res.json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    next(error);
  }
};

export const getBatchStudents = async (req, res, next) => {
  try {
    const students = await batchesService.getBatchStudents(req.params.id);
    res.json({ success: true, students });
  } catch (error) {
    next(error);
  }
};

export default {
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStudents,
};

