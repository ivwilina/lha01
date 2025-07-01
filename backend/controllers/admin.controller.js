/**
 * ADMIN CONTROLLER
 * 
 * Xử lý tất cả các chức năng quản trị hệ thống:
 * - Authentication admin
 * - Dashboard statistics
 * - User management (CRUD)
 * - Category management (CRUD)  
 * - Word management (CRUD)
 * - Bulk import từ CSV/Excel
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const Admin = require('../models/admin.model');
const User = require('../models/user.model');
const Category = require('../models/category.model');
const Word = require('../models/word.model');
const Learning = require('../models/learning.model');
const Quiz = require('../models/quiz.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');

/**
 * Đăng nhập admin
 * 
 * @desc Xác thực admin bằng username/email và password
 * @route POST /admin/login
 * @access Public
 * @param {Object} req.body - { username, password }
 * @returns {Object} Token JWT và thông tin admin
 */
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username và password là bắt buộc' 
      });
    }

    // Tìm admin theo username hoặc email
    const admin = await Admin.findOne({ 
      $or: [{ username }, { email: username }],
      isActive: true 
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Thông tin đăng nhập không hợp lệ' 
      });
    }

    // Kiểm tra mật khẩu với bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Thông tin đăng nhập không hợp lệ' 
      });
    }

    // Cập nhật thời gian đăng nhập cuối
    admin.lastLogin = new Date();
    await admin.save();

    // Tạo JWT token với thời hạn 24h
    const token = jwt.sign(
      { 
        adminId: admin._id, 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'admin_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đăng nhập' 
    });
  }
};

