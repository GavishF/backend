import mongoose from 'mongoose';

const loyaltyPointSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  transactions: [{
    orderId: mongoose.Schema.Types.ObjectId,
    points: Number,
    type: String,
    date: Date
  }],
  redeemed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const LoyaltyPoint = mongoose.model('LoyaltyPoint', loyaltyPointSchema);
export default LoyaltyPoint;
