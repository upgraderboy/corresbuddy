import * as adminService from './admin.service.js';

export const listUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers(req.query);
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await adminService.updateUserStatus(req.params.id, status);
    res.json({ success: true, message: 'Status updated', user });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await adminService.verifyUser(req.params.id);
    res.json({ success: true, message: 'User verified', user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

export const getReportedResources = async (req, res, next) => {
  try {
    const resources = await adminService.getReportedResources();
    res.json({ success: true, resources });
  } catch (error) {
    next(error);
  }
};

export const getReportedQuestions = async (req, res, next) => {
  try {
    const questions = await adminService.getReportedQuestions();
    res.json({ success: true, questions });
  } catch (error) {
    next(error);
  }
};

export const getReportedChat = async (req, res, next) => {
  try {
    const reports = await adminService.getReportedChat();
    res.json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

export const moderateResource = async (req, res, next) => {
  try {
    const { action } = req.body;
    await adminService.moderateResource(req.params.id, action);
    res.json({ success: true, message: `Resource ${action}d` });
  } catch (error) {
    next(error);
  }
};

export const moderateQuestion = async (req, res, next) => {
  try {
    const { action } = req.body;
    await adminService.moderateQuestion(req.params.id, action);
    res.json({ success: true, message: `Question ${action}d` });
  } catch (error) {
    next(error);
  }
};

export const moderateAnswer = async (req, res, next) => {
  try {
    const { action } = req.body;
    await adminService.moderateAnswer(req.params.id, action);
    res.json({ success: true, message: `Answer ${action}d` });
  } catch (error) {
    next(error);
  }
};

export default {
  listUsers,
  updateStatus,
  verifyUser,
  deleteUser,
  getReportedResources,
  getReportedQuestions,
  getReportedChat,
  moderateResource,
  moderateQuestion,
  moderateAnswer,
};