/**
 * Lấy thống kê dashboard admin
 * 
 * @desc Trả về thống kê tổng quan hệ thống cho dashboard
 * @route GET /admin/dashboard/stats
 * @access Private (Admin only)
 * @returns {Object} Số liệu thống kê: users, categories, words, admins, userGrowth
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Đếm đồng thời tất cả entities trong database
    const [userCount, categoryCount, wordCount, adminCount] = await Promise.all([
      User.countDocuments(),
      Category.countDocuments(),
      Word.countDocuments(),
      Admin.countDocuments({ isActive: true })
    ]);

    // Thống kê tăng trưởng user trong 6 tháng gần nhất
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        users: userCount,
        categories: categoryCount,
        words: wordCount,
        admins: adminCount,
        userGrowth: userStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thống kê dashboard' 
    });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Tạo filter search
    const searchFilter = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      User.find(searchFilter)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(searchFilter)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách người dùng' 
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thông tin người dùng' 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.params.id;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Kiểm tra username và email unique (ngoại trừ user hiện tại)
    if (username !== user.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username đã tồn tại' 
        });
      }
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email đã tồn tại' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật người dùng' 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa người dùng' 
    });
  }
};

// Category Management
exports.getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const skip = (page - 1) * limit;
    const searchFilter = search ? {
      categoryTopic: { $regex: search, $options: 'i' }
    } : {};

    const [categories, total] = await Promise.all([
      Category.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Category.countDocuments(searchFilter)
    ]);

    // Transform data để phù hợp với frontend expectations
    const transformedCategories = categories.map(cat => ({
      _id: cat._id,
      name: cat.categoryTopic,
      displayName: cat.categoryTopic,
      description: `Chủ đề ${cat.categoryTopic} - ${cat.totalWords} từ vựng`,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      totalWords: cat.totalWords
    }));

    res.json({
      success: true,
      categories: transformedCategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách chủ đề' 
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, displayName, description } = req.body;

    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên và tên hiển thị là bắt buộc' 
      });
    }

    // Kiểm tra category đã tồn tại
    const existingCategory = await Category.findOne({ categoryTopic: name });
    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chủ đề đã tồn tại' 
      });
    }

    const category = new Category({
      categoryTopic: name,
      totalWords: 0,
      words: []
    });

    await category.save();

    // Transform response
    const transformedCategory = {
      _id: category._id,
      name: category.categoryTopic,
      displayName: displayName,
      description: description || `Chủ đề ${displayName} - ${category.totalWords} từ vựng`,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      totalWords: category.totalWords
    };

    res.status(201).json({
      success: true,
      message: 'Tạo chủ đề thành công',
      category: transformedCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo chủ đề' 
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, displayName, description } = req.body;
    const categoryId = req.params.id;

    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên và tên hiển thị là bắt buộc' 
      });
    }

    // Kiểm tra category tồn tại
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy chủ đề' 
      });
    }

    // Kiểm tra name unique (ngoại trừ category hiện tại)
    if (name !== category.categoryTopic) {
      const existingCategory = await Category.findOne({ 
        categoryTopic: name, 
        _id: { $ne: categoryId } 
      });
      if (existingCategory) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tên chủ đề đã tồn tại' 
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { categoryTopic: name },
      { new: true, runValidators: true }
    );

    // Transform response
    const transformedCategory = {
      _id: updatedCategory._id,
      name: updatedCategory.categoryTopic,
      displayName: displayName,
      description: description || `Chủ đề ${displayName} - ${updatedCategory.totalWords} từ vựng`,
      createdAt: updatedCategory.createdAt,
      updatedAt: updatedCategory.updatedAt,
      totalWords: updatedCategory.totalWords
    };

    res.json({
      success: true,
      message: 'Cập nhật chủ đề thành công',
      category: transformedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật chủ đề' 
    });
  }
};

/**
 * Xóa chủ đề và tất cả dữ liệu liên quan
 * 
 * @desc Xóa category, toàn bộ words, learning records và quiz records liên quan
 * @route DELETE /admin/categories/:id
 * @access Admin only
 * @param {String} req.params.id - ID của category cần xóa
 * @returns {Object} Thông báo kết quả và số lượng dữ liệu đã xóa
 */
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Kiểm tra category có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy chủ đề' 
      });
    }

    // Lấy danh sách IDs của words trong category
    const wordIds = category.words || [];
    let deletedWordsCount = 0;
    let deletedLearningRecords = 0;
    let deletedQuizRecords = 0;

    // Xóa tất cả words thuộc category này
    if (wordIds.length > 0) {
      const deletedWords = await Word.deleteMany({ _id: { $in: wordIds } });
      deletedWordsCount = deletedWords.deletedCount;
      console.log(`Deleted ${deletedWordsCount} words from category: ${category.categoryTopic}`);
      
      // Xóa learning records liên quan đến category này
      const deletedLearning = await Learning.deleteMany({ category: categoryId });
      deletedLearningRecords = deletedLearning.deletedCount;
      console.log(`Deleted ${deletedLearningRecords} learning records`);
      
      // Xóa quiz records có chứa words từ category này
      const deletedQuiz = await Quiz.deleteMany({ 
        words: { $in: wordIds }
      });
      deletedQuizRecords = deletedQuiz.deletedCount;
      console.log(`Deleted ${deletedQuizRecords} quiz records`);
    }

    // Xóa category
    await Category.findByIdAndDelete(categoryId);

    res.json({
      success: true,
      message: `Xóa chủ đề "${category.categoryTopic}" thành công`,
      deletedData: {
        words: deletedWordsCount,
        learningRecords: deletedLearningRecords,
        quizRecords: deletedQuizRecords
      }
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa chủ đề' 
    });
  }
};

// Word Management
exports.getAllWords = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '' } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Lấy tất cả categories trước
    const categories = await Category.find({});
    
    // Tạo filter
    let filter = {};
    if (search) {
      filter.$or = [
        { word: { $regex: search, $options: 'i' } },
        { meaning: { $regex: search, $options: 'i' } }
      ];
    }

    // Nếu filter theo category, tìm word IDs trong category đó
    let wordIdsInCategory = [];
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (categoryDoc && categoryDoc.words) {
        wordIdsInCategory = categoryDoc.words.map(id => typeof id === 'string' ? id : id.toString());
        filter._id = { $in: wordIdsInCategory };
      }
    }

    // Lấy words với filter
    const [words, total] = await Promise.all([
      Word.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Word.countDocuments(filter)
    ]);

    // Transform words để match với frontend expectations
    const transformedWords = words.map(word => {
      // Tìm category của word này từ categories
      let wordCategory = null;
      for (let cat of categories) {
        if (cat.words && cat.words.some(wordId => wordId.toString() === word._id.toString())) {
          wordCategory = {
            _id: cat._id,
            name: cat.categoryTopic,
            displayName: cat.categoryTopic
          };
          break;
        }
      }

      return {
        _id: word._id,
        english: word.word,
        vietnamese: word.meaning,
        category: wordCategory,
        pronunciation: word.IPA,
        example: word.example,
        partOfSpeech: word.partOfSpeech,
        exampleForQuiz: word.exampleForQuiz,
        createdAt: word.createdAt,
        updatedAt: word.updatedAt
      };
    });

    res.json({
      success: true,
      words: transformedWords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all words error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách từ vựng' 
    });
  }
};

