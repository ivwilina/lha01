const Learning = require('../models/learning.model.js');
const User = require('../models/user.model.js');
const Category = require('../models/category.model.js');

//* Create a new learning record
const create_learning_record = async (req, res) => {
  try {
    const { user, category } = req.body;

    // Validate required fields
    if (!user || !category) {
      return res.status(400).json({ message: "User ID and Category ID are required" });
    }

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    const newLearningRecord = await Learning.create(req.body);
    res.status(200).json(newLearningRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get all learning records
const get_all_learning_records = async (req, res) => {
  try {
    const allLearningRecords = await Learning.find({})
      .populate('user')
      .populate('category')
      .populate('remembered');
      
    res.status(200).json(allLearningRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get learning record by user ID
const get_learning_record_by_user_id = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const learningRecords = await Learning.find({ user: userId })
      .populate('category')
      .populate('remembered');
    
    if (!learningRecords || learningRecords.length === 0) {
      return res.status(404).json({ message: "No learning records found for this user" });
    }
    
    res.status(200).json(learningRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Update learning record by ID
const update_learning_record_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const learningRecord = await Learning.findById(id);
    if (!learningRecord) {
      return res.status(404).json({ message: "Learning record not found" });
    }
    
    // Update the record
    await Learning.findByIdAndUpdate(id, updates, { new: true });
    
    // Return the updated record
    const updatedRecord = await Learning.findById(id)
      .populate('user')
      .populate('category')
      .populate('remembered');
      
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Add a new word to the learning record
const add_word_to_learning_record = async (req, res) => {
  try {
    const { id } = req.params; // Learning record ID
    const { wordId } = req.body; // Word ID to add

    const learningRecord = await Learning.findById(id);
    if (!learningRecord) {
      return res.status(404).json({ message: "Learning record not found" });
    }

    if (!learningRecord.remembered.includes(wordId)) {
      learningRecord.remembered.push(wordId);
      await learningRecord.save();
    }

    res.status(200).json(learningRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Delete learning record by ID
const delete_learning_record_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    
    const learningRecord = await Learning.findById(id);
    if (!learningRecord) {
      return res.status(404).json({ message: "Learning record not found" });
    }
    
    await Learning.findByIdAndDelete(id);
    res.status(200).json({ message: "Learning record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create_learning_record,
  get_all_learning_records,
  get_learning_record_by_user_id,
  update_learning_record_by_id,
  delete_learning_record_by_id,
  add_word_to_learning_record,
};