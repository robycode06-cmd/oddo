import Employee from '../model/Employee.js';
import jwt from 'jsonwebtoken';

/**
 * Handles user login and sets token in HttpOnly Cookie
 */
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Login ID and password are required.' });
    }

    const employee = await Employee.findOne({ loginId: loginId.toUpperCase() });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid Login ID or password.' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Login ID or password.' });
    }

    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET || 'your_jwt_secret_fallback',
      { expiresIn: '24h' }
    );

    // Set the JWT token in an HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Sent only over HTTPS in production
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 24 hours
    });

    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: employee._id,
        loginId: employee.loginId,
        email: employee.email,
        role: employee.role,
        profile: employee.profile
      }
    });

  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({ message: 'Internal Server Error during login.' });
  }
};

/**
 * Handles user logout and clears HttpOnly Cookie
 */
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.status(200).json({ message: 'Logged out successfully.' });
};