exports.createWord = async (req, res) => {
  try {
    const { english, vietnamese, category, pronunciation, example, partOfSpeech } = req.body;

    // Validate required fields
    if (!english || !vietnamese || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Từ tiếng Anh, nghĩa tiếng Việt và chủ đề là bắt buộc' 
      });
    }

    // Kiểm tra từ vựng đã tồn tại
    const existingWord = await Word.findOne({ word: english.toLowerCase() });
    if (existingWord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Từ vựng đã tồn tại' 
      });
    }

    // Kiểm tra category tồn tại
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chủ đề không tồn tại' 
      });
    }

    const word = new Word({
      word: english.toLowerCase(),
      meaning: vietnamese,
      IPA: pronunciation || '',
      example: example || `Example with ${english}`,
      exampleForQuiz: example || `Example with ${english}`,
      partOfSpeech: partOfSpeech || 'noun'
    });

    await word.save();

    // Cập nhật category để thêm word này (đảm bảo lưu dưới dạng string)
    await Category.findByIdAndUpdate(
      category,
      { 
        $push: { words: word._id.toString() },
        $inc: { totalWords: 1 }
      }
    );

    // Transform response
    const transformedWord = {
      _id: word._id,
      english: word.word,
      vietnamese: word.meaning,
      category: {
        _id: categoryExists._id,
        name: categoryExists.categoryTopic,
        displayName: categoryExists.categoryTopic
      },
      pronunciation: word.IPA,
      example: word.example,
      partOfSpeech: word.partOfSpeech,
      exampleForQuiz: word.exampleForQuiz,
      createdAt: word.createdAt,
      updatedAt: word.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Tạo từ vựng thành công',
      word: transformedWord
    });
  } catch (error) {
    console.error('Create word error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo từ vựng' 
    });
  }
};

exports.updateWord = async (req, res) => {
  try {
    const { english, vietnamese, category, pronunciation, example, partOfSpeech } = req.body;
    const wordId = req.params.id;

    // Validate required fields
    if (!english || !vietnamese || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Từ tiếng Anh, nghĩa tiếng Việt và chủ đề là bắt buộc' 
      });
    }

    // Kiểm tra word tồn tại
    const word = await Word.findById(wordId);
    if (!word) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy từ vựng' 
      });
    }

    // Kiểm tra english unique (ngoại trừ word hiện tại)
    if (english.toLowerCase() !== word.word) {
      const existingWord = await Word.findOne({ 
        word: english.toLowerCase(), 
        _id: { $ne: wordId } 
      });
      if (existingWord) {
        return res.status(400).json({ 
          success: false, 
          message: 'Từ tiếng Anh đã tồn tại' 
        });
      }
    }

    // Kiểm tra category tồn tại
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chủ đề không tồn tại' 
      });
    }

    // Tìm category cũ để remove word (kiểm tra cả ObjectId và string)
    const oldCategory = await Category.findOne({ 
      words: { $in: [wordId, wordId.toString()] }
    });
    
    if (oldCategory && oldCategory._id.toString() !== category) {
      // Remove từ category cũ
      await Category.findByIdAndUpdate(
        oldCategory._id,
        { 
          $pull: { words: { $in: [wordId, wordId.toString()] } },
          $inc: { totalWords: -1 }
        }
      );
      
      // Thêm vào category mới (đảm bảo lưu dưới dạng string)
      await Category.findByIdAndUpdate(
        category,
        { 
          $push: { words: wordId.toString() },
          $inc: { totalWords: 1 }
        }
      );
    } else if (!oldCategory) {
      // Nếu word chưa có trong category nào thì thêm vào category mới
      await Category.findByIdAndUpdate(
        category,
        { 
          $push: { words: wordId.toString() },
          $inc: { totalWords: 1 }
        }
      );
    }

    const updatedWord = await Word.findByIdAndUpdate(
      wordId,
      { 
        word: english.toLowerCase(), 
        meaning: vietnamese, 
        IPA: pronunciation || word.IPA,
        example: example || word.example,
        exampleForQuiz: example || word.exampleForQuiz,
        partOfSpeech: partOfSpeech || word.partOfSpeech
      },
      { new: true, runValidators: true }
    );

    // Transform response
    const transformedWord = {
      _id: updatedWord._id,
      english: updatedWord.word,
      vietnamese: updatedWord.meaning,
      category: {
        _id: categoryExists._id,
        name: categoryExists.categoryTopic,
        displayName: categoryExists.categoryTopic
      },
      pronunciation: updatedWord.IPA,
      example: updatedWord.example,
      partOfSpeech: updatedWord.partOfSpeech,
      exampleForQuiz: updatedWord.exampleForQuiz,
      createdAt: updatedWord.createdAt,
      updatedAt: updatedWord.updatedAt
    };

    res.json({
      success: true,
      message: 'Cập nhật từ vựng thành công',
      word: transformedWord
    });
  } catch (error) {
    console.error('Update word error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật từ vựng' 
    });
  }
};

