const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema(
  {
    words: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
      required: true,
    }],
    questions: {
      type: Object,
      required: true,
    },
    numOfQuestion: {
      type: Number,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    logs: {
      type: Object,
      default: {},
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const quiz = mongoose.model('Quiz', quizSchema, 'quizzes');
module.exports = quiz;
