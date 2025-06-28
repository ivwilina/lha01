# 📚 HỆ THỐNG HỌC TỪ VỰNG TIẾNG ANH

## 🎯 Tổng quan dự án

Hệ thống học từ vựng tiếng Anh là một ứng dụng web full-stack được phát triển để hỗ trợ người dùng học từ vựng hiệu quả thông qua nhiều phương pháp tương tác.

### ✨ Tính năng chính:
- **🎴 Flashcard System**: Học từ vựng theo chủ đề với flashcard tương tác
- **🎯 Quiz System**: Kiểm tra kiến thức với nhiều dạng câu hỏi đa dạng
- **⚡ Streak System**: Theo dõi chuỗi ngày học liên tục, tạo động lực
- **📊 Progress Tracking**: Theo dõi tiến độ học tập chi tiết
- **👨‍💼 Admin Panel**: Quản lý hệ thống và import dữ liệu hàng loạt
- **📱 Responsive Design**: Tương thích mọi thiết bị

---

## 🏗️ Kiến trúc hệ thống

### Backend (Node.js + Express)
```
📦 Backend Architecture
├── 🗄️  Database Layer (MongoDB + Mongoose)
├── 🎮 Controller Layer (Business Logic)
├── 🛣️  Route Layer (API Endpoints)
├── 🔒 Middleware Layer (Auth, Upload, Validation)
└── 📁 Models Layer (Data Schemas)
```

### Frontend (React + Vite)
```
📦 Frontend Architecture  
├── 🎨 UI Layer (React Components)
├── 🌐 API Layer (HTTP Client)
├── 🎛️  State Management (Context API)
├── 🎯 Routing Layer (React Router)
└── 💄 Styling Layer (CSS3)
```

---

## 📂 Cấu trúc project

### 🗂️ Backend Structure:
```
backend/
├── 📋 controllers/              # Logic xử lý business
│   ├── 👨‍💼 admin.controller.js      # Admin management
│   ├── 📚 category.controller.js    # Category CRUD
│   ├── 📖 learning.controller.js    # Learning progress
│   ├── 🎯 quiz.controller.js        # Quiz system
│   ├── ⚡ streak.controller.js      # Streak tracking
│   ├── 👤 user.controller.js        # User management
│   └── 📝 word.controller.js        # Word CRUD
├── 🗃️  models/                  # Database schemas
│   ├── 👨‍💼 admin.model.js          # Admin schema
│   ├── 📚 category.model.js        # Category schema
│   ├── 📖 learning.model.js        # Learning record schema
│   ├── 🎯 quiz.model.js            # Quiz schema
│   ├── ⚡ streak.model.js          # Streak schema
│   ├── 👤 user.model.js            # User schema
│   └── 📝 word.model.js            # Word schema
├── 🛣️  routes/                  # API routes definition
├── 🔧 middleware/               # Custom middleware
├── 📊 data/                     # Sample data files
├── 📁 uploads/                  # File upload directory
├── ⚙️  index.js                 # Main server file
├── 🚀 setup.js                  # System initialization
└── 📄 package.json              # Dependencies & scripts
```

### 🖼️ Frontend Structure:
```
onlineStudy/
├── 📱 src/
│   ├── 🧩 components/           # Reusable UI components
│   │   ├── 🎴 ImportModal.jsx      # File import modal
│   │   ├── 🧭 NavBar.jsx           # Navigation bar
│   │   ├── ⚡ StreakCounter.jsx    # Streak display
│   │   └── 📊 UserStats.jsx        # User statistics
│   ├── 📄 pages/                # Page components
│   │   ├── 🔐 auth/               # Login/Register pages
│   │   ├── 👨‍💼 admin/              # Admin panel pages
│   │   ├── 🎴 flashcard/          # Flashcard pages
│   │   ├── 🎯 quiz/               # Quiz pages
│   │   ├── 🏠 home/               # Home pages
│   │   └── ⚡ streak/             # Streak pages
│   ├── 🌐 api/                  # API client functions
│   │   ├── 👨‍💼 adminApi.js          # Admin API calls
│   │   ├── 🔐 authApi.js           # Auth API calls
│   │   ├── 🎴 flashcardApi.js      # Flashcard API calls
│   │   └── ⚡ streakApi.js         # Streak API calls
│   ├── 🎛️  context/              # React contexts
│   │   ├── 🔐 AuthContext.js       # Authentication context
│   │   └── 🔗 AuthProvider.jsx     # Auth provider wrapper
│   ├── 💄 style/                # CSS styling files
│   └── 🖼️  assets/               # Static assets (icons, images)
├── 🌍 public/                   # Public static files
├── ⚙️  vite.config.js           # Vite configuration
└── 📄 package.json              # Dependencies & scripts
```

---

## 🔧 Công nghệ sử dụng

