import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['shipping', 'returns', 'payment', 'products', 'account', 'general'],
    required: true
  },
  displayOrder: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const FAQ = mongoose.model('FAQ', faqSchema);
export default FAQ;
