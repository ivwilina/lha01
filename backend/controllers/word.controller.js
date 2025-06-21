const mongoose = require("mongoose")
const Word = require("../models/word.model")
const Learning = require("../models/learning.model")
const Category = require("../models/category.model")

//* Create a new word
const create_new_word = async (req, res) => {
  try {
    const { word, partOfSpeech, ipa, meaning, example, exampleForQuiz } = req.body;

    // Validate request body
    if (!word || !partOfSpeech || !ipa || !meaning || !example || !exampleForQuiz) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newWord = await Word.create({ word, partOfSpeech, ipa, meaning, example, exampleForQuiz });
    res.status(200).json(newWord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* Create new words
const create_new_words = async (req, res) => {
  try {
    const words = req.body;

    // Validate request body
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array." });
    }

    const newWords = await Word.insertMany(words);
    res.status(200).json(newWords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
}

//* Get all words
const get_all_words = async (req, res) => {
  try {
    const allWords = await Word.find({});
    res.status(200).json(allWords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* Get words except remembered words in learning record
const get_words_except_remembered = async (req, res) => {
  try {
    const { learningId } = req.params;

    // Validate learningId
    if (!learningId) {
      return res.status(400).json({ message: "Learning ID is required." });
    }

    const learningRecord = await Learning.findById(learningId);
    if (!learningRecord) {
      return res.status(404).json({ message: "Learning record not found." });
    }

    const rememberedWords = learningRecord.remembered;
    const words = await Word.find({ _id: { $nin: rememberedWords } });

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* get words with ids
const get_words_with_ids = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "IDs must be a non-empty array." });
    }

    const words = await Word.find({ _id: { $in: ids } });
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Create a category with words
const create_category_with_words = async (req, res) => {
  try {
    const { categoryTopic, words } = req.body;

    // Validate category topic
    if (!categoryTopic) {
      return res.status(400).json({ message: "Category topic is required." });
    }

    // Validate words array
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: "Words must be a non-empty array." });
    }

    // Transform IPA keys to lowercase ipa if needed
    const transformedWords = words.map(word => {
      // Check if IPA exists and ipa doesn't
      if (word.IPA && !word.ipa) {
        return { ...word, ipa: word.IPA };
      }
      return word;
    });

    // Validate each word has all required fields
    const missingFields = transformedWords.map((word, index) => {
      const { word: wordText, partOfSpeech, ipa, meaning, example, exampleForQuiz } = word;
      if (!wordText || !partOfSpeech || !ipa || !meaning || !example || !exampleForQuiz) {
        return `Word at index ${index} is missing required fields`;
      }
      return null;
    }).filter(error => error !== null);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Some words are missing required fields.",
        details: missingFields
      });
    }

    try {
      // Insert words first (without using transactions)
      const newWords = await Word.insertMany(transformedWords);
      
      // Get the word IDs
      const wordIds = newWords.map(word => word._id);
      
      // Create the category with the word IDs and count
      const newCategory = await Category.create({
        categoryTopic,
        totalWords: wordIds.length,
        words: wordIds
      });

      // Fetch the category with populated words for the response
      const populatedCategory = await Category.findById(newCategory._id)
        .populate('words');

      res.status(200).json(populatedCategory);
    } catch (error) {
      // If words were created but category creation failed, try to clean up
      // This is best-effort cleanup without transactions
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create_new_word,
  get_all_words,
  create_new_words,
  get_words_except_remembered,
  create_category_with_words,
  get_words_with_ids
}