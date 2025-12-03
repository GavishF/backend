import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      items: user.cart || [],
      total: calculateTotal(user.cart || [])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, qty } = req.body;
    
    if (!productId || !qty) {
      return res.status(400).json({ message: 'productId and qty are required' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.cart) user.cart = [];

    const existingIndex = user.cart.findIndex(item => String(item.productId) === String(productId));
    
    if (existingIndex !== -1) {
      user.cart[existingIndex].quantity = (user.cart[existingIndex].quantity || 0) + qty;
    } else {
      user.cart.push({ productId, quantity: qty });
    }

    await user.save();
    
    res.json({ 
      items: user.cart,
      total: calculateTotal(user.cart)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/cart/remove
// @desc    Remove item from cart
router.post('/remove', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.cart) user.cart = [];

    user.cart = user.cart.filter(item => String(item.productId) !== String(productId));

    await user.save();
    
    res.json({ 
      items: user.cart,
      total: calculateTotal(user.cart)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();
    
    res.json({ message: 'Cart cleared', items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
}

export default router;
