import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getCurrentStreak } from '../api/streakApi';
import thunderIcon from '../assets/icons/thunder-2-svgrepo-com.svg';
import '../style/StreakCounter.css';

const StreakCounter = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStreakData = async () => {
      if (isAuthenticated && currentUser) {
        setLoading(true);
        try {
          const data = await getCurrentStreak(currentUser._id);
          setStreakCount(data?.streakCount || 0);
        } catch (error) {
          console.error('Error fetching streak data:', error);
          setStreakCount(0);
        } finally {
          setLoading(false);
        }
      } else {
        setStreakCount(0);
      }
    };

    fetchStreakData();
    
    // Refresh streak data every 30 seconds
    const intervalId = setInterval(fetchStreakData, 30000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, currentUser]);

  const getTooltipText = () => {
    if (streakCount === 0) {
      return "Start your learning streak today!";
    } else if (streakCount === 1) {
      return "1 day streak - Keep going!";
    } else {
      return `${streakCount} days streak - Amazing!`;
    }
  };

  const handleClick = () => {
    navigate('/streak');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div 
      className="streak-counter" 
      onClick={handleClick} 
      title={getTooltipText()}
    >
      <span className="streak-number">{loading ? '...' : streakCount}</span>
      <span className="streak-icon">
        <img src={thunderIcon} alt="Streak" />
      </span>
    </div>
  );
};

export default StreakCounter;
