import express from 'express';
import FAQ from '../models/FAQ.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all FAQs (Public)
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get FAQs by category (Public)
router.get('/category/:category', async (req, res) => {
  try {
    const faqs = await FAQ.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ displayOrder: 1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create FAQ (Admin)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { question, answer, category, displayOrder } = req.body;

    const faq = new FAQ({
      question,
      answer,
      category,
      displayOrder,
      isActive: true
    });

    const saved = await faq.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update FAQ (Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const updated = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete FAQ (Admin)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
