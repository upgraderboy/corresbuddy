import * as authService from './auth.service.js';

export const sendOtp = async (req, res, next) => {
  try {
    const { email, name, purpose } = req.body;
    const result = await authService.sendOtp({ email, name, purpose });
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, code, purpose } = req.body;
    const result = await authService.verifyOtp({ email, code, purpose });
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: result.user,
      token: result.token,
      corresAssignment: result.corresAssignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientInfo = {
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Web Client',
    };
    const result = await authService.login(email, password, clientInfo);
    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

export default {
  sendOtp,
  verifyOtp,
  register,
  login,
  getMe,
  logout,
};
