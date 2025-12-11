import express from 'express';
import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user loyalty points
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    let loyaltyPoints = await LoyaltyPoint.findOne({ userId: req.params.userId });
    
    if (!loyaltyPoints) {
      loyaltyPoints = new LoyaltyPoint({ userId: req.params.userId });
      await loyaltyPoints.save();
    }

    res.json(loyaltyPoints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add points (internal use - called after order)
router.post('/add/:userId', authenticateToken, async (req, res) => {
  try {
    const { points, orderId, type } = req.body;

    let loyaltyPoints = await LoyaltyPoint.findOne({ userId: req.params.userId });
    
    if (!loyaltyPoints) {
      loyaltyPoints = new LoyaltyPoint({ userId: req.params.userId });
    }

    loyaltyPoints.totalPoints += points;
    loyaltyPoints.transactions.push({
      orderId,
      points,
      type: type || 'purchase',
      date: new Date()
    });

    // Update tier based on points
    if (loyaltyPoints.totalPoints >= 5000) loyaltyPoints.tier = 'platinum';
    else if (loyaltyPoints.totalPoints >= 2000) loyaltyPoints.tier = 'gold';
    else if (loyaltyPoints.totalPoints >= 1000) loyaltyPoints.tier = 'silver';

    await loyaltyPoints.save();
    res.json(loyaltyPoints);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Redeem points
router.post('/redeem/:userId', authenticateToken, async (req, res) => {
  try {
    const { points } = req.body;

    const loyaltyPoints = await LoyaltyPoint.findOne({ userId: req.params.userId });
    
    if (!loyaltyPoints || loyaltyPoints.totalPoints < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    loyaltyPoints.totalPoints -= points;
    loyaltyPoints.redeemed += points;
    await loyaltyPoints.save();

    res.json({ remaining: loyaltyPoints.totalPoints });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
