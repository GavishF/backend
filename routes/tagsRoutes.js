import express from 'express';
import ProductTag from '../models/ProductTag.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await ProductTag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create tag (Admin)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name } = req.body;
    const tag = new ProductTag({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    });
    const saved = await tag.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete tag (Admin)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await ProductTag.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
