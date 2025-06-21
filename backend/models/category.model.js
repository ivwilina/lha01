const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    categoryTopic: {
      type: String,
      required: true,
    },
    totalWords: {
      type: Number,
      required: true,
      default: 0,
    },
    words: {
      type: Array,
      required: false
    }
  },
  { timestamps: true }
);

const category = mongoose.model("Category", categorySchema, "categories");

module.exports = category;
