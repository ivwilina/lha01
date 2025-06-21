import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCategories } from '../../api/flashcardApi';
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

const FlashcardHome = () => {  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        let data;
        
        try {
          // Thử lấy dữ liệu từ API
          data = await getAllCategories();
        } catch (apiError) {
          console.warn('API error, using sample data instead:', apiError);
          // Nếu API lỗi, dùng dữ liệu mẫu
          data = SAMPLE_CATEGORIES;
        }
        
        // Phân loại categories thành recommended và in progress
        const recommendedCategories = data.filter((cat, index) => index < 4);
        const inProgressCategories = data.filter((cat, index) => index >= 4);
        
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
  }, []);
  
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
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* In Progress Categories */}
      <div className="category-section">
        <div className="category-header">
          <div className="category-label in-progress">IN PROGRESS</div>
        </div>
        <div className="categories-grid">
          {categories.inProgress && categories.inProgress.map((category) => (
            <div 
              key={category._id} 
              className="category-card"
              onClick={() => handleCategoryClick(category._id)}
            >
              <h3>{category.categoryTopic}</h3>
              <div className="category-info">
                <span className="word-count">{category.totalWords} từ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardHome;
