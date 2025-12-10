const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const DiscountCode = require('../models/DiscountCode');
const ContestEntry = require('../models/ContestEntry');
const WishlistItem = require('../models/WishlistItem');
const auth = require('../middleware/auth');

// Generate unique discount code
const generateDiscountCode = (type = 'wishlist') => {
  const prefix = type === 'wheel' ? 'SPIN' : type === 'contest' ? 'CONTEST' : 'SANTA';
  const code = prefix + crypto.randomBytes(6).toString('hex').toUpperCase();
  return code;
};

// Create Santa's Wishlist item
router.post('/wishlist', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const wishlistItem = new WishlistItem({
      userId: req.user.id,
      productId,
      quantity,
      timestamp: new Date()
    });
    
    await wishlistItem.save();
    
    res.json({
      success: true,
      message: 'Added to Santa\'s Wishlist!',
      wishlistItem
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's Santa Wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const items = await WishlistItem.find({ userId: req.user.id })
      .populate('productId')
      .sort({ timestamp: -1 });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Santa Wishlist and get discount code
router.post('/wishlist/submit', auth, async (req, res) => {
  try {
    const { items } = req.body;
    
    const code = generateDiscountCode('wishlist');
    const discount = 10 + Math.random() * 15; // Random 10-25% discount
    
    const discountCode = new DiscountCode({
      code,
      discount: Math.round(discount),
      type: 'wishlist',
      userId: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      items
    });
    
    await discountCode.save();
    
    res.json({
      success: true,
      code,
      discount: Math.round(discount),
      message: `Your Santa code: ${code} - ${Math.round(discount)}% OFF!`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Spin the Wheel
router.post('/spin-wheel', auth, async (req, res) => {
  try {
    // Check if user already spun today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEntry = await DiscountCode.findOne({
      userId: req.user.id,
      type: 'wheel',
      createdAt: { $gte: today }
    });
    
    if (existingEntry) {
      return res.status(400).json({ 
        error: 'You already spun the wheel today! Come back tomorrow.' 
      });
    }
    
    // Random prize
    const prizes = [
      { discount: 5, type: 'discount' },
      { discount: 10, type: 'discount' },
      { discount: 15, type: 'discount' },
      { discount: 20, type: 'discount' },
      { discount: 25, type: 'discount' },
      { discount: 100, type: 'free_shipping' },
      { discount: 100, type: 'free_shipping' }
    ];
    
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    const code = generateDiscountCode('wheel');
    
    const discountCode = new DiscountCode({
      code,
      discount: prize.discount,
      type: 'wheel',
      userId: req.user.id,
      prizeType: prize.type,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    });
    
    await discountCode.save();
    
    res.json({
      success: true,
      code,
      prize: prize.type === 'free_shipping' ? 'Free Shipping' : `${prize.discount}% OFF`,
      discount: prize.discount,
      type: prize.type
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily deals (12 Days of Deals)
router.get('/daily-deals', async (req, res) => {
  try {
    const deals = [
      { day: 1, deal: '5% OFF', description: 'Welcome Deal' },
      { day: 2, deal: 'BOGO 50%', description: 'Buy One Get One 50% OFF' },
      { day: 3, deal: 'Free Shipping', description: 'On orders over $50' },
      { day: 4, deal: '15% OFF', description: 'Midnight Flash' },
      { day: 5, deal: '20% OFF', description: 'Everything' },
      { day: 6, deal: 'Free Gift', description: 'With purchase over $100' },
      { day: 7, deal: '25% OFF', description: 'Sweater Special' },
      { day: 8, deal: 'BOGO Free', description: 'Buy One Get One Free' },
      { day: 9, deal: '30% OFF', description: 'Accessories' },
      { day: 10, deal: '$25 Credit', description: 'On next purchase' },
      { day: 11, deal: '35% OFF', description: 'All Activewear' },
      { day: 12, deal: '50% OFF', description: 'Christmas Special' }
    ];
    
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contest entry (Limited Spots)
router.post('/contest/enter', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user already entered today
    const existingEntry = await ContestEntry.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });
    
    if (existingEntry) {
      return res.status(400).json({ 
        error: 'You already entered today! Try again tomorrow.' 
      });
    }
    
    // Check remaining spots (max 100 per day)
    const todayEntries = await ContestEntry.countDocuments({
      date: { $gte: today }
    });
    
    const SPOTS_LIMIT = 100;
    if (todayEntries >= SPOTS_LIMIT) {
      return res.status(400).json({ 
        error: 'All spots filled for today! Try again tomorrow.' 
      });
    }
    
    const entry = new ContestEntry({
      userId: req.user.id,
      date: new Date(),
      method: req.body.method || 'spin'
    });
    
    await entry.save();
    
    // Determine if winner
    const isWinner = Math.random() < 0.1; // 10% chance to win
    
    if (isWinner) {
      const code = generateDiscountCode('contest');
      const discount = 15 + Math.random() * 10; // 15-25%
      
      const discountCode = new DiscountCode({
        code,
        discount: Math.round(discount),
        type: 'contest',
        userId: req.user.id,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      });
      
      await discountCode.save();
      
      return res.json({
        success: true,
        isWinner: true,
        code,
        discount: Math.round(discount),
        message: `🎉 Congratulations! You won ${Math.round(discount)}% OFF! Code: ${code}`
      });
    }
    
    res.json({
      success: true,
      isWinner: false,
      spotsRemaining: SPOTS_LIMIT - todayEntries - 1,
      message: 'Entry submitted! Better luck tomorrow!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contest spots remaining
router.get('/contest/spots', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEntries = await ContestEntry.countDocuments({
      date: { $gte: today }
    });
    
    const SPOTS_LIMIT = 100;
    res.json({
      spotsRemaining: Math.max(0, SPOTS_LIMIT - todayEntries),
      spotsTotal: SPOTS_LIMIT
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active discount codes for user
router.get('/codes', auth, async (req, res) => {
  try {
    const codes = await DiscountCode.find({
      userId: req.user.id,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
