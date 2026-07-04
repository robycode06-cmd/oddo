import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1. Retrieve the token directly from cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_fallback');
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

export const verifyAdminOrHR = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  const { role } = req.user;
  if (role === 'Admin' || role === 'HR') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Requires Admin or HR privileges.' });
  }
};