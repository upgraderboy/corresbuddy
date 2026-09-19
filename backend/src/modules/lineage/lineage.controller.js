import * as lineageService from './lineage.service.js';

export const getMyLineage = async (req, res, next) => {
  try {
    const lineage = await lineageService.getLineageForUser(req.user.id);
    res.json({ success: true, ...lineage });
  } catch (error) {
    next(error);
  }
};

export const getUserLineage = async (req, res, next) => {
  try {
    const lineage = await lineageService.getLineageForUser(req.params.userId);
    res.json({ success: true, ...lineage });
  } catch (error) {
    next(error);
  }
};

export const getLineageResources = async (req, res, next) => {
  try {
    const resources = await lineageService.getLineageResources(req.params.userId);
    res.json({ success: true, resources });
  } catch (error) {
    next(error);
  }
};

export const getLineageContributions = async (req, res, next) => {
  try {
    const contributions = await lineageService.getLineageContributions(req.params.userId);
    res.json({ success: true, contributions });
  } catch (error) {
    next(error);
  }
};

export const getLineageOverview = async (req, res, next) => {
  try {
    const lineage = await lineageService.getLineageForUser(req.params.userId);
    res.json({
      success: true,
      currentBatch: lineage.currentBatch,
      rollNumber: lineage.rollNumber,
      generations: lineage.generations.map((g) => ({
        batch: g.batch,
        rollNumber: g.roll,
        userId: g.userId,
        name: g.name,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyLineage,
  getUserLineage,
  getLineageResources,
  getLineageContributions,
  getLineageOverview,
};

