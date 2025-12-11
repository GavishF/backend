import express from 'express';
import SizeGuide from '../models/SizeGuide.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all size guides
router.get('/', async (req, res) => {
  try {
    const guides = await SizeGuide.find();
    res.json(guides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get size guide by category
router.get('/:category', async (req, res) => {
  try {
    const guide = await SizeGuide.findOne({ category: req.params.category });
    if (!guide) {
      return res.status(404).json({ message: 'Size guide not found' });
    }
    res.json(guide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update size guide (Admin)
router.post('/:category', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { measurements, image, description } = req.body;
    const guide = await SizeGuide.findOneAndUpdate(
      { category: req.params.category },
      { category: req.params.category, measurements, image, description },
      { new: true, upsert: true }
    );
    res.json(guide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete size guide (Admin)
router.delete('/:category', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await SizeGuide.deleteOne({ category: req.params.category });
    res.json({ message: 'Size guide deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
