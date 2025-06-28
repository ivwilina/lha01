/**
 * MAIN SERVER FILE - English Vocabulary Learning System
 * 
 * File khởi động chính của backend server:
 * - Cấu hình Express server
 * - Kết nối MongoDB database
 * - Setup CORS middleware
 * - Định nghĩa các route endpoints
 * - Khởi động server trên port 3000
 * 
 * Database: MongoDB (onlineStudyDB)
 * Framework: Express.js
 * Port: 3000
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

// Import dependencies
const mongoose = require("mongoose");
const express = require("express");
const cors = require('cors');

// Database configuration
const databaseName = "onlineStudyDB";
const url = `mongodb://localhost:27017/${databaseName}`;

// Import route modules
const wordRoutes = require('./routes/word.route.js');
const categoryRoutes = require('./routes/category.route.js');
const userRoutes = require('./routes/user.route.js');
const streakRoutes = require('./routes/streak.route.js');
const learningRoutes = require('./routes/learning.route.js');
const quizRoutes = require('./routes/quiz.route.js');
const adminRoutes = require('./routes/admin.route.js');

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS

// Route configuration
app.use('/word', wordRoutes);        // Word management endpoints
app.use('/category', categoryRoutes); // Category management endpoints  
app.use('/streak', streakRoutes);     // Streak tracking endpoints
app.use('/learning', learningRoutes); // Learning progress endpoints
app.use('/user', userRoutes);         // User management endpoints
app.use('/quiz', quizRoutes);         // Quiz system endpoints
app.use('/admin', adminRoutes);       // Admin panel endpoints

// Server configuration
const port = 3000;

// Connect to MongoDB and start server
mongoose
  .connect(url)
  .then(() => {
    console.log("✅ Connected to database successfully!");
    console.log(`📊 Database: ${databaseName}`);
    
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`🌐 API URL: http://localhost:${port}`);
      console.log(`📚 English Vocabulary Learning System - Backend Ready`);
    });
  })
  .catch((error) => {
    console.log("❌ Database connection failed:", error.message);
    process.exit(1);
  });
