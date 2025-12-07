import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderItems: [{
    name: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    },
    size: { 
      type: String,
      default: ''
    },
    color: { 
      type: String,
      default: ''
    },
    productId: {
      type: String,
      default: ''
    }
  }],
  shippingAddress: {
    street: { 
      type: String, 
      default: 'Not provided' 
    },
    city: { 
      type: String, 
      default: 'Not provided' 
    },
    state: { 
      type: String,
      default: 'Not provided'
    },
    zipCode: { 
      type: String, 
      default: 'Not provided'
    },
    country: { 
      type: String, 
      default: 'Sri Lanka'
    },
    phone: {
      type: String,
      default: ''
    }
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  itemsPrice: {
    type: Number,
    default: 0
  },
  taxPrice: {
    type: Number,
    default: 0
  },
  shippingPrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Remove any existing indexes that might cause conflicts
orderSchema.index({ _id: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
