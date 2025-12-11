import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  uniqueCustomers: {
    type: Number,
    default: 0
  },
  topProducts: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    salesCount: Number,
    revenue: Number
  }],
  topCategories: [{
    category: String,
    salesCount: Number,
    revenue: Number
  }],
  averageOrderValue: Number,
  conversionRate: Number,
  pageViews: Number,
  averageSessionDuration: Number
}, {
  timestamps: true
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
