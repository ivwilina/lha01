import '../style/QuestionList.css';

const QuestionList = ({ questions, currentQuestionIndex, answers, onQuestionSelect }) => {
  const questionEntries = Object.entries(questions);

  const getQuestionStatus = (questionId, index) => {
    if (answers[questionId]) {
      return 'answered';
    }
    if (index === currentQuestionIndex) {
      return 'current';
    }
    return 'unanswered';
  };

  return (
    <div className="question-list">
      <h3 className="question-list-title">Questions</h3>
      <div className="question-grid">
        {questionEntries.map(([questionId, questionData], index) => {
          const status = getQuestionStatus(questionId, index);
          return (
            <div
              key={questionId}
              className={`question-grid-item ${status}`}
              onClick={() => onQuestionSelect(index)}
              title={`Question ${index + 1} - ${questionData.type}`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
      
      <div className="progress-summary">
        <div className="progress-text">
          Progress: {Object.keys(answers).length}/{questionEntries.length}
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${(Object.keys(answers).length / questionEntries.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
