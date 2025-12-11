import express from 'express';
import ProductCollection from '../models/ProductCollection.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await ProductCollection.find().populate('products');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured collections
router.get('/featured', async (req, res) => {
  try {
    const collections = await ProductCollection.find({ featured: true }).populate('products');
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create collection (Admin)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { name, description, image, products, featured } = req.body;

    const collection = new ProductCollection({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      image,
      products,
      featured
    });

    const saved = await collection.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update collection (Admin)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const updated = await ProductCollection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete collection (Admin)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await ProductCollection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
