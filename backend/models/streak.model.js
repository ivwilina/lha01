const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const streakSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    streakCount: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    }
  },
  { timestamps: true }
);

const streak = mongoose.model('Streak', streakSchema, 'streaks');
module.exports = streak;
