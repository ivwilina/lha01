import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getAllCategories, getLearningRecords } from '../../api/flashcardApi';
import '../../style/QuizSelection.css';

const QuizSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [learningRecords, setLearningRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories và learning records
        const [categoriesData, learningData] = await Promise.all([
          getAllCategories(),
          currentUser ? getLearningRecords(currentUser._id) : Promise.resolve([])
        ]);
        
        setCategories(categoriesData);
        setLearningRecords(learningData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, currentUser, navigate]);

  // Filter categories that have learning progress (for learned words quiz)
  const getLearnedCategories = () => {
    const learningMap = new Map();
    learningRecords.forEach(record => {
      const categoryId = typeof record.category === 'string' 
        ? record.category 
        : record.category?._id;
      
      if (categoryId && record.remembered && record.remembered.length > 0) {
        learningMap.set(categoryId, record.remembered.length);
      }
    });

    return categories.filter(category => learningMap.has(category._id))
      .map(category => ({
        ...category,
        learnedWordsCount: learningMap.get(category._id)
      }));
  };

  const handleNewWordsQuiz = () => {
    navigate('/quiz/selection/new-words');
  };

  const handleLearnedWordsQuiz = () => {
    const learnedCategories = getLearnedCategories();
    if (learnedCategories.length === 0) {
      alert('Bạn chưa học từ nào. Hãy học flashcard trước khi làm quiz từ đã học!');
      return;
    }
    navigate('/quiz/selection/learned-words');
  };

  if (loading) {
    return (
      <div className="quiz-selection-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-selection-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  const learnedCategories = getLearnedCategories();
  const totalLearnedWords = learnedCategories.reduce((sum, cat) => sum + cat.learnedWordsCount, 0);

  return (
    <div className="quiz-selection-container">
      <div className="quiz-selection-header">
        <h1>Chọn loại Quiz</h1>
        <p>Hãy chọn loại quiz phù hợp với mục tiêu học tập của bạn</p>
      </div>

      <div className="quiz-options">
        {/* New Words Quiz Option */}
        <div 
          className="quiz-option new-words-option"
          onClick={handleNewWordsQuiz}
        >
          <div className="quiz-option-icon">
            <div className="icon-circle new-words-icon">
              <span>📚</span>
            </div>
          </div>
          
          <div className="quiz-option-content">
            <h3>Quiz từ mới</h3>
            <p>Học và test từ vựng mới từ các chủ đề</p>
            
            <div className="quiz-option-stats">
              <div className="stat-item">
                <span className="stat-label">Chủ đề có sẵn</span>
                <span className="stat-value">{categories.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Độ khó</span>
                <span className="stat-value">Dễ - Trung bình</span>
              </div>
            </div>
          </div>
          
          <div className="quiz-option-arrow">→</div>
        </div>

        {/* Learned Words Quiz Option */}
        <div 
          className="quiz-option learned-words-option"
          onClick={handleLearnedWordsQuiz}
        >
          <div className="quiz-option-icon">
            <div className="icon-circle learned-words-icon">
              <span>🎓</span>
            </div>
          </div>
          
          <div className="quiz-option-content">
            <h3>Quiz từ đã học</h3>
            <p>Ôn tập và củng cố từ vựng đã học</p>
            
            <div className="quiz-option-stats">
              <div className="stat-item">
                <span className="stat-label">Từ đã học</span>
                <span className="stat-value">{totalLearnedWords}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chủ đề đã học</span>
                <span className="stat-value">{learnedCategories.length}</span>
              </div>
            </div>
            
            {learnedCategories.length === 0 && (
              <div className="quiz-option-disabled">
                <span>Học flashcard trước để mở khóa!</span>
              </div>
            )}
          </div>
          
          <div className="quiz-option-arrow">→</div>
        </div>
      </div>

      <div className="quiz-selection-footer">
        <button 
          onClick={() => navigate('/flashcard')} 
          className="back-to-flashcard-button"
        >
          ← Quay lại Flashcard
        </button>
      </div>
    </div>
  );
};

export default QuizSelection;