### Backend Stack:
- **🟢 Node.js**: JavaScript runtime
- **⚡ Express.js**: Web application framework
- **🍃 MongoDB**: NoSQL database
- **🦴 Mongoose**: MongoDB object modeling
- **🔒 bcrypt**: Password hashing
- **🎫 JWT**: Authentication tokens
- **📂 Multer**: File upload handling
- **📊 csv-parser**: CSV file processing
- **📈 xlsx**: Excel file processing

### Frontend Stack:
- **⚛️ React 18**: UI library
- **⚡ Vite**: Build tool and dev server
- **🧭 React Router**: Client-side routing
- **🎯 Context API**: State management
- **💄 CSS3**: Styling and animations
- **📱 Responsive Design**: Mobile-first approach

### Development Tools:
- **📦 npm**: Package manager
- **🔧 ESLint**: Code linting
- **🎨 VS Code**: Development environment
- **🧪 Thunder Client**: API testing

---

## 📊 Database Schema

### 👤 Users Collection:
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### 📚 Categories Collection:
```javascript
{
  _id: ObjectId,
  categoryTopic: String,
  totalWords: Number,
  words: [ObjectId], // References to Word documents
  createdAt: Date,
  updatedAt: Date
}
```

### 📝 Words Collection:
```javascript
{
  _id: ObjectId,
  word: String,
  partOfSpeech: String,
  ipa: String, // International Phonetic Alphabet
  meaning: String,
  example: String,
  exampleForQuiz: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 📖 Learning Collection:
```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to User
  category: ObjectId, // Reference to Category
  remembered: [ObjectId], // References to remembered Words
  createdAt: Date,
  updatedAt: Date
}
```

### ⚡ Streaks Collection:
```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to User
  streakCount: Number,
  startDate: Date,
  endDate: Date,
  history: [{
    date: Date,
    wordsLearned: Number,
    quizzesCompleted: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 🎯 Quizzes Collection:
```javascript
{
  _id: ObjectId,
  words: [ObjectId], // References to Words
  questions: Object, // Generated questions
  numOfQuestion: Number,
  createdDate: Date,
  logs: Object, // User submission logs
  summary: String
}
```

### 👨‍💼 Admins Collection:
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String, // 'admin' | 'super_admin'
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🌐 API Endpoints

### 👤 User APIs:
```
POST   /user/create        # Đăng ký user mới
POST   /user/check         # Kiểm tra user tồn tại
POST   /user/login         # Đăng nhập user
```

### 📚 Category APIs:
```
GET    /category/          # Lấy tất cả categories
POST   /category/add       # Tạo category mới
GET    /category/list/:id  # Lấy category theo ID
GET    /category/words/:id # Lấy words trong category
PUT    /category/update/:id # Cập nhật category
POST   /category/words-with-ids # Lấy words theo IDs
```

### 📝 Word APIs:
```
GET    /word/get           # Lấy tất cả words
POST   /word/add           # Tạo word mới
POST   /word/add/many      # Tạo nhiều words
POST   /word/get/with-ids  # Lấy words theo IDs
GET    /word/get/except/:learningId # Lấy words chưa học
POST   /word/add/category-with-words # Tạo category + words
```

### 📖 Learning APIs:
```
POST   /learning/add                    # Tạo learning record
GET    /learning/get                    # Lấy tất cả learning records
GET    /learning/get/:userId           # Lấy learning theo user
PUT    /learning/update/:id            # Cập nhật learning record
PUT    /learning/add-remembered/:id    # Thêm word đã nhớ
POST   /learning/mark-learned          # Đánh dấu word đã học
POST   /learning/unmark-learned        # Bỏ đánh dấu word
GET    /learning/progress/:userId/:categoryId # Tiến độ học
POST   /learning/mark-multiple-learned # Đánh dấu nhiều words
DELETE /learning/delete/:id            # Xóa learning record
```

### 🎯 Quiz APIs:
```
POST   /quiz/create-category           # Tạo quiz theo category
POST   /quiz/create-comprehensive     # Tạo quiz tổng hợp
POST   /quiz/create-random            # Tạo quiz ngẫu nhiên
POST   /quiz/create                   # Tạo quiz (legacy)
GET    /quiz/:id                      # Lấy quiz theo ID
POST   /quiz/:id/submit               # Nộp bài quiz
GET    /quiz/history/:userId          # Lịch sử quiz user
```

### ⚡ Streak APIs:
```
POST   /streak/initialize             # Khởi tạo streak
PUT    /streak/update-words           # Cập nhật khi học từ
PUT    /streak/update-quizz           # Cập nhật khi làm quiz
GET    /streak/current/:userId        # Lấy streak hiện tại
GET    /streak/stats/:userId          # Thống kê streak
GET    /streak/history/:userId        # Lịch sử streak
PUT    /streak/reset                  # Reset streak
```

### 👨‍💼 Admin APIs:
```
POST   /admin/login                   # Admin đăng nhập
GET    /admin/dashboard/stats         # Thống kê dashboard

# User Management
GET    /admin/users                   # Lấy danh sách users
GET    /admin/users/:id               # Lấy user theo ID
PUT    /admin/users/:id               # Cập nhật user
DELETE /admin/users/:id               # Xóa user

# Category Management  
GET    /admin/categories              # Lấy danh sách categories
POST   /admin/categories              # Tạo category mới
PUT    /admin/categories/:id          # Cập nhật category
DELETE /admin/categories/:id          # Xóa category

# Word Management
GET    /admin/words                   # Lấy danh sách words
POST   /admin/words                   # Tạo word mới
PUT    /admin/words/:id               # Cập nhật word
DELETE /admin/words/:id               # Xóa word

# Bulk Import
POST   /admin/words/import            # Import words từ file
POST   /admin/categories/import-with-words # Import category + words
GET    /admin/words/export            # Export words ra CSV
```

---

## 🚀 Hướng dẫn cài đặt

### 📋 Yêu cầu hệ thống:
- **Node.js** v16.0.0 trở lên
- **MongoDB** v4.4 trở lên  
- **npm** hoặc **yarn**
- **2GB RAM** minimum
- **1GB** dung lượng ổ cứng

### 🔧 Bước cài đặt:

#### 1️⃣ Clone repository:
```bash
git clone <repository-url>
cd prj
```

#### 2️⃣ Cài đặt dependencies:
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../onlineStudy
npm install
```

#### 3️⃣ Thiết lập MongoDB:
```bash
# Windows
mongod --dbpath="C:\data\db"

# macOS/Linux
sudo service mongod start
```

#### 4️⃣ Khởi tạo hệ thống:
```bash
cd backend
node setup.js
```

#### 5️⃣ Khởi động servers:
```bash
# Backend (Terminal 1)
cd backend
npm run serve

# Frontend (Terminal 2)
cd onlineStudy  
npm run dev
```

### 🌐 Truy cập hệ thống:
- **Website**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin-system-panel-access
- **API Server**: http://localhost:3000

**Tài khoản admin mặc định**:
- Username: `admin`
- Password: `admin123`

---

## 💡 Tính năng nổi bật

### 🎴 Flashcard System:
- **Adaptive Learning**: Hệ thống ghi nhớ words đã học/chưa học
- **Spaced Repetition**: Ưu tiên hiển thị words chưa thuộc
- **Progress Tracking**: Theo dõi % tiến độ từng category
- **Interactive UI**: Flip animation, audio pronunciation

### 🎯 Quiz System:
- **Multiple Question Types**: 
  - Multiple Choice (4 đáp án)
  - Fill in the Blank (điền từ thiếu)
  - Complete Word (hoàn thành từ)
  - Word Matching (ghép nghĩa)
- **Adaptive Difficulty**: Dựa trên words đã học
- **Instant Feedback**: Kết quả ngay lập tức
- **Detailed Results**: Phân tích đáp án đúng/sai

### ⚡ Streak System:
- **Daily Tracking**: Theo dõi hoạt động hàng ngày
- **Motivation**: Gamification để tạo động lực
- **History View**: Xem lịch sử 7 ngày gần nhất
- **Auto Reset**: Tự động reset nếu quá 1 ngày không học

### 👨‍💼 Admin Panel:
- **User Management**: CRUD users, view statistics
- **Content Management**: CRUD categories và words
- **Bulk Import**: Upload CSV/Excel để import hàng loạt
- **Dashboard**: Thống kê tổng quan hệ thống
- **Data Export**: Xuất dữ liệu ra CSV

---

## 📈 Performance & Optimization

### 🚀 Backend Optimizations:
- **Database Indexing**: Index cho các field tìm kiếm thường xuyên
- **Aggregation Pipeline**: Sử dụng MongoDB aggregation cho queries phức tạp
- **Caching**: Cache kết quả quiz và categories
- **Pagination**: Phân trang cho danh sách lớn
- **Connection Pooling**: Tối ưu kết nối database

### ⚡ Frontend Optimizations:
- **Code Splitting**: Lazy loading các routes
- **Component Memoization**: React.memo cho components
- **Asset Optimization**: Compress images và icons
- **Bundle Analysis**: Tối ưu bundle size
- **Service Worker**: Cache static assets

### 📊 Monitoring:
- **Error Logging**: Console logging cho debug
- **Performance Metrics**: Track API response times
- **User Analytics**: Track user interactions
- **Health Checks**: API endpoints status monitoring

---

## 🔒 Security Features

### 🛡️ Authentication & Authorization:
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt cho admin passwords
- **Role-based Access**: Admin vs User permissions
- **Token Expiration**: 24h token lifetime
- **Secure Headers**: CORS configuration

### 🔐 Data Protection:
- **Input Validation**: Validate tất cả user inputs
- **SQL Injection Prevention**: Mongoose built-in protection
- **XSS Prevention**: Sanitize user-generated content
- **File Upload Security**: Validate file types và size
- **Rate Limiting**: Prevent API abuse

### 🏠 Environment Security:
- **Environment Variables**: Sensitive data trong .env
- **Secure Defaults**: Strong default configurations
- **Error Handling**: Không expose sensitive info
- **Audit Logs**: Track admin actions

---

## 🧪 Testing & Quality Assurance

### 🔧 Code Quality:
- **ESLint**: JavaScript linting rules
- **Code Comments**: Comprehensive documentation
- **Error Handling**: Try-catch cho tất cả async operations
- **Input Validation**: Validate API inputs
- **Type Safety**: JSDoc comments cho type hints

### 🧪 Testing Strategy:
- **Manual Testing**: UI/UX testing across devices
- **API Testing**: Thunder Client/Postman collections
- **Database Testing**: MongoDB queries testing
- **Integration Testing**: Full workflow testing
- **Performance Testing**: Load testing các APIs

### 📋 Quality Checklist:
- ✅ All APIs have error handling
- ✅ All components are responsive
- ✅ Admin panel fully functional
- ✅ Import/Export working correctly
- ✅ Streak system accurate
- ✅ Authentication secure
- ✅ Database optimized

---

## 📚 Documentation

### 📖 Available Docs:
- **SYSTEM_GUIDE.md**: Hướng dẫn cài đặt và sử dụng chi tiết
- **IMPORT_GUIDE.md**: Hướng dẫn import dữ liệu hàng loạt
- **API_DOCUMENTATION.md**: Chi tiết tất cả API endpoints
- **README.md**: Tổng quan dự án (file này)

### 🎓 Learning Resources:
- **Code Comments**: Extensive inline documentation
- **Setup Scripts**: Automated system initialization
- **Sample Data**: Example categories và words
- **Error Messages**: Descriptive error handling

---

## 🔮 Roadmap & Future Features

### 🎯 Phase 1 (Completed):
- ✅ Core learning system (Flashcard, Quiz, Streak)
- ✅ User authentication và management
- ✅ Admin panel với CRUD operations
- ✅ Bulk import/export functionality
- ✅ Responsive UI design

### 🚀 Phase 2 (Planned):
- 🔄 Real-time notifications
- 🔄 Advanced analytics dashboard
- 🔄 Social features (friends, leaderboards)
- 🔄 Mobile app (React Native)
- 🔄 AI-powered recommendations

### 🌟 Phase 3 (Future):
- 🔄 Voice recognition for pronunciation
- 🔄 Video lessons integration
- 🔄 Offline mode support
- 🔄 Multi-language support
- 🔄 Advanced gamification

---

## 🤝 Contributing

### 📝 Development Guidelines:
1. **Code Style**: Follow ESLint configurations
2. **Commit Messages**: Use conventional commit format
3. **Branch Naming**: feature/feature-name, fix/bug-name
4. **Documentation**: Update docs for new features
5. **Testing**: Test thoroughly before committing

### 🐛 Bug Reports:
- Use GitHub Issues với detailed description
- Include steps to reproduce
- Provide screenshots nếu có UI issues
- Mention browser/OS information

### 💡 Feature Requests:
- Open GitHub Discussion trước khi implement
- Provide use cases và benefits
- Consider performance impact
- Maintain backward compatibility

---

## 📄 License & Credits

### 📜 License:
This project is licensed under the **MIT License**. See LICENSE file for details.

### 👨‍💻 Credits:
- **Author**: LeHaiAnh
- **Version**: 1.0.0
- **Last Updated**: June 2025

### 🙏 Acknowledgments:
- **MongoDB**: NoSQL database solution
- **Express.js**: Web application framework
- **React**: UI library
- **Vite**: Build tool
- **Community**: Open source libraries và resources

---

## 📞 Support & Contact

### 🆘 Getting Help:
- **Documentation**: Check SYSTEM_GUIDE.md first
- **GitHub Issues**: Report bugs và feature requests
- **Email**: Contact development team
- **FAQ**: Common questions trong docs

### 📊 System Status:
- **Backend Health**: Check /health endpoint
- **Database Status**: MongoDB connection status
- **Performance**: Monitor response times
- **Uptime**: Track system availability

---

**🎉 Cảm ơn bạn đã sử dụng Hệ thống học từ vựng tiếng Anh!**


### Design: seira
### Coding: seira
### Testing: seira
### Everything by seira ♥
### Pay money: LeHaiAnh
### Fuck you LeHaiAnh!
