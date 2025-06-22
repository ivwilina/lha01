import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import HomeNonLogin from "./HomeNonLogin";
import "../../style/Home.css";
import thunderIcon from "../../assets/icons/thunder-2-svgrepo-com.svg";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Nếu chưa đăng nhập, hiển thị HomeNonLogin
  if (!isAuthenticated) {
    return <HomeNonLogin />;
  }

  // Get current day for highlighting in the UI
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDayIndex = new Date().getDay();

  return (
    <div className="home-container">
      <div className="home-sections">
        {/* Left Section - Daily Streak */}
        <div className="daily-streak-section">
          {" "}
          <div className="streak-header">
            <div className="streak-icon-large">
              <img src={thunderIcon} alt="Streak" className="thunder-icon" />
            </div>
            <div className="streak-count-wrapper">
              <div className="streak-count">0</div>
            </div>
          </div>
          <p className="streak-text">
            Play Quiz or Learn new words to complete your daily streak
          </p>
          <div className="days-of-week">
            {days.map((day, index) => (
              <div key={day} className="day-item">
                {" "}                <div
                  className={`day-circle ${
                    index === currentDayIndex ? "active" : ""
                  }`}
                >
                  <span className="day-icon">
                    <img
                      src={thunderIcon}
                      alt="Streak"
                      className="day-thunder-icon"
                    />
                  </span>
                </div>
                <div className="day-name">{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Cards */}
        <div className="right-section">          {/* Flashcard Card */}
          <div className="card">
            <div className="card-tag">RECOMMENDED</div>
            <h2>Information Technology</h2>

            <div className="card-metrics">
              <div className="metric-item">
                <div className="metric-label">Total words</div>
                <div className="metric-value">125</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Words learned</div>
                <div className="metric-value">27</div>
              </div>
            </div>

            <div className="card-actions">
              <Link to="/flashcard">
                <button className="start-button">Start</button>
              </Link>
              <Link to="/flashcard/5/learn">
                <button className="continue-button">Continue Learning</button>
              </Link>
            </div>
          </div>

          {/* Quiz Card */}
          <div className="card">
            <div className="quiz-icon">❓</div>
            <h2>QUIZ</h2>

            <div className="card-info">Keep practice!!!!</div>
            <div className="card-info">10 questions - 5 min</div>

            <Link to="/quiz">
              <button className="start-button">Start</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
