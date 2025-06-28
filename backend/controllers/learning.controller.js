/**
 * LEARNING CONTROLLER
 * 
 * Xử lý các chức năng liên quan đến việc học của user:
 * - CRUD learning records
 * - Đánh dấu từ đã học/chưa học
 * - Theo dõi tiến độ học tập
 * - Cập nhật streak khi học
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const Learning = require('../models/learning.model.js');
const User = require('../models/user.model.js');
const Category = require('../models/category.model.js');
const Streak = require('../models/streak.model.js');

/**
 * Tạo learning record mới
 * 
 * @desc Tạo bản ghi học tập cho user và category cụ thể
 * @route POST /learning/add
 * @access Public
 * @param {Object} req.body - { user, category, remembered? }
 * @returns {Object} Learning record vừa tạo
 */
const create_learning_record = async (req, res) => {
  try {
    const { user, category } = req.body;

    // Validate required fields
    if (!user || !category) {
      return res.status(400).json({ message: "User ID and Category ID are required" });
    }

    // Kiểm tra user tồn tại
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra category tồn tại
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Tạo learning record mới
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

//* Mark word as learned (more convenient function)
const mark_word_as_learned = async (req, res) => {
  try {
    const { userId, categoryId, wordId } = req.body;

    // Validate required fields
    if (!userId || !categoryId || !wordId) {
      return res.status(400).json({ message: "User ID, Category ID, and Word ID are required" });
    }

    // Find or create learning record for this user and category
    let learningRecord = await Learning.findOne({ user: userId, category: categoryId });
    let isNewWord = false;
    
    if (!learningRecord) {
      // Create new learning record if it doesn't exist
      learningRecord = await Learning.create({
        user: userId,
        category: categoryId,
        remembered: [wordId]
      });
      isNewWord = true;
    } else {
      // Add word to remembered list if not already there
      if (!learningRecord.remembered.includes(wordId)) {
        learningRecord.remembered.push(wordId);
        await learningRecord.save();
        isNewWord = true;
      }
    }

    // Update streak if a new word was learned
    if (isNewWord) {
      console.log('New word learned, updating streak for user:', userId);
      await updateStreakForWordsLearned(userId, 1);
    } else {
      console.log('Word already learned, no streak update needed');
    }

    // Return the updated learning record with populated fields
    const populatedRecord = await Learning.findById(learningRecord._id)
      .populate('user')
      .populate('category')
      .populate('remembered');

    res.status(200).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Remove word from learned list
const unmark_word_as_learned = async (req, res) => {
  try {
    const { userId, categoryId, wordId } = req.body;

    // Validate required fields
    if (!userId || !categoryId || !wordId) {
      return res.status(400).json({ message: "User ID, Category ID, and Word ID are required" });
    }

    // Find learning record
    const learningRecord = await Learning.findOne({ user: userId, category: categoryId });
    
    if (!learningRecord) {
      return res.status(404).json({ message: "Learning record not found" });
    }

    // Remove word from remembered list
    learningRecord.remembered = learningRecord.remembered.filter(
      id => id.toString() !== wordId.toString()
    );
    await learningRecord.save();

    // Return the updated learning record with populated fields
    const populatedRecord = await Learning.findById(learningRecord._id)
      .populate('user')
      .populate('category')
      .populate('remembered');

    res.status(200).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get learning progress for a specific category and user
const get_learning_progress = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;

    // Find learning record
    const learningRecord = await Learning.findOne({ user: userId, category: categoryId })
      .populate('category')
      .populate('remembered');
    
    if (!learningRecord) {
      // Return empty progress if no learning record found
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json({
        user: userId,
        category: category,
        rememberedWordsCount: 0,
        totalWordsCount: category.totalWords || 0,
        progressPercentage: 0,
        remembered: []
      });
    }

    const rememberedWordsCount = learningRecord.remembered.length;
    const totalWordsCount = learningRecord.category.totalWords || 0;
    const progressPercentage = totalWordsCount > 0 ? (rememberedWordsCount / totalWordsCount) * 100 : 0;

    res.status(200).json({
      user: learningRecord.user,
      category: learningRecord.category,
      rememberedWordsCount,
      totalWordsCount,
      progressPercentage: Math.round(progressPercentage * 100) / 100, // Round to 2 decimal places
      remembered: learningRecord.remembered
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Mark multiple words as learned (useful for quiz completion)
const mark_multiple_words_as_learned = async (req, res) => {
  try {
    const { userId, categoryId, wordIds } = req.body;

    // Validate required fields
    if (!userId || !categoryId || !Array.isArray(wordIds)) {
      return res.status(400).json({ message: "User ID, Category ID, and Word IDs array are required" });
    }

    // Find or create learning record
    let learningRecord = await Learning.findOne({ user: userId, category: categoryId });
    
    if (!learningRecord) {
      learningRecord = await Learning.create({
        user: userId,
        category: categoryId,
        remembered: wordIds
      });
    } else {
      // Add new words to remembered list (avoid duplicates)
      const newWords = wordIds.filter(wordId => 
        !learningRecord.remembered.includes(wordId)
      );
      learningRecord.remembered.push(...newWords);
      await learningRecord.save();
    }

    // Return the updated learning record with populated fields
    const populatedRecord = await Learning.findById(learningRecord._id)
      .populate('user')
      .populate('category')
      .populate('remembered');

    res.status(200).json(populatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Helper function to update streak when words are learned
const updateStreakForWordsLearned = async (userId, wordsCount = 1) => {
  try {
    console.log('Updating streak for words learned, userId:', userId, 'wordsCount:', wordsCount);
    
    let streak = await Streak.findOne({ user: userId });
    
    if (!streak) {
      // Create new streak if doesn't exist
      streak = new Streak({
        user: userId,
        streakCount: 0,
        startDate: null,
        endDate: null
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // Check if this is a new streak day
    if (!streak.endDate || !isSameDay(streak.endDate, today)) {
      
      // Check if streak should continue
      if (streak.endDate && isYesterday(streak.endDate)) {
        // Continue streak
        streak.streakCount += 1;
        streak.endDate = today;
        console.log(`Streak continued: ${streak.streakCount} days`);
      } else if (streak.endDate && !isYesterday(streak.endDate)) {
        // Streak broken, restart
        streak.streakCount = 1;
        streak.startDate = today;
        streak.endDate = today;
        console.log('Streak broken, restarting with 1 day');
      } else {
        // First time or very first streak
        streak.streakCount = 1;
        streak.startDate = today;
        streak.endDate = today;
        console.log('Starting new streak: 1 day');
      }
    } else {
      console.log('Activity already recorded for today, streak unchanged');
    }

    await streak.save();
    console.log('Updated streak:', streak);
    return streak;
  } catch (error) {
    console.error('Error updating streak for words learned:', error);
    return null;
  }
};

// ...existing code...

module.exports = {
  create_learning_record,
  get_all_learning_records,
  get_learning_record_by_user_id,
  update_learning_record_by_id,
  delete_learning_record_by_id,
  add_word_to_learning_record,
  mark_word_as_learned,
  unmark_word_as_learned,
  get_learning_progress,
  mark_multiple_words_as_learned,
};