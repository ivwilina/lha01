const Streak = require('../models/streak.model');
const User = require('../models/user.model');
const Learning = require('../models/learning.model');

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
      streak = await Streak.create({ 
        user: userId,
        todayProgress: resetDailyProgress()
      });
    } else {
      // Update daily progress if it's a new day
      const today = new Date();
      if (!streak.todayProgress.date || !isSameDay(streak.todayProgress.date, today)) {
        streak.todayProgress = resetDailyProgress();
        await streak.save();
      }
    }

    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Update streak when user learns words
const update_words_learned = async (req, res) => {
  try {
    const { userId, wordsCount = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let streak = await Streak.findOne({ user: userId });
    if (!streak) {
      // Create new streak if doesn't exist
      streak = await Streak.create({ 
        user: userId,
        todayProgress: resetDailyProgress()
      });
    }

    const today = new Date();
    
    // Reset daily progress if it's a new day
    if (!streak.todayProgress.date || !isSameDay(streak.todayProgress.date, today)) {
      // Check if streak should continue or break
      await checkStreakContinuity(streak);
      streak.todayProgress = resetDailyProgress();
    }

    // Update words learned today
    streak.todayProgress.wordsLearned += wordsCount;
    
    // Check if daily goal is met and update streak
    await updateStreakIfGoalMet(streak);
    
    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Update streak when user completes quiz
const update_quiz_completed = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let streak = await Streak.findOne({ user: userId });
    if (!streak) {
      // Create new streak if doesn't exist
      streak = await Streak.create({ 
        user: userId,
        todayProgress: resetDailyProgress()
      });
    }

    const today = new Date();
    
    // Reset daily progress if it's a new day
    if (!streak.todayProgress.date || !isSameDay(streak.todayProgress.date, today)) {
      // Check if streak should continue or break
      await checkStreakContinuity(streak);
      streak.todayProgress = resetDailyProgress();
    }

    // Update quiz completed today
    streak.todayProgress.quizCompleted += 1;
    
    // Check if daily goal is met and update streak
    await updateStreakIfGoalMet(streak);
    
    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to check streak continuity
const checkStreakContinuity = async (streak) => {
  const today = new Date();
  
  if (streak.lastActivityDate) {
    const daysDiff = Math.floor((today - streak.lastActivityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      // Streak is broken - more than 1 day gap
      streak.streakCount = 0;
      streak.isActive = false;
    }
  }
};

// Helper function to update streak if daily goal is met
const updateStreakIfGoalMet = async (streak) => {
  const { wordsLearned, quizCompleted } = streak.todayProgress;
  const { dailyGoal } = streak;
  
  // Check if daily goal is met (5 words OR 1 quiz)
  const goalMet = wordsLearned >= dailyGoal.wordsLearned || quizCompleted >= dailyGoal.quizCompleted;
  
  if (goalMet) {
    const today = new Date();
    
    // Check if we should increment streak
    if (!streak.lastActivityDate || !isSameDay(streak.lastActivityDate, today)) {
      // New day with goal met
      if (streak.lastActivityDate && !isYesterday(streak.lastActivityDate)) {
        // Gap in activity - reset streak
        streak.streakCount = 1;
      } else {
        // Continue or start streak
        streak.streakCount += 1;
      }
      
      // Update max streak
      if (streak.streakCount > streak.maxStreak) {
        streak.maxStreak = streak.streakCount;
      }
      
      streak.lastActivityDate = today;
      streak.isActive = true;
    }
  }
  
  await streak.save();
};

//* Get the current streak for a user
const get_current_streak = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let streak = await Streak.findOne({ user: userId });
    
    if (!streak) {
      // Create new streak if doesn't exist
      streak = await Streak.create({ 
        user: userId,
        todayProgress: resetDailyProgress()
      });
    } else {
      // Check and update streak status
      const today = new Date();
      if (!streak.todayProgress.date || !isSameDay(streak.todayProgress.date, today)) {
        await checkStreakContinuity(streak);
        streak.todayProgress = resetDailyProgress();
        await streak.save();
      }
    }

    // Calculate progress percentage
    const { wordsLearned, quizCompleted } = streak.todayProgress;
    const { dailyGoal } = streak;
    
    const wordsProgress = Math.min((wordsLearned / dailyGoal.wordsLearned) * 100, 100);
    const quizProgress = Math.min((quizCompleted / dailyGoal.quizCompleted) * 100, 100);
    const overallProgress = Math.max(wordsProgress, quizProgress);
    
    const response = {
      ...streak.toObject(),
      progressPercentage: overallProgress,
      goalMet: overallProgress >= 100,
      canExtendStreak: overallProgress >= 100
    };

    res.status(200).json(response);
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
    streak.lastActivityDate = null;
    streak.isActive = false;
    streak.todayProgress = resetDailyProgress();
    await streak.save();

    res.status(200).json(streak);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get streak statistics and leaderboard
const get_streak_stats = async (req, res) => {
  try {
    const { userId } = req.params;

    const userStreak = await Streak.findOne({ user: userId }).populate('user', 'name email');
    if (!userStreak) {
      return res.status(404).json({ message: "Streak not found for this user" });
    }

    // Get top streaks for leaderboard
    const topStreaks = await Streak.find({ isActive: true })
      .sort({ streakCount: -1 })
      .limit(10)
      .populate('user', 'name');

    // Get user's rank
    const higherStreaks = await Streak.countDocuments({ 
      streakCount: { $gt: userStreak.streakCount },
      isActive: true 
    });
    const userRank = higherStreaks + 1;

    res.status(200).json({
      userStreak,
      leaderboard: topStreaks,
      userRank,
      totalActiveUsers: await Streak.countDocuments({ isActive: true })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get streak history for the past 7 days
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
      
      // Check if this day was completed
      let completed = false;
      
      if (streak.lastActivityDate) {
        const lastActivity = new Date(streak.lastActivityDate);
        
        // If this is today, check current progress
        if (isSameDay(date, today)) {
          const { wordsLearned = 0, quizCompleted = 0 } = streak.todayProgress || {};
          completed = wordsLearned >= 5 || quizCompleted >= 1;
        }
        // If this day is within the streak period and before/equal to last activity
        else if (date <= lastActivity) {
          // Calculate how many days back this is from last activity
          const daysBack = Math.floor((lastActivity - date) / (1000 * 60 * 60 * 24));
          
          // If within current streak count, it was completed
          completed = daysBack < streak.streakCount;
        }
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
      lastActivityDate: streak.lastActivityDate
    });

  } catch (error) {
    console.error('Error getting streak history:', error);
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