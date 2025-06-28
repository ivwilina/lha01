// Simple test for streak functionality
const express = require('express');
const cors = require('cors');

// Test the streak routes
const app = express();
app.use(express.json());
app.use(cors());

// Import streak routes
const streakRoutes = require('./routes/streak.route.js');
app.use('/streak', streakRoutes);

const port = 3001; // Use different port for testing

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  console.log('Streak API endpoints available:');
  console.log('- POST /streak/initialize');
  console.log('- PUT /streak/update-words');
  console.log('- PUT /streak/update-quiz');
  console.log('- GET /streak/current/:userId');
  console.log('- GET /streak/stats/:userId');
  console.log('- PUT /streak/reset');
});

module.exports = app;
