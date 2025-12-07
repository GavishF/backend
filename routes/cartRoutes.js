import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function
const calculateTotal = (cart) => {
  return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
};

// @route   POST /api/cart/add
// @desc    Add item to cart (no auth required - frontend handles it)
router.post('/add', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    
    if (!productId || !qty) {
      return res.status(400).json({ 
        success: false,
        message: 'productId and qty are required' 
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart',
      item: { productId, qty }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/cart
// @desc    Get user's cart (requires auth)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      items: user.cart || [],
      total: calculateTotal(user.cart || [])
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   POST /api/cart/remove
// @desc    Remove item from cart
router.post('/remove', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: 'productId is required' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.cart) user.cart = [];
    user.cart = user.cart.filter(item => String(item.productId) !== String(productId));
    await user.save();
    
    res.json({ 
      success: true,
      items: user.cart,
      total: calculateTotal(user.cart)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    user.cart = [];
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Cart cleared', 
      items: [] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;
