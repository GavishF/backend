import mongoose from 'mongoose';

const returnRefundSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    reason: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'shipped', 'received', 'refunded'],
    default: 'pending'
  },
  refundAmount: Number,
  reason: String,
  description: String,
  images: [String],
  rejectionReason: String,
  trackingNumber: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  timestamps: true
});

const ReturnRefund = mongoose.model('ReturnRefund', returnRefundSchema);
export default ReturnRefund;
