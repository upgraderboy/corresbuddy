import * as usersService from './users.service.js';

export const getUser = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    // Only allow self update unless admin
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this profile.' });
    }
    const user = await usersService.updateProfile(req.params.id, req.body);
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

export const getAcademic = async (req, res, next) => {
  try {
    const academic = await usersService.getAcademic(req.params.id);
    res.json({ success: true, academic });
  } catch (error) {
    next(error);
  }
};

export const updateAcademic = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update academic details.' });
    }
    const academic = await usersService.updateAcademic(req.params.id, req.body);
    res.json({ success: true, message: 'Academic details updated successfully', academic });
  } catch (error) {
    next(error);
  }
};

export const getContributions = async (req, res, next) => {
  try {
    const contributions = await usersService.getUserContributions(req.params.id);
    res.json({ success: true, contributions });
  } catch (error) {
    next(error);
  }
};

export const getStreak = async (req, res, next) => {
  try {
    const streak = await usersService.getUserStreak(req.params.id);
    res.json({ success: true, streak });
  } catch (error) {
    next(error);
  }
};

export default {
  getUser,
  updateProfile,
  getAcademic,
  updateAcademic,
  getContributions,
  getStreak,
};

