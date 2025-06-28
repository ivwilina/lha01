import { useState, useEffect } from 'react';
import '../style/QuizQuestion.css';

const QuizQuestion = ({ questionData, questionId, onAnswerChange, currentAnswer }) => {
  const [userAnswer, setUserAnswer] = useState(currentAnswer || '');
  const [draggedItems, setDraggedItems] = useState({});
  const [wordMatches, setWordMatches] = useState({});

  useEffect(() => {
    setUserAnswer(currentAnswer || '');
  }, [currentAnswer]);

  useEffect(() => {
    // Initialize word matches for word_match type
    if (questionData.type === 'word_match') {
      if (currentAnswer) {
        try {
          const parsedAnswer = JSON.parse(currentAnswer);
          setWordMatches(parsedAnswer);
        } catch {
          setWordMatches({});
        }
      }
    }
  }, [questionData.type, currentAnswer]);

  const handleMultipleChoiceSelect = (option) => {
    setUserAnswer(option);
    onAnswerChange(questionId, option);
  };

  const handleTextInputChange = (value) => {
    setUserAnswer(value);
    onAnswerChange(questionId, value);
  };

  const handleWordMatch = (word, meaning) => {
    const newMatches = { ...wordMatches, [word]: meaning };
    setWordMatches(newMatches);
    
    // For word match, we need to check if the main word is matched correctly
    const isCorrect = newMatches[questionData.word] === questionData.correctAnswer;
    const answerValue = isCorrect ? questionData.correctAnswer : '';
    
    setUserAnswer(answerValue);
    onAnswerChange(questionId, JSON.stringify(newMatches));
  };

  const renderMultipleChoice = () => (
    <div className="quiz-options">
      {questionData.options.map((option, index) => (
        <button
          key={index}
          className={`option-button ${userAnswer === option ? 'selected' : ''}`}
          onClick={() => handleMultipleChoiceSelect(option)}
        >
          <span className="option-letter">{String.fromCharCode(65 + index)}</span>
          <span className="option-text">{option}</span>
        </button>
      ))}
    </div>
  );

  const renderFillBlank = () => (
    <div className="fill-blank-container">
      <div className="fill-blank-input">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => handleTextInputChange(e.target.value)}
          placeholder={questionData.placeholder || 'Type your answer here...'}
          className="text-input"
        />
      </div>
      <div className="fill-blank-hint">
        <p><strong>Hint:</strong> Use the word that best fits the context</p>
      </div>
    </div>
  );

  const renderWordMatch = () => (
    <div className="word-match-container">
      <div className="word-match-instruction">
        <p>Match each word with its correct meaning by clicking on the word, then click on its meaning:</p>
      </div>
      
      <div className="word-match-grid">
        <div className="words-column">
          <h4>Words</h4>
          {questionData.words.map((word, index) => (
            <div
              key={index}
              className={`word-item ${wordMatches[word] ? 'matched' : ''} ${word === questionData.word ? 'target-word' : ''}`}
              onClick={() => setDraggedItems({ ...draggedItems, selectedWord: word })}
            >
              {word}
              {wordMatches[word] && (
                <span className="match-indicator">→ {wordMatches[word]}</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="meanings-column">
          <h4>Meanings</h4>
          {questionData.meanings.map((meaning, index) => (
            <div
              key={index}
              className={`meaning-item ${Object.values(wordMatches).includes(meaning) ? 'matched' : ''}`}
              onClick={() => {
                if (draggedItems.selectedWord) {
                  handleWordMatch(draggedItems.selectedWord, meaning);
                  setDraggedItems({});
                }
              }}
            >
              {meaning}
            </div>
          ))}
        </div>
      </div>
      
      {draggedItems.selectedWord && (
        <div className="selection-indicator">
          Selected word: <strong>{draggedItems.selectedWord}</strong> - Click on a meaning to match
        </div>
      )}
      
      <div className="word-match-progress">
        Matched: {Object.keys(wordMatches).length} / {questionData.words.length}
      </div>
    </div>
  );

  const renderCompleteWord = () => (
    <div className="complete-word-container">
      <div className="hidden-word-display">
        <h3>{questionData.hiddenWord}</h3>
      </div>
      
      <div className="complete-word-input">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => handleTextInputChange(e.target.value)}
          placeholder={questionData.placeholder || 'Type the complete word...'}
          className="text-input"
        />
      </div>
      
      {questionData.hint && questionData.type === 'complete_word' && (
        <div className="complete-word-hint">
          <p><strong>Hint:</strong> {questionData.hint}</p>
        </div>
      )}
    </div>
  );

  const renderQuestionContent = () => {
    switch (questionData.type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'fill_blank':
        return renderFillBlank();
      case 'word_match':
        return renderWordMatch();
      case 'complete_word':
        return renderCompleteWord();
      default:
        return renderMultipleChoice();
    }
  };

  const getQuestionTypeLabel = () => {
    switch (questionData.type) {
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

  return (
    <div className="quiz-question-container">
      <div className="question-type-badge">
        {getQuestionTypeLabel()}
      </div>
      
      <div className="quiz-question">
        <h3>{questionData.question}</h3>
        
        {/* Show minimal word info only for word_match questions */}
        {questionData.type === 'word_match' && (
          <div className="word-info-minimal">
            <span className="target-word-label">Target word: <strong>{questionData.word}</strong></span>
          </div>
        )}
      </div>

      {renderQuestionContent()}
      
      <div className="answer-status">
        {userAnswer ? (
          <span className="answered">✓ Answered</span>
        ) : (
          <span className="not-answered">⚪ Not answered</span>
        )}
      </div>
    </div>
  );
};

export default QuizQuestion;
