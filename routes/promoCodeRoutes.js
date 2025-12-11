import express from 'express';
import PromoCode from '../models/PromoCode.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all promo codes (Admin)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const codes = await PromoCode.find();
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate and apply promo code (Public)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    if (promoCode.expiryDate && new Date() > promoCode.expiryDate) {
      return res.status(400).json({ message: 'Promo code has expired' });
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    }

    if (orderAmount < promoCode.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ${promoCode.minOrderAmount} required` 
      });
    }

    let discount = 0;
    if (promoCode.discountType === 'percentage') {
      discount = (orderAmount * promoCode.discountValue) / 100;
    } else {
      discount = promoCode.discountValue;
    }

    res.json({
      valid: true,
      discount,
      discountType: promoCode.discountType,
      code: promoCode.code
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create promo code (Admin)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { code, description, discountType, discountValue, maxUses, minOrderAmount, expiryDate } = req.body;

    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxUses,
      minOrderAmount: minOrderAmount || 0,
      expiryDate,
      isActive: true
    });

    const saved = await promoCode.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update promo code (Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const updated = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete promo code (Admin)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo code deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
