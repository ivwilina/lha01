import { useEffect, useState } from 'react';
import '../style/QuizTimer.css';

const QuizTimer = ({ timeLeft, isRunning }) => {
  const [displayTime, setDisplayTime] = useState(timeLeft);

  useEffect(() => {
    setDisplayTime(timeLeft);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (displayTime <= 60) return 'critical';
    if (displayTime <= 300) return 'warning';
    return 'normal';
  };

  return (
    <div className={`quiz-timer ${getTimeStatus()}`}>
      <div className="timer-icon">⏰</div>
      <div className="timer-display">
        <div className="time-text">{formatTime(displayTime)}</div>
        <div className="time-label">Time Remaining</div>
      </div>
      {!isRunning && (
        <div className="timer-paused">⏸️</div>
      )}
    </div>
  );
};

export default QuizTimer;
