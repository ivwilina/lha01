import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getAllCategories, getLearningRecords } from "../../api/flashcardApi";
import { getStreakHistory } from "../../api/streakApi";
import HomeNonLogin from "./HomeNonLogin";
import StreakMini from "../../components/StreakMini";
import "../../style/Home.css";
import thunderIcon from "../../assets/icons/thunder-2-svgrepo-com.svg";

const Home = () => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // State cho recommended flashcard
  const [recommendedCard, setRecommendedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho streak history
  const [streakHistory, setStreakHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Fetch recommended flashcard data
  useEffect(() => {
    const fetchRecommendedCard = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Lấy tất cả categories
        const categories = await getAllCategories();
        
        if (!categories || categories.length === 0) {
          setError("Không có categories nào");
          return;
        }
        
        // Chọn một category đầu tiên làm recommended (hoặc random)
        const recommended = categories[0];
        
        // Nếu user đăng nhập, lấy learning progress
        let wordsLearned = 0;
        if (currentUser && currentUser._id) {
          try {
            const learningRecords = await getLearningRecords(currentUser._id);
            const learningRecord = learningRecords.find(record => 
              record.category === recommended._id || 
              (record.category && record.category._id === recommended._id)
            );
            
            if (learningRecord && learningRecord.remembered) {
              wordsLearned = learningRecord.remembered.length;
            }
          } catch (learningError) {
            console.log("No learning record found or error:", learningError);
            // Không có learning record, giữ wordsLearned = 0
          }
        }
        
        setRecommendedCard({
          ...recommended,
          wordsLearned
        });
        
      } catch (err) {
        console.error("Error fetching recommended card:", err);
        setError("Không thể tải thông tin flashcard");
        
        // Fallback to hardcoded data
        setRecommendedCard({
          _id: "fallback",
          categoryTopic: "Information Technology",
          totalWords: 125,
          wordsLearned: 27
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedCard();
  }, [isAuthenticated, currentUser]);

  // Fetch streak history
  useEffect(() => {
    const fetchStreakHistory = async () => {
      if (!isAuthenticated || !currentUser) {
        setHistoryLoading(false);
        return;
      }
      
      try {
        setHistoryLoading(true);
        const data = await getStreakHistory(currentUser._id);
        setStreakHistory(data.history || []);
      } catch (error) {
        console.error("Error fetching streak history:", error);
        setStreakHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchStreakHistory();
  }, [isAuthenticated, currentUser]);

  // Nếu chưa đăng nhập, hiển thị HomeNonLogin
  if (!isAuthenticated) {
    return <HomeNonLogin />;
  }

  // Generate last 7 days to match backend logic
  const getLast7Days = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Get local date string without timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        isToday: i === 0 // Last iteration is today
      });
    }
    
    return days;
  };

  const last7Days = getLast7Days();

  // Helper function to check if a day is completed based on streak history
  const isDayCompleted = (dateStr) => {
    if (historyLoading || streakHistory.length === 0) return false;
    
    const historyDay = streakHistory.find(day => day.date === dateStr);
    return historyDay ? historyDay.completed : false;
  };

  return (
    <div className="home-container">
      <div className="home-sections">
        {/* Left Section - Daily Streak */}
        <div className="daily-streak-section">
          <StreakMini />
          <div className="home-days-of-week">
            {last7Days.map((dayData) => {
              const isToday = dayData.isToday;
              const isCompleted = isDayCompleted(dayData.date);
              
              return (
                <div key={dayData.date} className="home-day-item">
                  <div
                    className={`home-day-circle ${
                      isToday ? "active" : ""
                    } ${isCompleted ? "completed" : ""}`}
                  >
                    <span className="home-day-icon">
                      <img
                        src={thunderIcon}
                        alt="Streak"
                        className="home-day-thunder-icon"
                      />
                    </span>
                  </div>
                  <div className="home-day-name">{dayData.dayName}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section - Cards */}
        <div className="right-section">
          {/* Flashcard Card */}
          <div className="card">
            <div className="card-tag">RECOMMENDED</div>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div>
                <h2>Information Technology</h2>
                <p className="error-text">{error}</p>
              </div>
            ) : recommendedCard ? (
              <>
                <h2>{recommendedCard.categoryTopic}</h2>
                <div className="card-metrics">
                  <div className="metric-item">
                    <div className="metric-label">Total words</div>
                    <div className="metric-value">{recommendedCard.totalWords || 0}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Words learned</div>
                    <div className="metric-value">{recommendedCard.wordsLearned || 0}</div>
                  </div>
                </div>

                <div className="card-actions">
                  <Link to="/flashcard">
                    <button className="start-button">Start</button>
                  </Link>
                  <Link to={`/flashcard/${recommendedCard._id}/learn`}>
                    <button className="continue-button">Continue Learning</button>
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <h2>No flashcard available</h2>
                <p>Please check your connection</p>
              </div>
            )}
          </div>

          {/* Quiz Card */}
          <div className="card">
            <div className="quiz-icon">❓</div>
            <h2>QUIZ</h2>

            <div className="card-info">Multiple quiz types available!</div>
            <div className="card-info">• Multiple Choice</div>
            <div className="card-info">• Fill in the Blank</div>
            <div className="card-info">• Word Matching</div>
            <div className="card-info">• Complete the Word</div>
            <div className="card-info">10/30/60 questions - 2 min per question</div>

            <Link to="/quiz">
              <button className="start-button">Start Quiz</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
