import '../style/QuizNavigation.css';

const QuizNavigation = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  onPrevious, 
  onNext, 
  onSubmit
}) => {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="quiz-navigation">
      <button 
        onClick={onPrevious}
        disabled={isFirstQuestion}
        className="nav-button prev"
      >
        ← Previous
      </button>

      {isLastQuestion ? (
        <button 
          onClick={onSubmit}
          className="submit-button"
          title="Submit quiz (you can submit even if some questions are unanswered)"
        >
          Submit Quiz
        </button>
      ) : (
        <button 
          onClick={onNext}
          className="nav-button next"
        >
          Next →
        </button>
      )}
    </div>
  );
};

export default QuizNavigation;
