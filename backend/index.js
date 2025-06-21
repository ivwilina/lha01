// import express from 'express'
const mongoose = require("mongoose");
const express = require("express");

const databaseName = "onlineStudyDB";
const url =`mongodb://localhost:27017/${databaseName}`;

const wordRoutes = require('./routes/word.route.js');
const categoryRoutes = require('./routes/category.route.js');
const userRoutes = require('./routes/user.route.js');
const streakRoutes = require('./routes/streak.route.js');
const learningRoutes = require('./routes/learning.route.js');

const app = express();
app.use(express.json());

const cors = require('cors');

app.use(cors());

app.use('/word',wordRoutes);
app.use('/category',categoryRoutes);
app.use('/streak', streakRoutes);
app.use('/learning', learningRoutes);
app.use('/user', userRoutes);

const port = 3000;
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to database!");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Connection failed!");
  });
