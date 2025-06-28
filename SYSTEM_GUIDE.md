# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG HỌC TỪ VỰNG TIẾNG ANH

## 📋 Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt hệ thống](#cài-đặt-hệ-thống)
3. [Cấu trúc hệ thống](#cấu-trúc-hệ-thống)
4. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
5. [Admin Panel](#admin-panel)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới thiệu

Hệ thống học từ vựng tiếng Anh là một ứng dụng web full-stack giúp người dùng học từ vựng hiệu quả thông qua:

### ✨ Tính năng chính:
- **Flashcard**: Học từ vựng theo chủ đề
- **Quiz**: Kiểm tra kiến thức với nhiều dạng câu hỏi
- **Streak System**: Theo dõi chuỗi ngày học liên tục
- **Progress Tracking**: Theo dõi tiến độ học tập
- **Admin Panel**: Quản lý hệ thống và import dữ liệu hàng loạt

### 🏗️ Công nghệ sử dụng:
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, Vite, React Router
- **Authentication**: JWT, bcrypt
- **File Processing**: Multer, csv-parser, xlsx
- **Styling**: CSS3, responsive design

---

## 🚀 Cài đặt hệ thống

### 📋 Yêu cầu hệ thống:
- Node.js (v16.0.0 trở lên)
- MongoDB (v4.4 trở lên)
- npm hoặc yarn
- 2GB RAM
- 1GB dung lượng ổ cứng

### 🔧 Bước 1: Chuẩn bị môi trường

1. **Cài đặt MongoDB**:
   ```bash
   # Windows: Tải từ https://www.mongodb.com/try/download/community
   # macOS: brew install mongodb-community
   # Ubuntu: sudo apt install mongodb
   ```

2. **Khởi động MongoDB**:
   ```bash
   # Windows: Chạy MongoDB Compass hoặc
   mongod --dbpath="C:\data\db"
   
   # macOS/Linux:
   sudo service mongod start
   ```

### 📦 Bước 2: Cài đặt dependencies

1. **Backend**:
   ```bash
   cd backend
   npm install
   ```

2. **Frontend**:
   ```bash
   cd onlineStudy
   npm install
   ```

### ⚙️ Bước 3: Khởi tạo hệ thống

1. **Chạy script setup**:
   ```bash
   cd backend
   node setup.js
   ```

   Script này sẽ:
   - Tạo tài khoản admin mặc định
   - Khởi tạo dữ liệu mẫu
   - Tạo thư mục uploads
   - Kiểm tra cấu hình

2. **Khởi động Backend**:
   ```bash
   cd backend
   npm run serve
   # hoặc npm run dev (với nodemon)
   ```

3. **Khởi động Frontend**:
   ```bash
   cd onlineStudy
   npm run dev
   ```

### 🌐 Bước 4: Truy cập hệ thống

- **Website chính**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin-system-panel-access
- **API Server**: http://localhost:3000

**Tài khoản admin mặc định**:
- Username: `admin`
- Password: `admin123`

---

## 🏛️ Cấu trúc hệ thống

### 📁 Backend Structure:
```
backend/
├── controllers/          # Logic xử lý API
│   ├── admin.controller.js
│   ├── category.controller.js
│   ├── learning.controller.js
│   ├── quiz.controller.js
│   ├── streak.controller.js
│   ├── user.controller.js
│   └── word.controller.js
├── models/              # Database schemas
│   ├── admin.model.js
│   ├── category.model.js
│   ├── learning.model.js
│   ├── quiz.model.js
│   ├── streak.model.js
│   ├── user.model.js
│   └── word.model.js
├── routes/              # API routes
├── middleware/          # Middleware functions
├── data/               # Sample data files
├── uploads/            # File upload directory
├── index.js            # Main server file
└── setup.js            # System initialization
```

### 📁 Frontend Structure:
```
onlineStudy/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   ├── auth/       # Login/Register
│   │   ├── admin/      # Admin panel
│   │   ├── flashcard/  # Flashcard pages
│   │   ├── quiz/       # Quiz pages
│   │   └── home/       # Home pages
│   ├── api/            # API client functions
│   ├── context/        # React contexts
│   ├── style/          # CSS files
│   └── assets/         # Static assets
├── public/             # Public files
└── package.json        # Dependencies
```

---

## 📖 Hướng dẫn sử dụng

### 👤 Người dùng thường

#### 🔐 Đăng ký/Đăng nhập:
1. Truy cập http://localhost:5173
2. Click "Đăng ký" để tạo tài khoản mới
3. Hoặc "Đăng nhập" với tài khoản có sẵn

#### 📚 Học Flashcard:
1. Chọn "Flashcard" trên menu
2. Chọn chủ đề muốn học
3. Click "Bắt đầu học" để xem từ vựng
4. Sử dụng các nút để đánh dấu "Đã nhớ" hoặc "Chưa nhớ"

#### 🎯 Làm Quiz:
1. Chọn "Quiz" trên menu
2. Chọn loại quiz:
   - **Category Quiz**: Quiz theo chủ đề đã học
   - **Comprehensive Quiz**: Quiz tổng hợp tất cả từ đã học
   - **Random Quiz**: Quiz ngẫu nhiên từ database
3. Chọn số câu hỏi và làm bài

#### ⚡ Streak System:
- Streak sẽ tăng khi bạn học từ mới hoặc hoàn thành quiz
- Xem streak hiện tại ở góc phải navbar
- Trang Streak hiển thị lịch sử và thống kê

### 👨‍💼 Admin

#### 🔑 Đăng nhập Admin:
1. Truy cập http://localhost:5173/admin-system-panel-access
2. Đăng nhập với tài khoản admin

#### 📊 Dashboard:
- Xem thống kê tổng quan hệ thống
- Số lượng users, categories, words
- Biểu đồ tăng trưởng user

#### 👥 Quản lý Users:
- Xem danh sách tất cả users
- Tìm kiếm user theo username/email
- Cập nhật thông tin user
- Xóa user (cẩn thận!)

#### 📂 Quản lý Categories:
- Tạo/sửa/xóa chủ đề
- Xem số lượng từ vựng trong mỗi chủ đề
- Import chủ đề mới kèm từ vựng từ file

#### 📝 Quản lý Words:
- Tạo/sửa/xóa từ vựng
- Tìm kiếm theo từ hoặc nghĩa
- Import hàng loạt từ file CSV/Excel

#### 📥 Import hàng loạt:
1. **Import từ vựng vào chủ đề có sẵn**:
   - Chọn "Quản lý từ vựng" → "Import từ file"
   - Tải template CSV mẫu
   - Upload file đã chuẩn bị
   - Chọn chủ đề đích

2. **Import chủ đề mới với từ vựng**:
   - Chọn "Quản lý chủ đề" → "Import chủ đề với từ vựng"
   - Upload file từ vựng
   - Điền thông tin chủ đề mới

**Format CSV được hỗ trợ**:
```csv
english,vietnamese,pronunciation,example
apple,táo,/ˈæpəl/,"I eat an apple every day"
book,sách,/bʊk/,"This is a good book"
```

---

## 🔧 Admin Panel

### 🎛️ Tính năng Admin:

#### 📈 Dashboard:
- **Thống kê tổng quan**: Users, Categories, Words, Admins
- **Biểu đồ tăng trưởng**: User registration theo tháng
- **Quick actions**: Các thao tác nhanh

#### 👥 User Management:
- **Danh sách users**: Hiển thị với pagination
- **Tìm kiếm**: Theo username hoặc email
- **Sắp xếp**: Theo ngày tạo, tên, email
- **Actions**: Xem chi tiết, chỉnh sửa, xóa

#### 📚 Category Management:
- **CRUD operations**: Create, Read, Update, Delete
- **Validation**: Kiểm tra tên trùng lặp
- **Word count**: Hiển thị số từ vựng trong mỗi category
- **Import**: Tạo category mới từ file

#### 📖 Word Management:
- **CRUD operations**: Quản lý từ vựng đầy đủ
- **Advanced search**: Tìm kiếm theo nhiều tiêu chí
- **Category filter**: Lọc theo chủ đề
- **Bulk import**: Import hàng loạt từ CSV/Excel

#### 📥 Import System:
- **File support**: CSV, XLS, XLSX
- **Flexible headers**: Hỗ trợ nhiều format khác nhau
- **Validation**: Kiểm tra dữ liệu trước khi import
- **Error handling**: Báo lỗi chi tiết cho từng dòng
- **Template download**: Tải template mẫu

---

## 📡 API Documentation

### 🔗 Base URL: `http://localhost:3000`

### 👤 User APIs:
```
POST /user/create       - Tạo user mới
POST /user/check        - Kiểm tra user tồn tại
POST /user/login        - Đăng nhập user
```

### 📂 Category APIs:
```
GET  /category/         - Lấy tất cả categories
POST /category/add      - Tạo category mới
GET  /category/list/:id - Lấy category theo ID
GET  /category/words/:id - Lấy words trong category
PUT  /category/update/:id - Cập nhật category
```

### 📝 Word APIs:
```
GET  /word/get          - Lấy tất cả words
POST /word/add          - Tạo word mới
POST /word/add/many     - Tạo nhiều words
POST /word/get/with-ids - Lấy words theo IDs
```

### 📚 Learning APIs:
```
POST /learning/add                    - Tạo learning record
GET  /learning/get/:userId           - Lấy learning theo user
POST /learning/mark-learned          - Đánh dấu từ đã học
POST /learning/unmark-learned        - Bỏ đánh dấu từ
GET  /learning/progress/:userId/:categoryId - Tiến độ học
```

### 🎯 Quiz APIs:
```
POST /quiz/create-category     - Tạo quiz theo category
POST /quiz/create-comprehensive - Tạo quiz tổng hợp
POST /quiz/create-random       - Tạo quiz ngẫu nhiên
GET  /quiz/:id                 - Lấy quiz theo ID
POST /quiz/:id/submit          - Nộp bài quiz
```

### ⚡ Streak APIs:
```
POST /streak/initialize        - Khởi tạo streak
PUT  /streak/update-words      - Cập nhật khi học từ
PUT  /streak/update-quiz       - Cập nhật khi làm quiz
GET  /streak/current/:userId   - Lấy streak hiện tại
GET  /streak/history/:userId   - Lịch sử streak
```

### 🔐 Admin APIs:
```
POST /admin/login              - Admin đăng nhập
GET  /admin/dashboard/stats    - Thống kê dashboard
GET  /admin/users              - Quản lý users
GET  /admin/categories         - Quản lý categories
GET  /admin/words              - Quản lý words
POST /admin/words/import       - Import words từ file
POST /admin/categories/import-with-words - Import category + words
```

---

## 🛠️ Troubleshooting

### ❌ Lỗi thường gặp:

#### 🔌 Lỗi kết nối Database:
```
Error: MongoNetworkError: failed to connect to server
```
**Giải pháp**:
1. Kiểm tra MongoDB đã chạy chưa: `mongod --version`
2. Khởi động MongoDB: `sudo service mongod start`
3. Kiểm tra port 27017 có bị chiếm không

#### 📦 Lỗi thiếu package:
```
Error: Cannot find module 'package-name'
```
**Giải pháp**:
1. Cài package: `npm install package-name`
2. Hoặc chạy: `npm install` để cài tất cả

#### 🔑 Lỗi authentication Admin:
```
Error: Invalid credentials
```
**Giải pháp**:
1. Chạy lại setup: `node setup.js`
2. Sử dụng tài khoản mặc định: admin/admin123
3. Reset admin password trong database

#### 📁 Lỗi upload file:
```
Error: Cannot find module 'csv-parser'
```
**Giải pháp**:
1. Cài package: `npm install csv-parser xlsx multer`
2. Tạo thư mục uploads: `mkdir uploads`

#### 🌐 Lỗi CORS:
```
Access to fetch at 'localhost:3000' from origin 'localhost:5173' has been blocked
```
**Giải pháp**:
1. Kiểm tra CORS config trong backend
2. Đảm bảo frontend chạy đúng port 5173

### 🔧 Debug Commands:

```bash
# Kiểm tra MongoDB
mongo --eval "db.stats()"

# Kiểm tra port
netstat -an | grep 3000
netstat -an | grep 5173

# Xem logs backend
npm run dev

# Xem logs frontend
npm run dev

# Reset database
mongo onlineStudyDB --eval "db.dropDatabase()"
```

### 📞 Liên hệ hỗ trợ:

Nếu gặp vấn đề không giải quyết được:
1. Kiểm tra logs trong console
2. Tạo issue trên GitHub repository
3. Liên hệ team phát triển

---

## 📚 Tài liệu tham khảo:

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

---

**© 2024 Hệ thống học từ vựng tiếng Anh. All rights reserved.**
