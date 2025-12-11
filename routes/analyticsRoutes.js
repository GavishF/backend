import express from 'express';
import Analytics from '../models/Analytics.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get analytics (Admin)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const analytics = await Analytics.find().sort({ date: -1 }).limit(30);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics by date range
router.get('/range/:startDate/:endDate', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const analytics = await Analytics.find({
      date: {
        $gte: new Date(req.params.startDate),
        $lte: new Date(req.params.endDate)
      }
    }).sort({ date: 1 });
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record analytics (Internal - called after order)
router.post('/record', async (req, res) => {
  try {
    const {
      totalSales,
      totalOrders,
      uniqueCustomers,
      topProducts,
      topCategories,
      averageOrderValue,
      pageViews
    } = req.body;

    const analytics = new Analytics({
      totalSales,
      totalOrders,
      uniqueCustomers,
      topProducts,
      topCategories,
      averageOrderValue,
      pageViews,
      date: new Date()
    });

    await analytics.save();
    res.status(201).json(analytics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
