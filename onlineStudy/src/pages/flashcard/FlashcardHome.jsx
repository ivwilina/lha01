import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, getLearningRecords } from '../../api/flashcardApi';
import { useAuth } from '../../context/useAuth';
import '../../style/Flashcard.css';
import flashcardIcon from '../../assets/icons/library-svgrepo-com.svg';

// Dữ liệu mẫu trong trường hợp API không hoạt động
const SAMPLE_CATEGORIES = [
  { _id: '1', categoryTopic: 'Science', totalWords: 45 },
  { _id: '2', categoryTopic: 'Health', totalWords: 38 },
  { _id: '3', categoryTopic: 'Travel', totalWords: 52 },
  { _id: '4', categoryTopic: 'Sport', totalWords: 30 },
  { _id: '5', categoryTopic: 'Information Technology', totalWords: 65 },
  { _id: '6', categoryTopic: 'Ocean', totalWords: 27 }
];

const FlashcardHome = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        let allCategories;
        
        try {
          // Thử lấy dữ liệu từ API
          allCategories = await getAllCategories();
        } catch (apiError) {
          console.warn('API error, using sample data instead:', apiError);
          // Nếu API lỗi, dùng dữ liệu mẫu
          allCategories = SAMPLE_CATEGORIES;
        }
        
        // Lấy learning records của user để xác định categories đang học
        let userLearningRecords = [];
        if (isAuthenticated && currentUser && currentUser._id) {
          try {
            userLearningRecords = await getLearningRecords(currentUser._id);
            console.log('User learning records:', userLearningRecords);
          } catch (learningError) {
            console.warn('Error fetching learning records:', learningError);
            userLearningRecords = [];
          }
        }
        
        // Tạo map các category ID đang học và số từ đã nhớ
        const learningMap = new Map();
        userLearningRecords.forEach(record => {
          const categoryId = typeof record.category === 'string' 
            ? record.category 
            : record.category?._id;
          
          if (categoryId) {
            learningMap.set(categoryId, {
              rememberedCount: record.remembered ? record.remembered.length : 0,
              isInProgress: true
            });
          }
        });
        
        // Phân loại categories
        const recommendedCategories = [];
        const inProgressCategories = [];
        
        allCategories.forEach(category => {
          const learningInfo = learningMap.get(category._id);
          
          if (learningInfo && learningInfo.isInProgress && learningInfo.rememberedCount > 0) {
            // Category đang học - có ít nhất 1 từ đã học
            inProgressCategories.push({
              ...category,
              rememberedWords: learningInfo.rememberedCount,
              isInProgress: true,
              progressPercentage: Math.round((learningInfo.rememberedCount / category.totalWords) * 100)
            });
          } else {
            // Category recommend - chưa học hoặc chưa có progress đáng kể
            recommendedCategories.push({
              ...category,
              rememberedWords: learningInfo ? learningInfo.rememberedCount : 0,
              isInProgress: false,
              progressPercentage: 0
            });
          }
        });
        
        setCategories({
          recommended: recommendedCategories,
          inProgress: inProgressCategories
        });
        
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách category. Vui lòng thử lại sau.');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, currentUser]);
  
  // Nếu không đăng nhập, chuyển hướng đến trang login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/flashcard/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flashcard-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách chủ đề...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <div className="flashcard-icon-title">
          <img src={flashcardIcon} alt="Flashcard" className="flashcard-icon" />
          <h1>Flashcard</h1>
        </div>
        <p className="flashcard-subtitle">
          Cách nhanh chóng và hiệu quả để học từ vựng mới
        </p>
      </div>
      
      {/* Recommended Categories */}
      <div className="category-section">
        <div className="category-header">
          <div className="category-label recommended">RECOMMENDED</div>
        </div>
        <div className="categories-grid">
          {categories.recommended && categories.recommended.map((category) => (
            <div 
              key={category._id} 
              className="category-card"
              onClick={() => handleCategoryClick(category._id)}
            >
              <h3>{category.categoryTopic}</h3>
              <div className="category-info">
                <span className="word-count">{category.totalWords} từ</span>
                {!category.isInProgress && (
                  <span className="status-badge new">NEW</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* In Progress Categories */}
      {categories.inProgress && categories.inProgress.length > 0 && (
        <div className="category-section">
          <div className="category-header">
            <div className="category-label in-progress">IN PROGRESS</div>
          </div>
          <div className="categories-grid">
            {categories.inProgress.map((category) => (
              <div 
                key={category._id} 
                className="category-card in-progress-card"
                onClick={() => handleCategoryClick(category._id)}
              >
                <h3>{category.categoryTopic}</h3>
                <div className="category-info">
                  <span className="word-count">{category.totalWords} từ</span>
                  <div className="progress-info">
                    <span className="progress-text">
                      {category.rememberedWords || 0} / {category.totalWords} đã học
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${category.progressPercentage || 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No Progress Message */}
      {(!categories.inProgress || categories.inProgress.length === 0) && isAuthenticated && (
        <div className="no-progress-section">
          <div className="no-progress-content">
            <h3>Bạn chưa bắt đầu học chủ đề nào</h3>
            <p>Hãy chọn một chủ đề ở trên để bắt đầu hành trình học từ vựng!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardHome;
