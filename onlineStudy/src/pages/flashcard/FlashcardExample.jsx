import { useState, useEffect } from 'react';
import { getWordsWithIds } from '../../api/flashcardApi';
import volumeIcon from '../../assets/icons/volume-high-svgrepo-com.svg';

const FlashcardExample = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Giả sử chúng ta có một danh sách ID từ vựng cần hiển thị
  const sampleWordIds = ['60d5ec9af682fbd908e9a91c', '60d5ec9af682fbd908e9a91d', '60d5ec9af682fbd908e9a91e'];
  
  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        // Sử dụng getWordsWithIds để lấy thông tin chi tiết của từng từ vựng
        const wordsData = await getWordsWithIds(sampleWordIds);
        setWords(wordsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching words:', err);
        setError('Không thể tải thông tin từ vựng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWords();
  }, []);
  
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
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  if (error) {
    return <div>Lỗi: {error}</div>;
  }
  
  return (
    <div className="flashcard-example-container">
      <h2>Danh sách từ vựng</h2>
      
      <div className="words-list">
        {words.length > 0 ? (
          words.map((wordItem, index) => {
            // Xác định các thuộc tính của từ vựng
            const wordText = wordItem.word || wordItem.Word || wordItem.name || wordItem.text || 'Unknown';
            const phonetic = wordItem.phonetic || wordItem.pronunciation || '';
            const partOfSpeech = wordItem.partOfSpeech || wordItem.type || wordItem.wordType || 'Not specified';
            const meaning = wordItem.meaning || wordItem.definition || wordItem.translation || wordItem.vietnamese || 'No meaning provided';
            const example = wordItem.example || wordItem.sampleSentence || '';
            
            return (
              <div key={wordItem._id || `word-${index}`} className="word-card">
                <div className="word-header">
                  <h3 className="word-text">
                    {wordText} {phonetic && <span className="phonetic">/{phonetic}/</span>}
                  </h3>
                  <button 
                    className="pronunciation-button"
                    onClick={() => playAudio(wordText)}
                    aria-label="Phát âm"
                  >
                    <img src={volumeIcon} alt="Pronunciation" />
                  </button>
                </div>
                
                <div className="word-info">
                  <p className="part-of-speech">Part of speech: {partOfSpeech}</p>
                  <p className="meaning">Meaning: {meaning}</p>
                  {example && <p className="example">Example: {example}</p>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-words">
            <p>Không có từ vựng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardExample;
