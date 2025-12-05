import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Simple in-memory storage for newsletter subscribers and promos
// In production, these would be stored in MongoDB
const newsletters = {
  subscribers: [],
  promos: [],
  otpStore: new Map()
};

// @route   POST /api/newsletter/send-otp
// @desc    Send OTP to email for newsletter subscription
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP (expires in 10 minutes)
    newsletters.otpStore.set(email, {
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Send OTP via email
    const html = `
      <h2>Newsletter Subscription OTP</h2>
      <p>Your one-time password for newsletter subscription is:</p>
      <h1 style="color: #ff0000; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br/>Nikola Team</p>
    `;
    
    await sendEmail(email, 'Nikola Newsletter Subscription OTP', html);
    console.log(`OTP sent to ${email}`);

    res.json({ message: 'OTP sent to email', success: true });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/newsletter/verify
// @desc    Verify OTP and subscribe to newsletter
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check OTP
    const stored = newsletters.otpStore.get(email);
    if (!stored) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > stored.expiresAt) {
      newsletters.otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Add to subscribers if not already there
    if (!newsletters.subscribers.includes(email)) {
      newsletters.subscribers.push(email);
    }

    // Clean up OTP
    newsletters.otpStore.delete(email);

    res.json({ message: 'Successfully subscribed to newsletter', success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/newsletter/subscribers
// @desc    Get all newsletter subscribers (admin only)
router.get('/subscribers', [authenticateToken, authorizeRole(['admin'])], async (req, res) => {
  try {
    res.json({ subscribers: newsletters.subscribers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/newsletter/promos
// @desc    Create a new promo (admin only)
router.post('/promos', [authenticateToken, authorizeRole(['admin'])], async (req, res) => {
  try {
    const { title, description, discount, code, expiresAt } = req.body;
    
    if (!title || !discount) {
      return res.status(400).json({ message: 'Title and discount are required' });
    }

    const promo = {
      _id: new mongoose.Types.ObjectId(),
      title,
      description,
      discount,
      code: code || `PROMO${Date.now()}`,
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    };

    newsletters.promos.push(promo);
    res.status(201).json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/newsletter/promos
// @desc    Get all active promos
router.get('/promos', async (req, res) => {
  try {
    const now = new Date();
    const activePromos = newsletters.promos.filter(p => new Date(p.expiresAt) > now);
    res.json(activePromos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/newsletter/broadcast
// @desc    Send broadcast to all newsletter subscribers (admin only)
router.post('/broadcast', [authenticateToken, authorizeRole(['admin'])], async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Send broadcast emails to all subscribers
    let sentCount = 0;
    for (const email of newsletters.subscribers) {
      try {
        await sendEmail(email, subject, message);
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
      }
    }

    res.json({ 
      message: `Broadcast sent to ${sentCount}/${newsletters.subscribers.length} subscribers`,
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
