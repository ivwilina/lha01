/**
 * SETUP SCRIPT - Khởi tạo hệ thống học từ vựng tiếng Anh
 * 
 * Script này sẽ:
 * 1. Tạo tài khoản admin mặc định
 * 2. Kiểm tra kết nối database
 * 3. Khởi tạo dữ liệu mẫu (nếu cần)
 * 4. Cài đặt các cấu hình cần thiết
 * 
 * Chạy: node setup.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Import models
const Admin = require('./models/admin.model');
const User = require('./models/user.model');
const Category = require('./models/category.model');
const Word = require('./models/word.model');

// Database configuration
const databaseName = "onlineStudyDB";
const url = `mongodb://localhost:27017/${databaseName}`;

/**
 * Kết nối đến MongoDB
 */
async function connectDatabase() {
  try {
    await mongoose.connect(url);
    console.log('✅ Kết nối database thành công!');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    return false;
  }
}

/**
 * Tạo tài khoản admin mặc định
 */
async function createDefaultAdmin() {
  try {
    // Kiểm tra xem đã có admin nào chưa
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('🔍 Tài khoản admin đã tồn tại:', existingAdmin.username);
      return;
    }

    // Tạo admin mặc định
    const defaultAdminData = {
      username: 'admin',
      email: 'admin@system.local',
      password: 'admin123', // Sẽ được hash
      role: 'super_admin',
      isActive: true
    };

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultAdminData.password, saltRounds);
    
    const newAdmin = new Admin({
      ...defaultAdminData,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: null
    });

    await newAdmin.save();
    
    console.log('✅ Tạo tài khoản admin mặc định thành công!');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu');
    
  } catch (error) {
    console.error('❌ Lỗi tạo admin:', error.message);
  }
}

/**
 * Kiểm tra và tạo thư mục uploads
 */
function createUploadDirectories() {
  const uploadDirs = [
    './uploads',
    './uploads/temp',
    './uploads/csv',
    './uploads/excel'
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Tạo thư mục: ${dir}`);
    }
  });
}

/**
 * Tạo file cấu hình môi trường mẫu
 */
function createEnvExample() {
  const envContent = `# Database Configuration
DB_NAME=onlineStudyDB
DB_URL=mongodb://localhost:27017/onlineStudyDB

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (Thay đổi trong production)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Admin Configuration
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
`;

  if (!fs.existsSync('.env.example')) {
    fs.writeFileSync('.env.example', envContent);
    console.log('📄 Tạo file .env.example');
  }
}

/**
 * Khởi tạo dữ liệu mẫu cơ bản
 */
async function initializeSampleData() {
  try {
    // Kiểm tra xem đã có dữ liệu chưa
    const categoryCount = await Category.countDocuments();
    const wordCount = await Word.countDocuments();
    
    if (categoryCount > 0 || wordCount > 0) {
      console.log('🔍 Dữ liệu đã tồn tại, bỏ qua việc tạo dữ liệu mẫu');
      return;
    }

    console.log('📊 Tạo dữ liệu mẫu...');

    // Tạo category mẫu
    const sampleCategories = [
      {
        categoryTopic: 'animals',
        totalWords: 0,
        words: []
      },
      {
        categoryTopic: 'colors',
        totalWords: 0,
        words: []
      },
      {
        categoryTopic: 'food',
        totalWords: 0,
        words: []
      }
    ];

    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ Tạo ${categories.length} chủ đề mẫu`);

    // Tạo words mẫu
    const sampleWords = [
      // Animals
      {
        word: 'cat',
        partOfSpeech: 'noun',
        ipa: '/kæt/',
        meaning: 'con mèo',
        example: 'The cat is sleeping on the sofa.',
        exampleForQuiz: 'The ____ is sleeping on the sofa.'
      },
      {
        word: 'dog',
        partOfSpeech: 'noun',
        ipa: '/dɒɡ/',
        meaning: 'con chó',
        example: 'My dog loves to play in the garden.',
        exampleForQuiz: 'My ____ loves to play in the garden.'
      },
      // Colors
      {
        word: 'red',
        partOfSpeech: 'adjective',
        ipa: '/red/',
        meaning: 'màu đỏ',
        example: 'She is wearing a red dress.',
        exampleForQuiz: 'She is wearing a ____ dress.'
      },
      {
        word: 'blue',
        partOfSpeech: 'adjective',
        ipa: '/bluː/',
        meaning: 'màu xanh dương',
        example: 'The sky is blue today.',
        exampleForQuiz: 'The sky is ____ today.'
      },
      // Food
      {
        word: 'apple',
        partOfSpeech: 'noun',
        ipa: '/ˈæpəl/',
        meaning: 'táo',
        example: 'I eat an apple every day.',
        exampleForQuiz: 'I eat an ____ every day.'
      }
    ];

    const words = await Word.insertMany(sampleWords);
    console.log(`✅ Tạo ${words.length} từ vựng mẫu`);

    // Cập nhật categories với words
    await Category.findByIdAndUpdate(categories[0]._id, {
      totalWords: 2,
      words: [words[0]._id, words[1]._id]
    });

    await Category.findByIdAndUpdate(categories[1]._id, {
      totalWords: 2,
      words: [words[2]._id, words[3]._id]
    });

    await Category.findByIdAndUpdate(categories[2]._id, {
      totalWords: 1,
      words: [words[4]._id]
    });

    console.log('✅ Dữ liệu mẫu đã được khởi tạo');

  } catch (error) {
    console.error('❌ Lỗi tạo dữ liệu mẫu:', error.message);
  }
}

