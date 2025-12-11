import express from 'express';
import ReturnRefund from '../models/ReturnRefund.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Create return request (User)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { orderId, items, reason, description, images } = req.body;

    const returnRequest = new ReturnRefund({
      orderId,
      userId: req.userId,
      items,
      reason,
      description,
      images,
      status: 'pending'
    });

    const saved = await returnRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user returns (User)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const returns = await ReturnRefund.find({ userId: req.params.userId });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all returns (Admin)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const returns = await ReturnRefund.find().populate('orderId userId');
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update return status (Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status, refundAmount, rejectionReason, trackingNumber } = req.body;

    const updated = await ReturnRefund.findByIdAndUpdate(
      req.params.id,
      {
        status,
        refundAmount,
        rejectionReason,
        trackingNumber,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
