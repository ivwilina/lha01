/**
 * CATEGORY CONTROLLER
 * 
 * Xử lý các chức năng liên quan đến chủ đề/danh mục:
 * - CRUD operations cho categories
 * - Lấy words trong category
 * - Lấy words theo IDs cụ thể
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const Category = require('../models/category.model');
const Word = require('../models/word.model');

/**
 * Tạo category mới
 * 
 * @desc Tạo chủ đề/danh mục từ vựng mới
 * @route POST /category/add
 * @access Public
 * @param {Object} req.body - { categoryTopic, totalWords?, words? }
 * @returns {Object} Category vừa tạo
 */
const create_category = async (req, res) => {
  try {
    const { categoryTopic, totalWords, words } = req.body;
    
    // Validate required fields
    if (!categoryTopic) {
      return res.status(400).json({ message: "Category topic is required" });
    }
    
    // Tạo category mới
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Lấy tất cả categories
 * 
 * @desc Trả về danh sách tất cả chủ đề trong hệ thống
 * @route GET /category/
 * @access Public
 * @returns {Array} Danh sách categories
 */
const get_all_categories = async (req, res) => {
  try {
    const allCategories = await Category.find({});
    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Lấy tất cả words trong một category
 * 
 * @desc Trả về danh sách từ vựng thuộc một chủ đề cụ thể
 * @route GET /category/words/:id
 * @access Public
 * @param {String} req.params.id - Category ID
 * @returns {Array} Danh sách words trong category
 */
const get_words_in_category = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm category theo ID
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).send("Category not found");
    }
    
    // Lấy danh sách word IDs từ category
    const wordsId = category.words;

    // Tìm tất cả words có ID trong danh sách
    const words = await Word.find({ _id: { $in: wordsId } });

    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Lấy category theo ID
 * 
 * @desc Trả về thông tin chi tiết của một category
 * @route GET /category/list/:id
 * @access Public
 * @param {String} req.params.id - Category ID
 * @returns {Object} Category object
 */
const get_category_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).send("Category not found");
    } else {
      res.status(200).json(category);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Cập nhật category theo ID
 * 
 * @desc Cập nhật thông tin của một category
 * @route PUT /category/update/:id  
 * @access Public
 * @param {String} req.params.id - Category ID
 * @param {Object} req.body - Dữ liệu cập nhật
 * @returns {Object} Category đã cập nhật
 */
const update_category_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndUpdate(id, req.body).exec();
    const updatedCategory = await Category.findById(id);
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Lấy words theo danh sách IDs cụ thể
 * 
 * @desc Trả về dữ liệu mẫu cho testing (placeholder function)
 * @route POST /category/words-with-ids
 * @access Public
 * @param {Object} req.body - { ids: Array }
 * @returns {Array} Danh sách words mẫu tương ứng với IDs
 */
const get_words_with_ids = async (req, res) => {
  try {
    const { ids } = req.body;
    
    // Validate input array
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        message: "Request body must contain an array of IDs" 
      });
    }
    
    // Trả về dữ liệu mẫu để testing (có thể thay bằng logic thật)
    const sampleWords = [
      { 
        _id: ids[0] || '1', 
        word: 'accept', 
        phonetic: 'ək\'sept', 
        partOfSpeech: 'Verb', 
        meaning: 'nhận, chấp nhận',
        example: 'We accept payment by Visa Electron, Visa, Switch, Maestro, Mastercard, JCB, Solo, check or cash.'
      },
      {
        _id: ids[1] || '2', 
        word: 'algorithm', 
        phonetic: 'ˈælɡərɪðm', 
        partOfSpeech: 'Noun', 
        meaning: 'thuật toán',
        example: 'The search engine uses a complex algorithm to rank websites.'
      },
      {
        _id: ids[2] || '3', 
        word: 'database', 
        phonetic: 'ˈdeɪtəbeɪs', 
        partOfSpeech: 'Noun', 
        meaning: 'cơ sở dữ liệu',
        example: 'The application stores all user information in a secure database.'
      }
    ];
    
    // Chỉ trả về số lượng từ vựng tương ứng với IDs được yêu cầu
    const limitedWords = sampleWords.slice(0, Math.min(ids.length, sampleWords.length));
    
    res.status(200).json(limitedWords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  create_category,
  get_all_categories,
  get_category_by_id,
  update_category_by_id,
  get_words_in_category,
  get_words_with_ids
}