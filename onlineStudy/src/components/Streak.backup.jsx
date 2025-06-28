import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getCurrentStreak, getStreakStats } from '../api/streakApi';
import '../style/Streak.css';

const Streak = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [streakStats, setStreakStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && currentUser) {
        try {
          const [streakData, streakStats] = await Promise.all([
            getCurrentStreak(currentUser._id),
            getStreakStats(currentUser._id)
          ]);
          setStreakData(streakData);
          setStreakStats(streakStats);
        } catch (error) {
          console.error('Error fetching streak data:', error);
          setError('Failed to load streak data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return <div className="streak-error">Please log in to view your streak</div>;
  }

  if (loading) {
    return (
      <div className="streak-loading">
        <div className="spinner"></div>
        <p>Loading streak data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="streak-error">{error}</div>;
  }

  const { progressPercentage = 0, goalMet = false } = streakData || {};
  const { wordsLearned = 0, quizCompleted = 0 } = streakData?.todayProgress || {};
  const { dailyGoal = { wordsLearned: 5, quizCompleted: 1 } } = streakData || {};

  return (
    <div className="streak-container">
      <div className="streak-header">
        <h2>🔥 Learning Streak</h2>
        <div className="streak-count">
          <span className="streak-number">{streakData?.streakCount || 0}</span>
          <span className="streak-label">Days</span>
        </div>
      </div>

      <div className="streak-progress">
        <h3>Today's Progress</h3>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(progressPercentage)}%</span>
        </div>
        
        <div className="daily-goals">
          <div className="goal-item">
            <span className="goal-icon">📚</span>
            <span className="goal-text">
              {wordsLearned}/{dailyGoal.wordsLearned} words learned
            </span>
            {wordsLearned >= dailyGoal.wordsLearned && <span className="goal-completed">✓</span>}
          </div>
          
          <div className="goal-item">
            <span className="goal-icon">🧠</span>
            <span className="goal-text">
              {quizCompleted}/{dailyGoal.quizCompleted} quiz completed
            </span>
            {quizCompleted >= dailyGoal.quizCompleted && <span className="goal-completed">✓</span>}
          </div>
        </div>

        <div className="goal-requirement">
          <p>Complete {dailyGoal.wordsLearned} words <strong>OR</strong> {dailyGoal.quizCompleted} quiz to maintain your streak!</p>
          {goalMet && (
            <div className="goal-met">
              <span className="checkmark">✅</span>
              <span>Great job! Today's goal completed!</span>
            </div>
          )}
        </div>
      </div>

      <div className="streak-stats">
        <div className="stat-item">
          <span className="stat-value">{streakData?.maxStreak || 0}</span>
          <span className="stat-label">Best Streak</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{streakStats?.userRank || '-'}</span>
          <span className="stat-label">Your Rank</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{streakStats?.totalActiveUsers || 0}</span>
          <span className="stat-label">Active Users</span>
        </div>
      </div>

      {streakStats?.leaderboard && streakStats.leaderboard.length > 0 && (
        <div className="leaderboard">
          <h3>🏆 Top Streaks</h3>
          <div className="leaderboard-list">
            {streakStats.leaderboard.slice(0, 5).map((user, index) => (
              <div key={user._id} className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}>
                <span className="rank">#{index + 1}</span>
                <span className="username">{user.user?.name || 'Anonymous'}</span>
                <span className="streak-count">{user.streakCount} days</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Streak;
