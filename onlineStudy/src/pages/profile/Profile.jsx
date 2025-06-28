import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { getCurrentStreak } from '../../api/streakApi';
import { getLearningRecords, getAllCategories } from '../../api/flashcardApi';
import UserStats from '../../components/UserStats';
import ProfileSkeleton from '../../components/ProfileSkeleton';
import '../../style/Profile.css';
import '../../style/UserStats.css';

const Profile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalWordsLearned: 0,
    categoriesCompleted: 0,
    totalCategories: 0,
    streakCount: 0,
    learningRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isAuthenticated || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [learningRecords, categories, streakData] = await Promise.all([
          getLearningRecords(currentUser._id),
          getAllCategories(),
          getCurrentStreak(currentUser._id)
        ]);

        // Calculate statistics
        let totalWordsLearned = 0;
        let categoriesCompleted = 0;

        if (learningRecords && learningRecords.length > 0) {
          learningRecords.forEach(record => {
            if (record.remembered && record.remembered.length > 0) {
              totalWordsLearned += record.remembered.length;
              // Consider a category completed if at least 70% words are learned
              const category = categories.find(cat => cat._id === record.category || cat._id === record.category?._id);
              if (category && (record.remembered.length / category.totalWords) >= 0.7) {
                categoriesCompleted++;
              }
            }
          });
        }

        setStats({
          totalWordsLearned,
          categoriesCompleted,
          totalCategories: categories?.length || 0,
          streakCount: streakData?.streakCount || 0,
          learningRecords: learningRecords || []
        });

      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError('Không thể tải thông tin thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Bạn cần đăng nhập để xem trang này</h2>
          <p>Vui lòng đăng nhập để xem thông tin tài khoản của bạn.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-initial">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{currentUser?.username || 'Người dùng'}</h1>
            <p className="profile-email">{currentUser?.email || 'Chưa có email'}</p>
            <p className="profile-join-date">
              Tham gia: {currentUser?.createdAt ? 
                new Date(currentUser.createdAt).toLocaleDateString('vi-VN') : 
                'Không xác định'}
            </p>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <h2>Thống kê học tập</h2>
        <UserStats stats={stats} compact={false} />
      </div>

      <div className="profile-progress">
        <h2>Tiến độ theo chủ đề</h2>
        {error ? (
          <div className="progress-error">
            <p>{error}</p>
          </div>
        ) : stats.learningRecords.length > 0 ? (
          <div className="progress-list">
            {stats.learningRecords.map((record) => {
              const rememberedCount = record.remembered?.length || 0;
              const totalWords = record.category?.totalWords || 0;
              const progressPercentage = totalWords > 0 ? Math.round((rememberedCount / totalWords) * 100) : 0;
              
              return (
                <div key={record._id} className="progress-item">
                  <div className="progress-header">
                    <h3 className="progress-title">
                      {record.category?.categoryTopic || 'Chủ đề không xác định'}
                    </h3>
                    <span className="progress-percentage">{progressPercentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="progress-details">
                    <span>{rememberedCount}/{totalWords} từ vựng</span>
                    <span className={`progress-status ${progressPercentage >= 70 ? 'completed' : 'in-progress'}`}>
                      {progressPercentage >= 70 ? 'Hoàn thành' : 'Đang học'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-progress">
            <p>Bạn chưa học chủ đề nào. Hãy bắt đầu học từ vựng ngay!</p>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <button className="action-button primary" onClick={() => window.location.href = '/flashcard'}>
          Tiếp tục học
        </button>
        <button className="action-button secondary" onClick={() => window.location.href = '/streak'}>
          Xem streak
        </button>
      </div>
    </div>
  );
};

export default Profile;
