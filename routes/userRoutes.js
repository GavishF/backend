import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/users/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, firstName, lastName, email, password } = req.body;
    
    // Combine firstName/lastName if provided separately, otherwise use name
    const fullName = name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '');
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'name/firstName, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: fullName,
      email,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/users/google-login
// @desc    Login with Google OAuth token
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify token with Google
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`
    );

    const { email, name, picture } = response.data;

    if (!email) {
      return res.status(400).json({ message: 'Could not get email from Google' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: 'google-oauth-' + Math.random().toString(36).substr(2, 9), // Random password for OAuth users
        role: 'user'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/users/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/users
// @desc    Get current user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const fullName = user.name || '';
    res.json({
      _id: user._id,
      name: fullName,
      firstName: fullName.split(' ')[0] || '',
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      address: user.address || '',
      isActive: user.isActive
    });
  } catch (error) {
    console.error('GET / user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/all
// @desc    Get all users (admin endpoint)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/:id/toggle-block
// @desc    Toggle user block status
router.post('/:id/toggle-block', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      message: user.isActive ? 'User unblocked' : 'User blocked',
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/:id/toggle-role
// @desc    Toggle user admin role
router.post('/:id/toggle-role', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    
    res.json({ 
      success: true, 
      message: user.role === 'admin' ? 'User promoted to admin' : 'User role revoked',
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/send-otp
// @desc    Send OTP for password reset
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    if (!req.otpStore) req.otpStore = new Map();
    req.otpStore.set(email, {
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    const html = `
      <h2>Password Reset OTP</h2>
      <p>Your one-time password for password reset is:</p>
      <h1 style="color: #ff0000; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br/>Nikola Team</p>
    `;
    
    try {
      const sendEmail = (await import('../utils/emailService.js')).sendEmail;
      await sendEmail(email, 'Nikola Password Reset OTP', html);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.json({ message: 'OTP sent to email', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users/reset-password
// @desc    Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    }

    if (!req.otpStore) req.otpStore = new Map();
    const stored = req.otpStore.get(email);
    
    if (!stored || stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > stored.expiresAt) {
      req.otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();
    req.otpStore.delete(email);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
