import mongoose from 'mongoose';

const productTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

const ProductTag = mongoose.model('ProductTag', productTagSchema);
export default ProductTag;
