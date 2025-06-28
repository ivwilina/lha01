/**
 * STREAK CONTROLLER
 * 
 * Xử lý hệ thống streak (chuỗi ngày học liên tục):
 * - Khởi tạo streak cho user mới
 * - Cập nhật streak khi học từ mới
 * - Cập nhật streak khi hoàn thành quiz
 * - Theo dõi lịch sử streak 7 ngày
 * - Thống kê streak và leaderboard
 * - Reset streak về 0
 * - Kiểm tra streak có còn active không
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const Streak = require('../models/streak.model');
const User = require('../models/user.model');

/**
 * Khởi tạo streak cho user mới
 * 
 * @desc Tạo streak record mới cho user lần đầu sử dụng hệ thống
 * @route POST /streak/initialize
 * @access Public
 * @param {Object} req.body - { userId }
 * @returns {Object} Streak object vừa tạo
 */

/**
 * Helper function để kiểm tra hai ngày có cùng ngày không
 * 
 * @param {Date} date1 - Ngày thứ nhất
 * @param {Date} date2 - Ngày thứ hai  
 * @returns {Boolean} True nếu cùng ngày
 */
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
      
      // Get local date string without timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // Check if this day was completed
      let completed = false;
      
      if (streak.startDate && streak.endDate) {
        const startDate = new Date(streak.startDate);
        const endDate = new Date(streak.endDate);
        
        // Use local date comparison to avoid timezone issues
        const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        
        // If this date is within the streak period
        completed = dateStr >= startDateStr && dateStr <= endDateStr;
      }
      
      history.push({
        date: dateStr, // YYYY-MM-DD format
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        completed: completed,
        isToday: i === 0 // Last iteration is today
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

    // Return simplified stats (no ranking or leaderboard)
    res.status(200).json({
      userStreak,
      totalStreakDays: userStreak.streakCount,
      startDate: userStreak.startDate,
      endDate: userStreak.endDate,
      isActive: userStreak.endDate && 
        (isSameDay(userStreak.endDate, new Date()) || isYesterday(userStreak.endDate))
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
