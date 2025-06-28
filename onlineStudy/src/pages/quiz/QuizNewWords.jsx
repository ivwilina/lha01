import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getAllCategories, getLearningRecords } from '../../api/flashcardApi';
import '../../style/QuizCategories.css';

const QuizNewWords = () => {
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

  // Get available words count for each category (unlearned words)
  const getCategoryStats = (category) => {
    const learningRecord = learningRecords.find(record => {
      const categoryId = typeof record.category === 'string' 
        ? record.category 
        : record.category?._id;
      return categoryId === category._id;
    });

    const totalWords = category.words?.length || 0;
    const learnedWords = learningRecord?.remembered?.length || 0;
    const availableWords = totalWords - learnedWords;

    return {
      totalWords,
      learnedWords,
      availableWords
    };
  };

  const handleStartQuiz = (categoryId) => {
    navigate(`/quiz/${categoryId}?type=new-words`);
  };

  if (loading) {
    return (
      <div className="quiz-categories-loading">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-categories-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-categories-container">
      <div className="quiz-categories-header">
        <button 
          onClick={() => navigate('/quiz')} 
          className="back-button"
        >
          ← Quay lại
        </button>
        <h1>Quiz từ mới</h1>
        <p>Chọn chủ đề để bắt đầu quiz từ vựng mới</p>
      </div>

      <div className="categories-grid">
        {categories.map(category => {
          const stats = getCategoryStats(category);
          const isDisabled = stats.availableWords === 0;
          
          return (
            <div 
              key={category._id}
              className={`category-card ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && handleStartQuiz(category._id)}
            >
              <div className="category-card-header">
                <h3>{category.name}</h3>
                {isDisabled && (
                  <span className="category-badge completed">Hoàn thành</span>
                )}
              </div>
              
              <div className="category-stats">
                <div className="stat-row">
                  <span className="stat-label">Tổng từ:</span>
                  <span className="stat-value">{stats.totalWords}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Đã học:</span>
                  <span className="stat-value">{stats.learnedWords}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Có thể quiz:</span>
                  <span className="stat-value highlight">{stats.availableWords}</span>
                </div>
              </div>

              {stats.availableWords > 0 && (
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(stats.learnedWords / stats.totalWords) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round((stats.learnedWords / stats.totalWords) * 100)}% hoàn thành
                  </span>
                </div>
              )}

              {isDisabled ? (
                <div className="category-action disabled">
                  <span>Đã học hết từ trong chủ đề này</span>
                </div>
              ) : (
                <div className="category-action">
                  <button className="start-quiz-button">
                    Bắt đầu Quiz
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.filter(cat => getCategoryStats(cat).availableWords > 0).length === 0 && (
        <div className="no-categories-message">
          <div className="no-categories-icon">🎉</div>
          <h3>Chúc mừng!</h3>
          <p>Bạn đã học hết tất cả từ vựng. Hãy thử quiz từ đã học để ôn tập!</p>
          <button 
            onClick={() => navigate('/quiz/selection/learned-words')} 
            className="switch-quiz-button"
          >
            Chuyển sang Quiz từ đã học
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizNewWords;
