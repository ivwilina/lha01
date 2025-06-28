import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getCurrentStreak, getStreakHistory } from '../api/streakApi';
import thunderIcon from '../assets/icons/thunder-2-svgrepo-com.svg';
import '../style/Streak.css';

const Streak = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [streakHistory, setStreakHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && currentUser) {
        try {
          const [streakData, historyData] = await Promise.all([
            getCurrentStreak(currentUser._id),
            getStreakHistory(currentUser._id)
          ]);
          setStreakData(streakData);
          setStreakHistory(historyData.history || []);
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="streak-container">
      <div className="streak-header">
        <div className="streak-title">
          <img src={thunderIcon} alt="Streak" className="streak-title-icon" />
          <h2>Learning Streak</h2>
        </div>
        <div className="streak-count">
          <span className="streak-number">{streakData?.streakCount || 0}</span>
          <span className="streak-label">Days</span>
        </div>
      </div>

      {/* Current Status */}
      <div className="streak-status">
        <div className="status-card">
          <h3>Current Status</h3>
          <div className="status-info">
            {streakData?.isActive ? (
              <div className="status-active">
                <span className="status-icon">🔥</span>
                <span>Streak is active!</span>
              </div>
            ) : (
              <div className="status-inactive">
                <span className="status-icon">😴</span>
                <span>Start learning to begin your streak</span>
              </div>
            )}
          </div>
          
          {streakData?.startDate && (
            <div className="streak-dates">
              <p><strong>Started:</strong> {formatDate(streakData.startDate)}</p>
              {streakData?.endDate && (
                <p><strong>Last Activity:</strong> {formatDate(streakData.endDate)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weekly History */}
      <div className="streak-history">
        <h3>This Week</h3>
        <div className="history-grid">
          {streakHistory.map((day, index) => (
            <div 
              key={index} 
              className={`history-day ${day.completed ? 'completed' : ''} ${day.isToday ? 'today' : ''}`}
            >
              <div className="day-icon">
                <img src={thunderIcon} alt="Day" className="day-thunder-icon" />
              </div>
              <div className="day-name">{day.dayName.slice(0, 3)}</div>
              <div className="day-date">{formatDate(day.date)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="streak-info">
        <h3>How Streaks Work</h3>
        <ul>
          <li>🎯 Learn words or complete quizzes daily</li>
          <li>🔥 Keep the streak alive by staying active</li>
          <li>📈 Watch your streak count grow each day</li>
          <li>⚡ Miss a day and start over</li>
        </ul>
      </div>

      {/* Call to action */}
      {!streakData?.isActive && (
        <div className="streak-cta">
          <h3>Ready to start?</h3>
          <p>Begin your learning journey today!</p>
          <div className="cta-buttons">
            <a href="/flashcard" className="cta-button primary">
              Learn Words
            </a>
            <a href="/quiz" className="cta-button secondary">
              Take Quiz
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Streak;
