const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, date: 1 });

habitLogSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('HabitLog', habitLogSchema);