exports.deleteWord = async (req, res) => {
  try {
    const wordId = req.params.id;

    const word = await Word.findById(wordId);
    if (!word) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy từ vựng' 
      });
    }

    // Tìm và cập nhật category (kiểm tra cả ObjectId và string)
    const category = await Category.findOne({ 
      words: { $in: [wordId, wordId.toString()] }
    });
    
    if (category) {
      await Category.findByIdAndUpdate(
        category._id,
        { 
          $pull: { words: { $in: [wordId, wordId.toString()] } },
          $inc: { totalWords: -1 }
        }
      );
    }

    await Word.findByIdAndDelete(wordId);

    res.json({
      success: true,
      message: 'Xóa từ vựng thành công'
    });
  } catch (error) {
    console.error('Delete word error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa từ vựng' 
    });
  }
};

// Import/Export Management
exports.importCategoriesFromCSV = async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Xử lý dữ liệu và lưu vào MongoDB
        for (const row of results) {
          const { name, displayName, description } = row;

          // Validate required fields
          if (!name || !displayName) {
            continue; // Bỏ qua dòng này nếu thiếu thông tin
          }

          // Kiểm tra category đã tồn tại
          const existingCategory = await Category.findOne({ categoryTopic: name });
          if (existingCategory) {
            continue; // Bỏ qua nếu category đã tồn tại
          }

          const category = new Category({
            categoryTopic: name,
            totalWords: 0,
            words: []
          });

          await category.save();
        }

        res.json({
          success: true,
          message: 'Nhập khẩu danh sách chủ đề từ file CSV thành công'
        });
      });
  } catch (error) {
    console.error('Import categories from CSV error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi nhập khẩu danh sách chủ đề' 
    });
  }
};

exports.importWordsFromCSV = async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Xử lý dữ liệu và lưu vào MongoDB
        for (const row of results) {
          const { english, vietnamese, category, pronunciation, example, partOfSpeech } = row;

          // Validate required fields
          if (!english || !vietnamese || !category) {
            continue; // Bỏ qua dòng này nếu thiếu thông tin
          }

          // Kiểm tra từ vựng đã tồn tại
          const existingWord = await Word.findOne({ word: english.toLowerCase() });
          if (existingWord) {
            continue; // Bỏ qua nếu từ vựng đã tồn tại
          }

          // Kiểm tra category tồn tại
          const categoryExists = await Category.findById(category);
          if (!categoryExists) {
            continue; // Bỏ qua nếu category không tồn tại
          }

          const word = new Word({
            word: english.toLowerCase(),
            meaning: vietnamese,
            IPA: pronunciation || '',
            example: example || `Example with ${english}`,
            exampleForQuiz: example || `Example with ${english}`,
            partOfSpeech: partOfSpeech || 'noun'
          });

          await word.save();

          // Cập nhật category để thêm word này (đảm bảo lưu dưới dạng string)
          await Category.findByIdAndUpdate(
            category,
            { 
              $push: { words: word._id.toString() },
              $inc: { totalWords: 1 }
            }
          );
        }

        res.json({
          success: true,
          message: 'Nhập khẩu danh sách từ vựng từ file CSV thành công'
        });
      });
  } catch (error) {
    console.error('Import words from CSV error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi nhập khẩu danh sách từ vựng' 
    });
  }
};

