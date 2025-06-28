import '../style/QuizResults.css';

const QuizResults = ({ results, category, onRetry, onBackToQuiz }) => {
  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice':
        return '📝';
      case 'fill_blank':
        return '📄';
      case 'word_match':
        return '🔗';
      case 'complete_word':
        return '🧩';
      default:
        return '❓';
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'fill_blank':
        return 'Fill in the Blank';
      case 'word_match':
        return 'Word Matching';
      case 'complete_word':
        return 'Complete the Word';
      default:
        return 'Question';
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getGradeText = (percentage) => {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good Job!';
    return 'Keep Practicing!';
  };

  return (
    <div className="quiz-results">
      <div className="results-header">
        <h2>Quiz Results</h2>
        {category && <p className="category-name">{category.categoryTopic}</p>}
      </div>
      
      <div className="score-summary">
        <div 
          className="score-circle"
          style={{ borderColor: getGradeColor(results.percentage) }}
        >
          <span className="score-text">{results.score}/{results.totalQuestions}</span>
          <span 
            className="percentage-text"
            style={{ color: getGradeColor(results.percentage) }}
          >
            {results.percentage}%
          </span>
          <span 
            className="grade-text"
            style={{ color: getGradeColor(results.percentage) }}
          >
            {getGradeText(results.percentage)}
          </span>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="performance-breakdown">
        <h3>Performance by Question Type</h3>
        <div className="type-stats">        {/* Group answers by type */}
        {(() => {
          const typeStats = {};
          
          [...results.correctAnswers, ...results.incorrectAnswers, ...(results.skippedAnswers || [])].forEach(answer => {
            const type = answer.type || 'multiple_choice';
            if (!typeStats[type]) {
              typeStats[type] = { correct: 0, incorrect: 0, skipped: 0, total: 0 };
            }
            typeStats[type].total++;
            
            if (results.correctAnswers.find(a => a.questionId === answer.questionId)) {
              typeStats[type].correct++;
            } else if (results.incorrectAnswers.find(a => a.questionId === answer.questionId)) {
              typeStats[type].incorrect++;
            } else if (results.skippedAnswers && results.skippedAnswers.find(a => a.questionId === answer.questionId)) {
              typeStats[type].skipped++;
            }
          });

          return Object.entries(typeStats).map(([type, stats]) => (
            <div key={type} className="type-stat">
              <div className="type-info">
                <span className="type-icon">{getQuestionTypeIcon(type)}</span>
                <span className="type-label">{getQuestionTypeLabel(type)}</span>
              </div>
              <div className="type-score">
                {stats.correct}/{stats.total}
                <span className="type-percentage">
                  ({((stats.correct / stats.total) * 100).toFixed(0)}%)
                </span>
                {stats.skipped > 0 && (
                  <span className="skipped-info">({stats.skipped} skipped)</span>
                )}
              </div>
            </div>
          ));
        })()}
        </div>
      </div>

      <div className="results-details">
        {results.correctAnswers.length > 0 && (
          <div className="result-section correct">
            <h4>✅ Correct Answers ({results.correctAnswers.length})</h4>
            <div className="answers-list">
              {results.correctAnswers.map((answer, index) => (
                <div key={index} className="answer-detail">
                  <div className="answer-header">
                    <span className="type-badge">
                      {getQuestionTypeIcon(answer.type)} {getQuestionTypeLabel(answer.type)}
                    </span>
                    <span className="word-badge">{answer.word}</span>
                  </div>
                  <div className="answer-content">
                    <span className="answer-text">Your answer: {answer.selectedOption}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.incorrectAnswers.length > 0 && (
          <div className="result-section incorrect">
            <h4>❌ Incorrect Answers ({results.incorrectAnswers.length})</h4>
            <div className="answers-list">
              {results.incorrectAnswers.map((answer, index) => (
                <div key={index} className="answer-detail">
                  <div className="answer-header">
                    <span className="type-badge">
                      {getQuestionTypeIcon(answer.type)} {getQuestionTypeLabel(answer.type)}
                    </span>
                    <span className="word-badge">{answer.word}</span>
                  </div>
                  <div className="answer-content">
                    <span className="incorrect-answer">Your answer: {answer.selectedOption || 'No answer'}</span>
                    <span className="correct-answer">Correct answer: {answer.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.skippedAnswers && results.skippedAnswers.length > 0 && (
          <div className="result-section skipped">
            <h4>⏭️ Skipped Questions ({results.skippedAnswers.length})</h4>
            <div className="answers-list">
              {results.skippedAnswers.map((answer, index) => (
                <div key={index} className="answer-detail">
                  <div className="answer-header">
                    <span className="type-badge">
                      {getQuestionTypeIcon(answer.type)} {getQuestionTypeLabel(answer.type)}
                    </span>
                    <span className="word-badge">{answer.word}</span>
                  </div>
                  <div className="answer-content">
                    <span className="skipped-text">Question was skipped</span>
                    <span className="correct-answer">Correct answer: {answer.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="results-actions">
        <button onClick={onBackToQuiz} className="back-button">
          Back to Quiz Menu
        </button>
        <button onClick={onRetry} className="retry-button">
          Try Again
        </button>
      </div>
    </div>
  );
};

export default QuizResults;
