import React from 'react';
import thunderIcon from '../assets/icons/thunder-2-svgrepo-com.svg';

const UserStats = ({ stats, compact = false }) => {
  if (compact) {
    return (
      <div className="user-stats-compact">
        <div className="stat-item">
          <span className="stat-value">{stats.totalWordsLearned}</span>
          <span className="stat-label">Từ</span>
        </div>
        <div className="stat-item">
          <img src={thunderIcon} alt="Streak" className="streak-icon-small" />
          <span className="stat-value">{stats.streakCount}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-stats-full">
      <div className="stat-card words-learned">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <div className="stat-number">{stats.totalWordsLearned}</div>
          <div className="stat-label">Từ vựng đã học</div>
        </div>
      </div>

      <div className="stat-card categories-completed">
        <div className="stat-icon">🎯</div>
        <div className="stat-content">
          <div className="stat-number">{stats.categoriesCompleted}/{stats.totalCategories}</div>
          <div className="stat-label">Chủ đề hoàn thành</div>
        </div>
      </div>

      <div className="stat-card streak-count">
        <div className="stat-icon">
          <img src={thunderIcon} alt="Streak" className="streak-icon" />
        </div>
        <div className="stat-content">
          <div className="stat-number">{stats.streakCount}</div>
          <div className="stat-label">Ngày liên tiếp</div>
        </div>
      </div>

      <div className="stat-card completion-rate">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-number">
            {stats.totalCategories > 0 ? 
              Math.round((stats.categoriesCompleted / stats.totalCategories) * 100) : 0}%
          </div>
          <div className="stat-label">Tỷ lệ hoàn thành</div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
