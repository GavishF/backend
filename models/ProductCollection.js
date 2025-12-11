import mongoose from 'mongoose';

const productCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  image: String,
  products: [mongoose.Schema.Types.ObjectId],
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: Number
}, {
  timestamps: true
});

const ProductCollection = mongoose.model('ProductCollection', productCollectionSchema);
export default ProductCollection;
