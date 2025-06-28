// Test streak API calls
const mongoose = require("mongoose");

const databaseName = "onlineStudyDB";
const url = `mongodb://localhost:27017/${databaseName}`;

// Connect to MongoDB
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB for testing');
    runStreakTests();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Import streak controller functions
const streakController = require('./controllers/streak.controller');

async function runStreakTests() {
  console.log('Starting streak functionality tests...');
  
  // Test user ID (you can replace with a real user ID from your database)
  const testUserId = "676f8a45a1b2c3d4e5f67890"; // Replace with actual user ID
  
  try {
    // Test 1: Initialize streak
    console.log('\n1. Testing streak initialization...');
    const mockReq1 = { body: { userId: testUserId } };
    const mockRes1 = {
      status: (code) => ({ json: (data) => console.log('Initialize result:', data) }),
      json: (data) => console.log('Initialize result:', data)
    };
    
    // Test 2: Update words learned
    console.log('\n2. Testing words learned update...');
    const mockReq2 = { body: { userId: testUserId, wordsCount: 3 } };
    const mockRes2 = {
      status: (code) => ({ json: (data) => console.log('Words update result:', data) }),
      json: (data) => console.log('Words update result:', data)
    };
    
    // Test 3: Update quiz completed
    console.log('\n3. Testing quiz completion update...');
    const mockReq3 = { body: { userId: testUserId } };
    const mockRes3 = {
      status: (code) => ({ json: (data) => console.log('Quiz update result:', data) }),
      json: (data) => console.log('Quiz update result:', data)
    };
    
    // Test 4: Get current streak
    console.log('\n4. Testing get current streak...');
    const mockReq4 = { params: { userId: testUserId } };
    const mockRes4 = {
      status: (code) => ({ json: (data) => console.log('Current streak result:', data) }),
      json: (data) => console.log('Current streak result:', data)
    };

    // Test 5: Get streak history
    console.log('\n5. Testing get streak history...');
    const mockReq5 = { params: { userId: testUserId } };
    const mockRes5 = {
      status: (code) => ({ json: (data) => console.log('Streak history result:', data) }),
      json: (data) => console.log('Streak history result:', data)
    };

    // Run tests sequentially
    await streakController.initialize_streak(mockReq1, mockRes1);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await streakController.update_words_learned(mockReq2, mockRes2);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await streakController.update_quiz_completed(mockReq3, mockRes3);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await streakController.get_current_streak(mockReq4, mockRes4);
    await new Promise(resolve => setTimeout(resolve, 100));

    await streakController.get_streak_history(mockReq5, mockRes5);
    
    console.log('\nStreak tests completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}
