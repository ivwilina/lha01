import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getWordsInCategory, markWordAsLearned, getCategoryById } from '../../api/flashcardApi';
import '../../style/FlashcardLearning.css';
import volumeIcon from '../../assets/icons/volume-high-svgrepo-com.svg';

const FlashcardLearning = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState({
    categoryTopic: 'Loading...',
    totalWords: 0
  });
  const [markingAsLearned, setMarkingAsLearned] = useState(false);

  // Fetch words when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch category info
        try {
          const categoryData = await getCategoryById(categoryId);
          setCategoryInfo({
            categoryTopic: categoryData.categoryTopic || 'Unknown Category',
            totalWords: categoryData.totalWords || 0
          });
        } catch (categoryError) {
          console.warn('Could not fetch category info:', categoryError);
        }
        
        // Fetch words
        let wordsData;
        try {
          wordsData = await getWordsInCategory(categoryId);
        } catch (error) {
          console.warn('API error, using sample data instead:', error);
          // Sample data if API fails
          wordsData = [
            { 
              _id: '1', 
              word: 'accept', 
              IPA: 'əkˈsept', 
              partOfSpeech: 'Verb', 
              meaning: 'nhận, chấp nhận',
              example: 'We accept payment by Visa Electron, Visa, Switch, Maestro, Mastercard, JCB, Solo, check or cash.'
            },
            {
              _id: '2', 
              word: 'algorithm', 
              IPA: 'ˈælɡərɪðm', 
              partOfSpeech: 'Noun', 
              meaning: 'thuật toán',
              example: 'The search engine uses a complex algorithm to rank websites.'
            },
            {
              _id: '3', 
              word: 'database', 
              IPA: 'ˈdeɪtəbeɪs', 
              partOfSpeech: 'Noun', 
              meaning: 'cơ sở dữ liệu',
              example: 'The application stores all user information in a secure database.'
            }
          ];
        }
        
        if (wordsData && Array.isArray(wordsData) && wordsData.length > 0) {
          setWords(wordsData);
          setError(null);
        } else {
          setError('Không có từ vựng nào trong danh mục này.');
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải từ vựng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [categoryId, isAuthenticated, navigate]);

  // Play pronunciation audio
  const playAudio = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported in this browser');
    }
  };

  // Handle flip card action
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Go to next word
  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setIsFlipped(false); // Reset to front side
    }
  };

  // Mark current word as learned
  const handleMarkAsLearned = async () => {
    if (!currentUser || !currentUser._id) {
      console.error('User not authenticated');
      return;
    }

    const currentWord = words[currentWordIndex];
    if (!currentWord || !currentWord._id) {
      console.error('Invalid word data');
      return;
    }

    try {
      setMarkingAsLearned(true);
      
      // Mark word as learned in backend
      await markWordAsLearned(currentUser._id, categoryId, currentWord._id);
      
      console.log(`Marked word "${currentWord.word}" as learned`);
      
      // Move to next word
      handleNextWord();
    } catch (error) {
      console.error('Error marking word as learned:', error);
      // Still proceed to next word even if marking fails
      handleNextWord();
    } finally {
      setMarkingAsLearned(false);
    }
  };

  if (loading) {
    return (
      <div className="flashcard-loading">
        <div className="spinner"></div>
        <p>Đang tải từ vựng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/flashcard')} className="retry-button">
          Quay lại
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flashcard-error">
        <h3>Không có từ vựng</h3>
        <p>Danh mục này chưa có từ vựng nào.</p>
        <button onClick={() => navigate('/flashcard')} className="retry-button">
          Quay lại
        </button>
      </div>
    );
  }

  const currentWord = words[currentWordIndex];
  
  return (
    <div className="flashcard-learning-container">
      <div className="header">
        <div className="flashcard-info">
          <h1>{categoryInfo.categoryTopic}</h1>
          <p className="word-count">{words.length} WORDS IN TOTAL</p>
        </div>
      </div>      <div className="flashcard-content">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
          onClick={handleFlipCard}
        >
          {/* Front of the card - Word and phonetic */}
          <div className="flashcard-front">
            <div className="front-content">
              <div className="audio-button-container">
                <button 
                  className="audio-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card flip
                    playAudio(currentWord.word);
                  }}
                >
                  <img src={volumeIcon} alt="Pronunciation" />
                </button>
              </div>
              <div className="word-display">
                <div className="word-text">
                  {currentWord.word}
                </div>
                <div className="word-phonetic">
                  {currentWord.IPA}
                </div>
              </div>
            </div>
          </div>
          
          {/* Back of the card - Word details */}
          <div className="flashcard-back">
            <div className="back-content">
              <p className="part-of-speech">Part of speech: {currentWord.partOfSpeech}</p>
              <p className="meaning">Meaning: {currentWord.meaning}</p>
              {currentWord.example && (
                <p className="example">Example: {currentWord.example}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flashcard-actions">
        <button 
          className="action-button mark-learned-button" 
          onClick={handleMarkAsLearned}
          disabled={markingAsLearned}
        >
          {markingAsLearned ? 'Marking...' : 'Mark as learned'}
        </button>
        <button 
          className="action-button next-word-button" 
          onClick={handleNextWord}
        >
          Next word
        </button>
      </div>
    </div>
  );
};

export default FlashcardLearning;
