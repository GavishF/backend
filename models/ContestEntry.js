const mongoose = require('mongoose');

const contestEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['spin', 'ornament', 'quiz'], default: 'spin' },
  isWinner: { type: Boolean, default: false },
  prizeCode: { type: String }
});

module.exports = mongoose.model('ContestEntry', contestEntrySchema);
