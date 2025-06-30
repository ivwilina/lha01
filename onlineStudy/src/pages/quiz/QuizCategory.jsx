import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  createCategoryQuiz,
  submitQuiz,
  getCategoryById,
} from "../../api/flashcardApi";
import QuizQuestion from "../../components/QuizQuestion";
import QuizResults from "../../components/QuizResults";
import QuestionList from "../../components/QuestionList";
import QuizTimer from "../../components/QuizTimer";
import QuizNavigation from "../../components/QuizNavigation";
import "../../style/Quiz.css";
import "../../style/QuizLayout.css";

const QuizCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const numQuestions = parseInt(searchParams.get("questions")) || 10;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const createQuiz = async () => {
      try {
        setLoading(true);

        // Get category details
        const categoryDetails = await getCategoryById(categoryId);
        setCategory(categoryDetails);

        // Create category quiz
        const newQuiz = await createCategoryQuiz(
          categoryId,
          currentUser._id,
          numQuestions
        );
        setQuiz(newQuiz);

        // Set timer (2 minutes per question)
        setTimeLeft(numQuestions * 120);
      } catch (err) {
        console.error("Error creating category quiz:", err);
        setError(err.message || "Không thể tạo quiz");
      } finally {
        setLoading(false);
      }
    };

    createQuiz();
  }, [categoryId, currentUser, numQuestions, isAuthenticated, navigate]);

    const handleSubmitQuiz = useCallback(async () => {
    try {
      setLoading(true);

      // Format answers for API - handle different question types
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedOption]) => {
          const question = quiz.questions[questionId];
          let processedAnswer = selectedOption;

          // For word_match questions, extract the target word's match
          if (question && question.type === "word_match") {
            try {
              const wordMatches = JSON.parse(selectedOption);
              processedAnswer = wordMatches[question.word] || "";
            } catch {
              processedAnswer = "";
            }
          }

          // For text-based answers, normalize case
          if (
            question &&
            (question.type === "fill_blank" ||
              question.type === "complete_word")
          ) {
            processedAnswer = selectedOption.toLowerCase().trim();
          }

          return {
            questionId,
            selectedOption: processedAnswer,
          };
        }
      );

      // Submit quiz
      const quizResults = await submitQuiz(
        quiz._id,
        formattedAnswers,
        currentUser._id,
        categoryId
      );
      setResults(quizResults);
      setShowResults(true);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Không thể nộp bài quiz");
    } finally {
      setLoading(false);
    }
  }, [answers, quiz, currentUser, categoryId]);



  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz(); // Auto submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showResults, handleSubmitQuiz]);

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < Object.keys(quiz.questions).length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionSelect = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner"></div>
        <p>Đang tạo quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={() => navigate("/quiz")} className="back-button">
            Quay lại trang Quiz
          </button>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <QuizResults
        results={results}
        category={category}
        onRetry={() => window.location.reload()}
        onBackToQuiz={() => navigate("/quiz")}
      />
    );
  }

  if (!quiz || !quiz.questions) {
    return (
      <div className="quiz-error">
        <h3>Không thể tải quiz</h3>
        <p>Vui lòng thử lại sau</p>
        <button onClick={() => navigate("/quiz")} className="back-button">
          Quay lại trang Quiz
        </button>
      </div>
    );
  }

  const questionEntries = Object.entries(quiz.questions);
  const currentQuestion = questionEntries[currentQuestionIndex];
  const [questionId, questionData] = currentQuestion;

  return (
    <div className="quiz-layout">
      {/* Main Content Area */}
      <div className="quiz-main-content">
        <div className="quiz-header">
          <h2>Quiz: {category?.categoryTopic}</h2>
          <p className="quiz-description">Category-based vocabulary quiz</p>
        </div>

        <QuizQuestion
          questionData={questionData}
          questionId={questionId}
          onAnswerChange={handleAnswerSelect}
          currentAnswer={answers[questionId]}
        />
      </div>

      {/* Sidebar */}
      <div className="quiz-sidebar">
        <QuizTimer timeLeft={timeLeft} isRunning={!showResults} />

        <QuizNavigation
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questionEntries.length}
          onPrevious={handlePreviousQuestion}
          onNext={handleNextQuestion}
          onSubmit={handleSubmitQuiz}
        />

        <QuestionList
          questions={quiz.questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          onQuestionSelect={handleQuestionSelect}
        />
      </div>
    </div>
  );
};

export default QuizCategory;
