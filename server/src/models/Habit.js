const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    icon: {
      type: String,
      default: '🌱',
    },
    type: {
      type: String,
      enum: ['fixed', 'custom'],
      required: true,
    },
    co2Estimate: {
      type: Number, 
      required: true,
      min: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { type: 'custom' } });

habitSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Habit', habitSchema);
