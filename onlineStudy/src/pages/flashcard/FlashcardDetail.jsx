import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { 
  getCategoryById, 
  getWordsInCategory,
  createLearningRecord,
  getLearningProgress
} from '../../api/flashcardApi';
import '../../style/FlashcardDetail.css';
import flashcardIcon from '../../assets/icons/library-svgrepo-com.svg';

const FlashcardDetail = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [learningRecord, setLearningRecord] = useState(null);
  const [totalWords, setTotalWords] = useState(0);
  const [rememberedWords, setRememberedWords] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
      const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin category
        const categoryData = await getCategoryById(categoryId);
        console.log("Category data fetched:", categoryData); // Debug log
        setCategory(categoryData);
        
        // Lấy danh sách từ để đảm bảo có số lượng từ chính xác
        let totalWordsCount = 0;
        try {
          const wordsData = await getWordsInCategory(categoryId);
          totalWordsCount = wordsData.length;
          console.log(`Words data fetched: ${totalWordsCount} words`); // Debug log
        } catch (error) {
          console.log('Error fetching words:', error);
          // Nếu không lấy được danh sách từ, sử dụng totalWords từ category
          totalWordsCount = categoryData?.totalWords || 0;
        }
        
        // Cập nhật số lượng từ
        setTotalWords(totalWordsCount > 0 ? totalWordsCount : (categoryData?.totalWords || 0));
        
        // Lấy thông tin learning progress nếu có user
        if (currentUser && currentUser._id) {
          try {
            const progressData = await getLearningProgress(currentUser._id, categoryId);
            
            if (progressData) {
              setTotalWords(progressData.totalWordsCount);
              setRememberedWords(progressData.rememberedWordsCount);
              console.log(`Progress: ${progressData.rememberedWordsCount}/${progressData.totalWordsCount} words learned`);
              
              // Set learning record info if exists
              if (progressData.remembered && progressData.remembered.length > 0) {
                setLearningRecord({ remembered: progressData.remembered });
              }
            } else {
              console.log("No learning progress found for this category");
              setRememberedWords(0);
            }
          } catch (error) {
            console.log('Error fetching learning progress:', error);
            setRememberedWords(0);
          }
        }
        
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
        console.error('Error fetching category details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, currentUser, isAuthenticated, navigate]);
  
  // Xử lý khi click vào nút "View all words"
  const handleViewAllWords = () => {
    navigate(`/flashcard/${categoryId}/words`);
  };
  
  // Xử lý khi click vào nút "Continue learning"
  const handleContinueLearning = async () => {
    if (!learningRecord) {
      try {
        // Tạo learning record mới nếu chưa có
        await createLearningRecord(currentUser._id, categoryId);
      } catch (error) {
        console.error('Error creating learning record:', error);
      }
    }
    navigate(`/flashcard/${categoryId}/learn`);
  };
  
  // Xử lý khi click vào nút "Start a Quiz"
  const handleStartQuiz = () => {
    navigate(`/quiz/category/${categoryId}`);
  };
  
  if (loading) {
    return (
      <div className="flashcard-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flashcard-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/flashcard')} className="back-button">
          Quay lại
        </button>
      </div>
    );
  }
  
  return (
    <div className="flashcard-detail-container">
      <div className="flashcard-detail-header">
        <div className="header-icon-wrapper">
          <img src={flashcardIcon} alt="Flashcard" className="header-icon" />
          <h1>{category?.categoryTopic || 'Unknown Category'}</h1>
        </div>
        <div className="category-status">
          <span className={learningRecord ? 'in-progress' : 'new'}>
            {learningRecord ? 'IN PROGRESS' : 'NEW'}
          </span>
        </div>
      </div>
      
      <div className="flashcard-stats-container">
        <div className="stats-chart">          <div className="pie-chart">
            {/* Dữ liệu chart được cố định bằng CSS */}
            <div className="remembered-slice" style={{ 
              '--remembered-percentage': totalWords > 0 ? `${(rememberedWords / totalWords) * 100}%` : '0%'
            }}>
              <span className="remembered-count">{rememberedWords}</span>
            </div>
            <div className="total-slice">
              <span className="total-count">{totalWords || 0}</span>
            </div>
          </div>
          
          <div className="stats-legend">
            <div className="legend-item">
              <div className="legend-color total-color"></div>
              <span>TOTAL WORD</span>
            </div>
            <div className="legend-item">
              <div className="legend-color remembered-color"></div>
              <span>REMEMBERED</span>
            </div>
          </div>
        </div>
        
        <div className="flashcard-actions">
          <button className="action-button primary-button" onClick={handleViewAllWords}>
            View all words
          </button>
          <button className="action-button primary-button" onClick={handleContinueLearning}>
            Continue learning
          </button>
        </div>
      </div>
      
      <div className="flashcard-quiz-container">
        <div className="quiz-prompt">
          <span>Feeling confident?</span>
        </div>
        <button className="quiz-button" onClick={handleStartQuiz}>
          Start a Quiz
        </button>
      </div>
    </div>
  );
};

export default FlashcardDetail;
