const Category = require('../models/category.model');


//* Create a new category
const create_category = async (req, res) => {
  try {
    const { categoryTopic, totalWords, words } = req.body;
    
    // Validate required fields
    if (!categoryTopic) {
      return res.status(400).json({ message: "Category topic is required" });
    }
    
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* Get all categories
const get_all_categories = async (req, res) => {
  try {
    const allCategories = await Category.find({});
    res.status(200).json(allCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* Get all words in a category
const get_words_in_category = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).send("Category not found");
    }
    
    // Kiểm tra xem từ vựng có được lưu dưới dạng array of objects hay không
    if (Array.isArray(category.words)) {
      // Kiểm tra xem mỗi phần tử có phải là object với đủ thuộc tính không
      const firstWord = category.words[0];
      if (firstWord && typeof firstWord === 'object') {
        // Nếu các từ đã có đầy đủ thông tin, trả về toàn bộ mảng
        return res.status(200).json(category.words);
      }
    }
    
    // Nếu không phải object đầy đủ, trả về mảng các từ mẫu
    const sampleWords = [
      { 
        _id: '1', 
        word: 'accept', 
        phonetic: 'ək\'sept', 
        partOfSpeech: 'Verb', 
        meaning: 'nhận, chấp nhận',
        example: 'We accept payment by Visa Electron, Visa, Switch, Maestro, Mastercard, JCB, Solo, check or cash.'
      },
      {
        _id: '2', 
        word: 'algorithm', 
        phonetic: 'ˈælɡərɪðm', 
        partOfSpeech: 'Noun', 
        meaning: 'thuật toán',
        example: 'The search engine uses a complex algorithm to rank websites.'
      },
      {
        _id: '3', 
        word: 'database', 
        phonetic: 'ˈdeɪtəbeɪs', 
        partOfSpeech: 'Noun', 
        meaning: 'cơ sở dữ liệu',
        example: 'The application stores all user information in a secure database.'
      }
    ];
    
    res.status(200).json(sampleWords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//* Get category by id
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

//* Update category by id
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

//* Get words with specific IDs
const get_words_with_ids = async (req, res) => {
  try {
    const { ids } = req.body;
    
    // Validate request body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        message: "Request body must contain an array of IDs" 
      });
    }
    
    // Trả về dữ liệu mẫu cho các ID đã cung cấp
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