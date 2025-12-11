import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }],
  colors: [String],
  images: [String],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  // New fields for enhanced features
  tags: [String],
  variants: [{
    sku: String,
    size: String,
    color: String,
    price: Number,
    stock: Number
  }],
  badge: {
    type: String,
    enum: ['new', 'bestseller', 'sale', 'limited', 'none'],
    default: 'none'
  },
  sizeGuideCategory: String,
  minStockAlert: {
    type: Number,
    default: 10
  },
  preOrderAvailable: {
    type: Boolean,
    default: false
  },
  preOrderDate: Date,
  relatedProducts: [mongoose.Schema.Types.ObjectId],
  searchTerms: [String],
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true
});

// Add text index for full-text search
productSchema.index({ name: 'text', description: 'text', tags: 'text', searchTerms: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