exports.exportCategoriesToCSV = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();

    // Chuyển đổi dữ liệu thành định dạng CSV
    const csvData = categories.map(cat => ({
      name: cat.categoryTopic,
      displayName: cat.categoryTopic,
      description: `Chủ đề ${cat.categoryTopic} - ${cat.totalWords} từ vựng`,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      totalWords: cat.totalWords
    }));

    // Xuất file CSV
    const ws = xlsx.utils.json_to_sheet(csvData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Categories');
    const filePath = `exports/categories_${Date.now()}.xlsx`;
    xlsx.writeFile(wb, filePath);

    res.download(filePath, 'categories_export.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Lỗi khi tải file CSV' 
        });
      }

      // Xóa file sau khi tải xong
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Export categories to CSV error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xuất khẩu danh sách chủ đề' 
    });
  }
};

exports.exportWordsToCSV = async (req, res) => {
  try {
    const words = await Word.find({}).lean();

    // Chuyển đổi dữ liệu thành định dạng CSV
    const csvData = words.map(word => {
      const category = word.category ? word.category.name : 'Không xác định';
      return {
        english: word.word,
        vietnamese: word.meaning,
        category: category,
        pronunciation: word.IPA,
        example: word.example,
        partOfSpeech: word.partOfSpeech
      };
    });

    // Xuất file CSV
    const ws = xlsx.utils.json_to_sheet(csvData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Words');
    const filePath = `exports/words_${Date.now()}.xlsx`;
    xlsx.writeFile(wb, filePath);

    res.download(filePath, 'words_export.xlsx', (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Lỗi khi tải file CSV' 
        });
      }

      // Xóa file sau khi tải xong
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  } catch (error) {
    console.error('Export words to CSV error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xuất khẩu danh sách từ vựng' 
    });
  }
};

// Bulk Import Functions
exports.importWordsFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
    }

    const { categoryId } = req.body;
    
    // Kiểm tra category tồn tại
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Chủ đề không tồn tại'
      });
    }

    let words = [];
    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    try {
      if (fileExtension === 'csv') {
        // Parse CSV file
        words = await parseCSVFile(filePath);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel file
        words = await parseExcelFile(filePath);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận CSV hoặc Excel.'
        });
      }

      // Validate và transform data
      const validWords = [];
      const errors = [];

      for (let i = 0; i < words.length; i++) {
        const wordData = words[i];
        
        // Validate required fields
        if (!wordData.word || !wordData.meaning) {
          errors.push(`Dòng ${i + 1}: Thiếu từ tiếng Anh hoặc nghĩa tiếng Việt`);
          continue;
        }

        // Check if word already exists
        const existingWord = await Word.findOne({ word: wordData.word.toLowerCase() });
        if (existingWord) {
          errors.push(`Dòng ${i + 1}: Từ "${wordData.word}" đã tồn tại`);
          continue;
        }

        validWords.push({
          word: wordData.word.toLowerCase(),
          partOfSpeech: wordData.partOfSpeech || 'noun',
          IPA: wordData.IPA || '',
          meaning: wordData.meaning,
          example: wordData.example || `Example with ${wordData.word}`,
          exampleForQuiz: wordData.exampleForQuiz || wordData.example || `Example with ${wordData.word}`
        });
      }

      if (validWords.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có từ vựng hợp lệ nào để import',
          errors
        });
      }

      // Insert words to database
      const insertedWords = await Word.insertMany(validWords);

      // Update category with new words
      const wordIds = insertedWords.map(w => w._id.toString());
      await Category.findByIdAndUpdate(categoryId, {
        $push: { words: { $each: wordIds } },
        $inc: { totalWords: wordIds.length }
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `Import thành công ${insertedWords.length} từ vựng`,
        imported: insertedWords.length,
        errors: errors.length > 0 ? errors : null
      });

    } catch (parseError) {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }

  } catch (error) {
    console.error('Import words error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi import từ vựng: ' + error.message
    });
  }
};

