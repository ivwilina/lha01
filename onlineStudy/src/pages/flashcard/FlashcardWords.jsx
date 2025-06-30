import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { getCategoryById, getWordsInCategory, getWordsWithIds } from '../../api/flashcardApi';
import '../../style/FlashcardWords.css';
import flashcardIcon from '../../assets/icons/library-svgrepo-com.svg';
import volumeIcon from '../../assets/icons/volume-high-svgrepo-com.svg';

// Dữ liệu mẫu trong trường hợp không có dữ liệu từ API
const SAMPLE_WORDS = [
  { 
    _id: '1', 
    word: 'accept', 
    phonetic: 'ək\'sept', 
    partOfSpeech: 'Verb', 
    meaning: 'nhận, chấp nhận',
    example: 'We accept payment by Visa Electron, Visa, Switch, Maestro, Mastercard, JCB, Solo, check or cash.'
  },
  {
    _id: '2', 
    word: 'algorithm', 
    phonetic: 'ˈælɡərɪðm', 
    partOfSpeech: 'Noun', 
    meaning: 'thuật toán',
    example: 'The search engine uses a complex algorithm to rank websites.'
  },
  {
    _id: '3', 
    word: 'database', 
    phonetic: 'ˈdeɪtəbeɪs', 
    partOfSpeech: 'Noun', 
    meaning: 'cơ sở dữ liệu',
    example: 'The application stores all user information in a secure database.'
  }
];

const FlashcardWords = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [words, setWords] = useState([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin category
        const categoryData = await getCategoryById(categoryId);
        console.log("Category data received:", categoryData);
        setCategory(categoryData);
        
        let wordsData = [];
        let wordIds = [];
        
        // Kiểm tra nếu category có danh sách ID từ vựng
        if (categoryData && Array.isArray(categoryData.wordIds) && categoryData.wordIds.length > 0) {
          // Sử dụng getWordsWithIds để lấy thông tin chi tiết của từng từ vựng
          console.log("Using getWordsWithIds with wordIds from category");
          wordIds = categoryData.wordIds;
          wordsData = await getWordsWithIds(wordIds);
          console.log("Words data received from getWordsWithIds:", wordsData);
        } else {
          // Lấy danh sách từ trong category theo cách thông thường
          wordsData = await getWordsInCategory(categoryId);
          console.log("Words data received from getWordsInCategory:", wordsData);
        }
        
        if (Array.isArray(wordsData) && wordsData.length > 0) {
          setWords(wordsData);
          setError(null);
        } else if (categoryData && Array.isArray(categoryData.words) && categoryData.words.length > 0) {
          // Nếu không có data từ API calls, thử sử dụng words từ categoryData
          console.log("Using words from category data:", categoryData.words);
          setWords(categoryData.words);
          setError(null);
        } else {
          console.warn("No words data found in API response, using sample data");
          // Sử dụng dữ liệu mẫu nếu không có dữ liệu từ API
          setWords(SAMPLE_WORDS);
          setError('Không có từ vựng thực từ API, đang hiển thị dữ liệu mẫu.');
        }
      } catch (err) {
        console.error('Error fetching word data:', err);
        // Sử dụng dữ liệu mẫu nếu có lỗi
        setWords(SAMPLE_WORDS);
        setError('Không thể tải danh sách từ. Đang hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, isAuthenticated, navigate]);

  // Hàm phát âm từ vựng
  const playAudio = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported in this browser');
    }
  };

  // Quay lại trang chi tiết category
  const handleBackClick = () => {
    navigate(`/flashcard/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flashcard-words-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách từ vựng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-words-error">
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={handleBackClick} className="back-button">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="flashcard-words-container">
      <div className="flashcard-words-header">
        <button className="back-button" onClick={handleBackClick}>
          &larr; Quay lại
        </button>
        <div className="header-icon-wrapper">
          <img src={flashcardIcon} alt="Flashcard" className="header-icon" />
          <h1>{category?.categoryTopic || 'Unknown Category'}</h1>
        </div>
      </div>
      
      <div className="words-count">
        <p>{words.length} WORDS IN TOTAL</p>
      </div>      <div className="words-list">
        {words.length > 0 ? (
          words.map((wordItem, index) => {
            // Log để debug cấu trúc dữ liệu của từng từ
            console.log(`Word ${index}:`, wordItem);
            
            // Xử lý trường hợp wordItem chỉ là ID hoặc chuỗi đơn giản
            if (typeof wordItem !== 'object' || wordItem === null) {
              const wordId = wordItem?.toString() || `id-${index}`;
              const displayText = typeof wordItem === 'string' ? wordItem : `Word ${index + 1}`;
              
              // Trả về card với thông tin mặc định cho trường hợp không phải object
              return (
                <div key={`word-${index}`} className="word-card">
                  <div className="word-header">
                    <h2 className="word-text">
                      {displayText}
                    </h2>
                    <button 
                      className="pronunciation-button"
                      onClick={() => playAudio(displayText)}
                      aria-label="Phát âm"
                    >
                      <img src={volumeIcon} alt="Pronunciation" />
                    </button>
                  </div>
                  
                  <div className="word-info">
                    <p className="part-of-speech">Part of speech: Not specified</p>
                    <p className="meaning">Meaning: No meaning provided</p>
                  </div>
                </div>
              );
            }
            
            // Xử lý trường hợp wordItem là object
            // Ưu tiên lấy các thuộc tính thông dụng
            const wordText = wordItem.word || wordItem.Word || wordItem.name || wordItem.text || wordItem.englishText || 'Unknown';
            const phonetic = wordItem.phonetic || wordItem.pronunciation || wordItem.IPA || '';
            const partOfSpeech = wordItem.partOfSpeech || wordItem.type || wordItem.wordType || wordItem.pos || 'Not specified';
            const meaning = wordItem.meaning || wordItem.definition || wordItem.translation || wordItem.vietnamese || wordItem.vietnameseText || 'No meaning provided';
            const example = wordItem.example || wordItem.sampleSentence || wordItem.sample || wordItem.exampleSentence || '';
            
            return (
              <div key={wordItem._id || `word-${index}`} className="word-card">
                <div className="word-header">
                  <h2 className="word-text">
                    {wordText} {phonetic && <span className="phonetic">{phonetic}</span>}
                  </h2>
                  <button 
                    className="pronunciation-button"
                    onClick={() => playAudio(wordText)}
                    aria-label="Phát âm"
                  >
                    <img src={volumeIcon} alt="Pronunciation" />
                  </button>
                </div>
                
                <div className="word-info">
                  <p className="part-of-speech">{partOfSpeech}</p>
                  <p className="meaning">{meaning}</p>
                  {example && <p className="example">{example}</p>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-words">
            <p>Không có từ vựng nào trong danh mục này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardWords;