/**
 * Kiểm tra các package cần thiết
 */
function checkRequiredPackages() {
  const requiredPackages = [
    'express',
    'mongoose',
    'bcrypt',
    'jsonwebtoken',
    'cors',
    'multer',
    'csv-parser',
    'xlsx'
  ];

  const packageJson = require('./package.json');
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const missingPackages = requiredPackages.filter(pkg => !dependencies[pkg]);

  if (missingPackages.length > 0) {
    console.log('⚠️  Các package còn thiếu:');
    missingPackages.forEach(pkg => console.log(`   - ${pkg}`));
    console.log('📥 Chạy: npm install ' + missingPackages.join(' '));
    return false;
  }

  console.log('✅ Tất cả package cần thiết đều đã được cài đặt');
  return true;
}

/**
 * Hiển thị thông tin hệ thống
 */
function displaySystemInfo() {
  console.log('\n🎉 THIẾT LẬP HỆ THỐNG HOÀN TẤT!');
  console.log('════════════════════════════════════════');
  console.log('📚 Hệ thống học từ vựng tiếng Anh');
  console.log('🌐 Backend API: http://localhost:3000');
  console.log('🖥️  Frontend: http://localhost:5173');
  console.log('🔧 Admin Panel: http://localhost:5173/admin-system-panel-access');
  console.log('────────────────────────────────────────');
  console.log('👤 Tài khoản admin:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('────────────────────────────────────────');
  console.log('🚀 Để khởi động hệ thống:');
  console.log('   Backend: npm run serve');
  console.log('   Frontend: npm run dev');
  console.log('════════════════════════════════════════\n');
}

/**
 * Main setup function
 */
async function setup() {
  console.log('🚀 Bắt đầu thiết lập hệ thống...\n');

  // 1. Kiểm tra packages
  if (!checkRequiredPackages()) {
    process.exit(1);
  }

  // 2. Kết nối database
  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    process.exit(1);
  }

  // 3. Tạo thư mục uploads
  createUploadDirectories();

  // 4. Tạo file cấu hình
  createEnvExample();

  // 5. Tạo admin mặc định
  await createDefaultAdmin();

  // 6. Tạo dữ liệu mẫu
  await initializeSampleData();

  // 7. Hiển thị thông tin
  displaySystemInfo();

  // Đóng kết nối
  await mongoose.disconnect();
  console.log('📝 Setup hoàn tất. Kết nối database đã đóng.');
}

// Chạy setup
if (require.main === module) {
  setup().catch(error => {
    console.error('❌ Lỗi trong quá trình setup:', error);
    process.exit(1);
  });
}

module.exports = {
  setup,
  connectDatabase,
  createDefaultAdmin,
  initializeSampleData
};
