export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const allowed = allowedRoles.map((r) => r.toUpperCase());

    // Strict Admin check: Only admin@celestia-trichy.me has admin privileges
    if (allowed.includes('ADMIN')) {
      if (req.user.email !== 'admin@celestia-trichy.me' || userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Only the system administrator (admin@celestia-trichy.me) can access this resource.',
        });
      }
    }

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

export default authorizeRoles;
