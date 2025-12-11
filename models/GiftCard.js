import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  },
  recipientEmail: String,
  recipientName: String,
  senderName: String,
  message: String,
  expiryDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  purchasedBy: mongoose.Schema.Types.ObjectId,
  usedBy: mongoose.Schema.Types.ObjectId,
  transactions: [{
    orderId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    date: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
export default GiftCard;