exports.importCategoryWithWords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
    }

    const { categoryName, categoryDisplayName, categoryDescription } = req.body;

    if (!categoryName || !categoryDisplayName) {
      return res.status(400).json({
        success: false,
        message: 'Tên chủ đề và tên hiển thị là bắt buộc'
      });
    }

    // Kiểm tra category đã tồn tại
    const existingCategory = await Category.findOne({ categoryTopic: categoryName });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Chủ đề đã tồn tại'
      });
    }

    let words = [];
    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    try {
      if (fileExtension === 'csv') {
        words = await parseCSVFile(filePath);
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        words = await parseExcelFile(filePath);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận CSV hoặc Excel.'
        });
      }

      // Validate và transform data
      const validWords = [];
      const errors = [];

      for (let i = 0; i < words.length; i++) {
        const wordData = words[i];
        
        if (!wordData.word || !wordData.meaning) {
          errors.push(`Dòng ${i + 1}: Thiếu từ tiếng Anh hoặc nghĩa tiếng Việt`);
          continue;
        }

        const existingWord = await Word.findOne({ word: wordData.word.toLowerCase() });
        if (existingWord) {
          errors.push(`Dòng ${i + 1}: Từ "${wordData.word}" đã tồn tại`);
          continue;
        }

        validWords.push({
          word: wordData.word.toLowerCase(),
          partOfSpeech: wordData.partOfSpeech || 'noun',
          IPA: wordData.IPA || '',
          meaning: wordData.meaning,
          example: wordData.example || `Example with ${wordData.word}`,
          exampleForQuiz: wordData.exampleForQuiz || wordData.example || `Example with ${wordData.word}`
        });
      }

      if (validWords.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có từ vựng hợp lệ nào để import',
          errors
        });
      }

      // Insert words first
      const insertedWords = await Word.insertMany(validWords);
      const wordIds = insertedWords.map(w => w._id.toString());

      // Create category with words
      const newCategory = new Category({
        categoryTopic: categoryName,
        totalWords: wordIds.length,
        words: wordIds
      });

      await newCategory.save();

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `Tạo chủ đề "${categoryDisplayName}" với ${insertedWords.length} từ vựng thành công`,
        category: {
          _id: newCategory._id,
          name: newCategory.categoryTopic,
          displayName: categoryDisplayName,
          description: categoryDescription || `Chủ đề ${categoryDisplayName} - ${newCategory.totalWords} từ vựng`,
          totalWords: newCategory.totalWords
        },
        imported: insertedWords.length,
        errors: errors.length > 0 ? errors : null
      });

    } catch (parseError) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }

  } catch (error) {
    console.error('Import category with words error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi import chủ đề và từ vựng: ' + error.message
    });
  }
};

// Helper functions
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Hỗ trợ nhiều format header khác nhau
        const word = data.word?.trim() || data.english?.trim() || data.English?.trim();
        const meaning = data.meaning?.trim() || data.vietnamese?.trim() || data.Vietnamese?.trim();
        const pronunciation = data.IPA?.trim() || data.pronunciation?.trim() || data.Pronunciation?.trim();
        const example = data.example?.trim() || data.Example?.trim();
        const partOfSpeech = data.partOfSpeech?.trim() || data.part_of_speech?.trim() || 'noun';
        
        results.push({
          word: word,
          partOfSpeech: partOfSpeech,
          IPA: pronunciation,
          meaning: meaning,
          example: example,
          exampleForQuiz: data.exampleForQuiz?.trim() || example
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const parseExcelFile = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    return jsonData.map(row => {
      // Hỗ trợ nhiều format header khác nhau
      const word = row.word?.toString().trim() || row.english?.toString().trim() || row.English?.toString().trim();
      const meaning = row.meaning?.toString().trim() || row.vietnamese?.toString().trim() || row.Vietnamese?.toString().trim();
      const pronunciation = row.IPA?.toString().trim() || row.pronunciation?.toString().trim() || row.Pronunciation?.toString().trim();
      const example = row.example?.toString().trim() || row.Example?.toString().trim();
      const partOfSpeech = row.partOfSpeech?.toString().trim() || row.part_of_speech?.toString().trim() || 'noun';
      
      return {
        word: word,
        partOfSpeech: partOfSpeech,
        IPA: pronunciation,
        meaning: meaning,
        example: example,
        exampleForQuiz: row.exampleForQuiz?.toString().trim() || example
      };
    });
  } catch (error) {
    throw new Error('Lỗi khi đọc file Excel: ' + error.message);
  }
};
