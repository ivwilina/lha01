const Streak = require('../models/streak.model');
const User = require('../models/user.model');

//* Initialize a new streak for a user
const initialize_streak = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newStreak = await Streak.create({ user: userId });
    res.status(200).json(newStreak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Extend the streak for a user
const extend_streak = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const streak = await Streak.findOne({ user: userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    streak.streakCount += 1;
    await streak.save();

    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get the current streak for a user
const get_current_streak = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const streak = await Streak.findOne({ user: userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Reset the streak for a user
const reset_streak = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const streak = await Streak.findOne({ user: userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    streak.streakCount = 0;
    streak.startDate = Date.now();
    await streak.save();

    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* End the streak for a user if they miss a day
const end_streak = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const streak = await Streak.findOne({ user: userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    streak.streakCount = 0;
    await streak.save();

    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initialize_streak,
  extend_streak,
  get_current_streak,
  reset_streak,
  end_streak
};