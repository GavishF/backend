import express from 'express';
import GiftCard from '../models/GiftCard.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate random code
function generateGiftCardCode() {
  return 'GC' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Create gift card (Authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { amount, recipientEmail, recipientName, senderName, message, expiryDate } = req.body;

    const giftCard = new GiftCard({
      code: generateGiftCardCode(),
      amount,
      balance: amount,
      recipientEmail,
      recipientName,
      senderName,
      message,
      expiryDate,
      purchasedBy: req.userId
    });

    const saved = await giftCard.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Redeem gift card
router.post('/redeem/:code', authenticateToken, async (req, res) => {
  try {
    const giftCard = await GiftCard.findOne({ code: req.params.code.toUpperCase() });

    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    if (!giftCard.isActive) {
      return res.status(400).json({ message: 'Gift card is inactive' });
    }

    if (giftCard.expiryDate && new Date() > giftCard.expiryDate) {
      return res.status(400).json({ message: 'Gift card has expired' });
    }

    if (giftCard.balance <= 0) {
      return res.status(400).json({ message: 'Gift card has no balance' });
    }

    giftCard.usedBy = req.userId;
    await giftCard.save();

    res.json({ balance: giftCard.balance, code: giftCard.code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check balance
router.get('/balance/:code', async (req, res) => {
  try {
    const giftCard = await GiftCard.findOne({ code: req.params.code.toUpperCase() });
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }
    res.json({ balance: giftCard.balance, isActive: giftCard.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
