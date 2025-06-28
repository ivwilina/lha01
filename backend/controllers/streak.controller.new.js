const Streak = require('../models/streak.model');
const User = require('../models/user.model');

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Helper function to check if a date is yesterday
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

// Helper function to get days between two dates
const getDaysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

//* Initialize or get streak for a user
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

    // Check if streak already exists
    let streak = await Streak.findOne({ user: userId });
    
    if (!streak) {
      // Create new streak
      streak = new Streak({
        user: userId,
        streakCount: 0,
        startDate: null,
        endDate: null
      });
      await streak.save();
      console.log('Created new streak for user:', userId);
    }

    res.status(200).json(streak);
  } catch (error) {
    console.error('Error in initialize_streak:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Update streak when user learns words or completes quiz
const update_streak = async (req, res) => {
  try {
    const { userId, activityType } = req.body; // activityType: 'words' or 'quiz'

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let streak = await Streak.findOne({ user: userId });
    if (!streak) {
      // Initialize streak if doesn't exist
      streak = new Streak({
        user: userId,
        streakCount: 0,
        startDate: null,
        endDate: null
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // Check if this is a new streak day
    if (!streak.endDate || !isSameDay(streak.endDate, today)) {
      
      // Check if streak should continue
      if (streak.endDate && isYesterday(streak.endDate)) {
        // Continue streak
        streak.streakCount += 1;
        streak.endDate = today;
        console.log(`Streak continued: ${streak.streakCount} days`);
      } else if (streak.endDate && !isYesterday(streak.endDate)) {
        // Streak broken, restart
        streak.streakCount = 1;
        streak.startDate = today;
        streak.endDate = today;
        console.log('Streak broken, restarting with 1 day');
      } else {
        // First time or very first streak
        streak.streakCount = 1;
        streak.startDate = today;
        streak.endDate = today;
        console.log('Starting new streak: 1 day');
      }
    } else {
      console.log('Activity already recorded for today, streak unchanged');
    }

    await streak.save();
    
    res.status(200).json({
      success: true,
      message: "Streak updated successfully",
      streak: streak,
      activityType: activityType
    });

  } catch (error) {
    console.error('Error in update_streak:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Update streak when user learns words  
const update_words_learned = async (req, res) => {
  try {
    const { userId, wordsCount = 1 } = req.body;
    
    // Redirect to general update_streak
    req.body.activityType = 'words';
    return await update_streak(req, res);
    
  } catch (error) {
    console.error('Error in update_words_learned:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Update streak when user completes quiz
const update_quiz_completed = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Redirect to general update_streak  
    req.body.activityType = 'quiz';
    return await update_streak(req, res);
    
  } catch (error) {
    console.error('Error in update_quiz_completed:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Get current streak for a user
const get_current_streak = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let streak = await Streak.findOne({ user: userId });
    if (!streak) {
      // Return default streak data
      return res.status(200).json({
        user: userId,
        streakCount: 0,
        startDate: null,
        endDate: null,
        isActive: false
      });
    }

    // Check if streak is still active (endDate is today or yesterday)
    const today = new Date();
    const isActive = streak.endDate && 
      (isSameDay(streak.endDate, today) || isYesterday(streak.endDate));

    res.status(200).json({
      ...streak.toObject(),
      isActive: isActive
    });

  } catch (error) {
    console.error('Error in get_current_streak:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Get streak history for the past 7 days
const get_streak_history = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's streak
    const streak = await Streak.findOne({ user: userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    // Generate last 7 days
    const today = new Date();
    const history = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Check if this day was completed
      let completed = false;
      
      if (streak.startDate && streak.endDate) {
        const startDate = new Date(streak.startDate);
        const endDate = new Date(streak.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        
        // If this date is within the streak period
        completed = date >= startDate && date <= endDate;
      }
      
      history.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        completed: completed,
        isToday: isSameDay(date, today)
      });
    }

    res.status(200).json({
      success: true,
      history: history,
      currentStreak: streak.streakCount,
      startDate: streak.startDate,
      endDate: streak.endDate
    });

  } catch (error) {
    console.error('Error getting streak history:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Reset streak for a user
const reset_streak = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let streak = await Streak.findOne({ user: userId });
    if (!streak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    // Reset streak
    streak.streakCount = 0;
    streak.startDate = null;
    streak.endDate = null;
    
    await streak.save();

    res.status(200).json({
      success: true,
      message: "Streak reset successfully",
      streak: streak
    });

  } catch (error) {
    console.error('Error in reset_streak:', error);
    res.status(500).json({ message: error.message });
  }
};

//* Get streak statistics  
const get_streak_stats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's streak
    const userStreak = await Streak.findOne({ user: userId });
    if (!userStreak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    // Get top streaks for leaderboard
    const topStreaks = await Streak.find({})
      .sort({ streakCount: -1 })
      .limit(10)
      .populate('user', 'name');

    // Get user's rank
    const higherStreaks = await Streak.countDocuments({ 
      streakCount: { $gt: userStreak.streakCount }
    });
    const userRank = higherStreaks + 1;

    res.status(200).json({
      userStreak,
      leaderboard: topStreaks,
      userRank,
      totalUsers: await Streak.countDocuments({})
    });
  } catch (error) {
    console.error('Error in get_streak_stats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initialize_streak,
  update_words_learned,
  update_quiz_completed,
  get_current_streak,
  reset_streak,
  get_streak_stats,
  get_streak_history
};
