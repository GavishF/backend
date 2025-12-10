const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  discount: { type: Number, required: true },
  type: { type: String, enum: ['wishlist', 'wheel', 'contest', 'popup'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prizeType: { type: String, enum: ['discount', 'free_shipping', 'gift'] },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  usedAt: Date,
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
