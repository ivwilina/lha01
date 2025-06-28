import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getCurrentStreak } from '../api/streakApi';
import thunderIcon from '../assets/icons/thunder-2-svgrepo-com.svg';
import '../style/StreakMini.css';

const StreakMini = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreakData = async () => {
      if (isAuthenticated && currentUser) {
        try {
          const data = await getCurrentStreak(currentUser._id);
          setStreakData(data);
        } catch (error) {
          console.error('Error fetching streak data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStreakData();
    
    // Refresh streak data every 30 seconds to catch updates
    const intervalId = setInterval(fetchStreakData, 30000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated || loading) {
    return null;
  }

  const streakCount = streakData?.streakCount || 0;
  const isActive = streakData?.isActive || false;

  return (
    <div className="streak-mini">
      <div className="streak-mini-header">
        <div className="streak-mini-fire">
          <img src={thunderIcon} alt="Streak" className="thunder-icon" />
          <span className="streak-mini-count">{streakCount}</span>
        </div>
        <div className="streak-mini-status">
          {isActive ? (
            <span className="status-completed">Active Streak!</span>
          ) : (
            <span className="status-progress">Start Learning!</span>
          )}
        </div>
      </div>
      
      <div className="streak-mini-info">
        {streakCount > 0 ? (
          <div className="streak-info-text">
            🔥 {streakCount} day{streakCount > 1 ? 's' : ''} streak
          </div>
        ) : (
          <div className="streak-info-text">
            Start your learning journey today!
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakMini;
