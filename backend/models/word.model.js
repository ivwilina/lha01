const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wordSchema = new Schema(
  {
    word: {
      type: String,
      required: true,
    },
    partOfSpeech: {
      type: String,
      required: true,
    },
    IPA: {
      type: String,
      required: true,
    },
    meaning: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      required: true,
    },
    exampleForQuiz: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const word = mongoose.model("Word", wordSchema, "words");

module.exports = word;
