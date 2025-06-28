import React from 'react';

const ProfileSkeleton = () => {
  return (
    <div className="profile-container">
      {/* Profile Header Skeleton */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="skeleton skeleton-avatar"></div>
          </div>
          <div className="profile-details">
            <div className="skeleton skeleton-text medium"></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="profile-stats">
        <div className="skeleton skeleton-text short" style={{ marginBottom: '25px', height: '24px' }}></div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-stat-card"></div>
          ))}
        </div>
      </div>

      {/* Progress Skeleton */}
      <div className="profile-progress">
        <div className="skeleton skeleton-text short" style={{ marginBottom: '25px', height: '24px' }}></div>
        <div className="progress-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="progress-item">
              <div className="skeleton skeleton-text medium" style={{ marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '8px', marginBottom: '12px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton skeleton-text short" style={{ width: '30%' }}></div>
                <div className="skeleton skeleton-text short" style={{ width: '20%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
