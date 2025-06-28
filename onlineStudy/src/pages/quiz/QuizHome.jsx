import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getAllCategories, getLearningRecords } from '../../api/flashcardApi';
import '../../style/QuizHome.css';
import quizIcon from '../../assets/icons/student-cap-svgrepo-com.svg';

const QuizHome = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriesWithProgress, setCategoriesWithProgress] = useState([]);
  const [totalLearnedWords, setTotalLearnedWords] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState(10);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // Fetch all categories
        const allCategories = await getAllCategories();
        
        // Fetch user learning records
        let userLearningRecords = [];
        let totalWordsLearned = 0;
        
        if (currentUser && currentUser._id) {
          try {
            userLearningRecords = await getLearningRecords(currentUser._id);
            
            // Calculate total learned words
            totalWordsLearned = userLearningRecords.reduce((total, record) => {
              return total + (record.remembered ? record.remembered.length : 0);
            }, 0);
            
            setTotalLearnedWords(totalWordsLearned);
          } catch (learningError) {
            console.warn('Error fetching learning records:', learningError);
          }
        }
        
        // Create categories with learning progress
        const learningMap = new Map();
        userLearningRecords.forEach(record => {
          const categoryId = typeof record.category === 'string' 
            ? record.category 
            : record.category?._id;
          
          if (categoryId && record.remembered && record.remembered.length > 0) {
            learningMap.set(categoryId, {
              rememberedCount: record.remembered.length,
              rememberedWords: record.remembered
            });
          }
        });
        
        // Filter categories that have learned words
        const categoriesWithLearnedWords = allCategories
          .map(category => {
            const learningInfo = learningMap.get(category._id);
            return {
              ...category,
              rememberedCount: learningInfo ? learningInfo.rememberedCount : 0,
              rememberedWords: learningInfo ? learningInfo.rememberedWords : []
            };
          })
          .filter(category => category.rememberedCount > 0);
        
        setCategoriesWithProgress(categoriesWithLearnedWords);
        
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Không thể tải dữ liệu quiz. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [isAuthenticated, currentUser, navigate]);

  const handleCategoryQuiz = (categoryId) => {
    navigate(`/quiz/category/${categoryId}?questions=${selectedQuestions}`);
  };

  const handleComprehensiveQuiz = () => {
    navigate(`/quiz/comprehensive?questions=${selectedQuestions}`);
  };

  const handleRandomQuiz = () => {
    navigate(`/quiz/random?questions=${selectedQuestions}`);
  };

  if (loading) {
    return (
      <div className="quiz-home-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-home-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-home-container">
      <div className="quiz-home-header">
        <div className="quiz-icon-title">
          <img src={quizIcon} alt="Quiz" className="quiz-icon" />
          <h1>Quiz</h1>
        </div>
        <p className="quiz-subtitle">
          Kiểm tra kiến thức từ vựng của bạn với các bài quiz đa dạng
        </p>
      </div>

      {/* Question Count Selection */}
      <div className="question-count-section">
        <h3>Chọn số câu hỏi:</h3>
        <div className="question-count-options">
          {[10, 30, 60].map(count => (
            <button
              key={count}
              className={`question-count-btn ${selectedQuestions === count ? 'selected' : ''}`}
              onClick={() => setSelectedQuestions(count)}
            >
              {count} câu
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Options */}
      <div className="quiz-options">
        
        {/* Option 1: Category Review */}
        <div className="quiz-option-section">
          <h2>1. Ôn tập theo chủ đề</h2>
          <p>Ôn tập các từ đã học trong một chủ đề cụ thể</p>
          
          {categoriesWithProgress.length > 0 ? (
            <div className="categories-list">
              {categoriesWithProgress.map(category => (
                <div 
                  key={category._id}
                  className="category-quiz-card"
                  onClick={() => handleCategoryQuiz(category._id)}
                >
                  <div className="category-quiz-info">
                    <h4>{category.categoryTopic}</h4>
                    <p>{category.rememberedCount} từ đã học</p>
                  </div>
                  <div className="quiz-start-btn">
                    <span>Bắt đầu Quiz</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-learned-words">
              <p>Bạn chưa học từ vựng nào. Hãy học flashcard trước khi làm quiz!</p>
              <button 
                onClick={() => navigate('/flashcard')}
                className="learn-first-btn"
              >
                Đi học Flashcard
              </button>
            </div>
          )}
        </div>

        {/* Option 2: Comprehensive Quiz */}
        <div className="quiz-option-section">
          <h2>2. Quiz tổng hợp</h2>
          <p>Tổng hợp tất cả các từ đã học từ mọi chủ đề</p>
          
          <div className="comprehensive-quiz-card">
            <div className="comprehensive-info">
              <h4>Quiz từ tất cả các chủ đề đã học</h4>
              <p>{totalLearnedWords} từ đã học tổng cộng</p>
            </div>
            <button 
              className="quiz-action-btn comprehensive-btn"
              onClick={handleComprehensiveQuiz}
              disabled={totalLearnedWords === 0}
            >
              {totalLearnedWords > 0 ? 'Bắt đầu Quiz Tổng hợp' : 'Chưa có từ đã học'}
            </button>
          </div>
        </div>

        {/* Option 3: Random Quiz */}
        <div className="quiz-option-section">
          <h2>3. Quiz ngẫu nhiên</h2>
          <p>Quiz với các từ vựng ngẫu nhiên từ tất cả các chủ đề</p>
          
          <div className="random-quiz-card">
            <div className="random-info">
              <h4>Quiz từ vựng ngẫu nhiên</h4>
              <p>Thử thách bản thân với các từ vựng bất kỳ</p>
            </div>
            <button 
              className="quiz-action-btn random-btn"
              onClick={handleRandomQuiz}
            >
              Bắt đầu Quiz Ngẫu nhiên
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizHome;
