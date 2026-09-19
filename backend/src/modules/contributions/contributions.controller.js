import * as contributionsService from './contributions.service.js';

export const createContribution = async (req, res, next) => {
  try {
    const { type, title, referenceId } = req.body;
    const contribution = await contributionsService.recordContribution({
      userId: req.user.id,
      type,
      title,
      referenceId,
      batchYear: req.user.batchYear || 2025,
    });
    res.status(201).json({ success: true, message: 'Contribution recorded', contribution });
  } catch (error) {
    next(error);
  }
};

export const getMyContributions = async (req, res, next) => {
  try {
    const contributions = await contributionsService.getMyContributions(req.user.id);
    res.json({ success: true, contributions });
  } catch (error) {
    next(error);
  }
};

export const listContributions = async (req, res, next) => {
  try {
    const contributions = await contributionsService.listContributions(req.query);
    res.json({ success: true, contributions });
  } catch (error) {
    next(error);
  }
};

export default {
  createContribution,
  getMyContributions,
  listContributions,
};

