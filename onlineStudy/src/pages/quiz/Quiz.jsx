import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { 
  getWordsInCategory, 
  createQuiz, 
  submitQuiz 
} from '../../api/flashcardApi';
import '../../style/Quiz.css';

const Quiz = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const createQuizFromCategory = async () => {
      try {
        setLoading(true);
        
        // Get words from category
        const words = await getWordsInCategory(categoryId);
        
        if (!words || words.length === 0) {
          setError('Không có từ vựng nào để tạo quiz');
          return;
        }

        // Get word IDs
        const wordIds = words.map(word => word._id);
        const numQuestions = Math.min(5, words.length); // Max 5 questions

        // Create quiz
        const newQuiz = await createQuiz(wordIds, numQuestions);
        setQuiz(newQuiz);
        
      } catch (err) {
        console.error('Error creating quiz:', err);
        setError('Không thể tạo quiz. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    createQuizFromCategory();
  }, [categoryId, isAuthenticated, navigate]);

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < Object.keys(quiz.questions).length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      
      // Convert answers to expected format
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      // Submit quiz
      const result = await submitQuiz(
        quiz._id, 
        formattedAnswers, 
        currentUser._id, 
        categoryId
      );
      
      setResults(result);
      setShowResults(true);
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Không thể nộp bài quiz. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
        <p>Đang tải quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => navigate(`/flashcard/${categoryId}`)} className="back-button">
          Quay lại
        </button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-results">
        <h2>Kết quả Quiz</h2>
        <div className="results-summary">
          <p>Điểm số: {results.score}/{results.totalQuestions}</p>
          <p>Tỷ lệ: {results.percentage}%</p>
          <p>Từ đã đánh dấu đã học: {results.wordsMarkedAsLearned}</p>
        </div>
        
        <div className="results-details">
          <h3>Câu trả lời đúng:</h3>
          {results.correctAnswers.map((answer, index) => (
            <div key={index} className="correct-answer">
              <p><strong>{answer.word}</strong> - {answer.correctAnswer}</p>
            </div>
          ))}
          
          {results.incorrectAnswers.length > 0 && (
            <>
              <h3>Câu trả lời sai:</h3>
              {results.incorrectAnswers.map((answer, index) => (
                <div key={index} className="incorrect-answer">
                  <p><strong>{answer.word}</strong></p>
                  <p>Bạn chọn: {answer.selectedOption}</p>
                  <p>Đáp án đúng: {answer.correctAnswer}</p>
                </div>
              ))}
            </>
          )}
        </div>
        
        <div className="results-actions">
          <button onClick={() => navigate(`/flashcard/${categoryId}`)} className="back-button">
            Quay lại Category
          </button>
          <button onClick={() => window.location.reload()} className="retry-button">
            Làm lại Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="quiz-error">
        <p>Không thể tải quiz</p>
      </div>
    );
  }

  const questions = Object.entries(quiz.questions);
  const currentQuestion = questions[currentQuestionIndex];
  const questionId = currentQuestion[0];
  const questionData = currentQuestion[1];
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>Quiz</h1>
        <p>Câu {currentQuestionIndex + 1} / {questions.length}</p>
      </div>
      
      <div className="quiz-content">
        <div className="question-card">
          <h2>{questionData.question}</h2>
          <p className="word-details">
            <strong>{questionData.word}</strong> {questionData.IPA && `[${questionData.IPA}]`}
          </p>
          {questionData.example && (
            <p className="example">"{questionData.example}"</p>
          )}
          
          <div className="options">
            {questionData.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${answers[questionId] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(questionId, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="quiz-navigation">
        <button 
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="nav-button"
        >
          Câu trước
        </button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={handleNextQuestion}
            className="nav-button"
          >
            Câu sau
          </button>
        ) : (
          <button 
            onClick={handleSubmitQuiz}
            disabled={!allAnswered}
            className="submit-button"
          >
            Nộp bài
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
