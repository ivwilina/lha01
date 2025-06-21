const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const learningSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    remembered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
    }],
  },
  { timestamps: true }
);

const learning = mongoose.model('Learning', learningSchema, 'learning');
module.exports = learning;
