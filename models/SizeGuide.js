import mongoose from 'mongoose';

const sizeGuideSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true
  },
  measurements: [{
    size: String,
    chest: String,
    waist: String,
    length: String,
    sleeves: String,
    notes: String
  }],
  image: String,
  description: String
}, {
  timestamps: true
});

const SizeGuide = mongoose.model('SizeGuide', sizeGuideSchema);
export default SizeGuide;
