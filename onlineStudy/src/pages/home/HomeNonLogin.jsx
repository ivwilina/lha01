import { useNavigate } from "react-router-dom";
import "../../style/Home.css";

const HomeNonLogin = () => {
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };
  
  return (
    <>
      <div className="site-wrapper">
        {/*welcome section*/}
        <div className="welcome-section">
          <div className="site-container">
            <div className="non-login-welcome">
              <div className="home-tifo">
                <li>+ Ôn luyện từ vựng Tiếng Anh</li>
                <li>+ Làm đề thi và cải thiện lỗi sai</li>
                <li>+ Theo dõi tiến độ học tập của bạn</li>
              </div>              <div className="quick-login">
                <li>
                  Bắt đầu hành trình học Tiếng Anh của bạn
                </li>
                <form onSubmit={handleLogin}>
                  <li>
                    <input placeholder="Tên đăng nhập/ Email" />
                  </li>
                  <li>
                    <input type="password" placeholder="Mật khẩu" />
                  </li>
                  <li>
                    <a href="#" className="forgot-password">Quên mật khẩu?</a>
                  </li>
                  <li>
                    <button type="submit">Đăng nhập</button>
                  </li>
                </form>
                <li>
                  Nếu bạn chưa có tài khoản, vui lòng{" "}
                  <span 
                    className="register-link"
                    onClick={handleRegister}
                  >
                    Đăng ký
                  </span>
                </li>
              </div>
            </div>
          </div>
        </div>        {/* demo exams section */}

        <div className="exam-section site-container">
          <h2>Đề thi thử</h2>
          <div className="exam-list">
              <div className="exam-item">
                <div className="exam-title">Bài test từ vựng cơ bản</div>
                <div className="exam-desc">Kiểm tra vốn từ vựng cơ bản với 20 câu hỏi</div>
                <button className="exam-button" onClick={() => navigate('/login')}>Thử ngay</button>
              </div>
              <div className="exam-item">
                <div className="exam-title">Bài test từ vựng nâng cao</div>
                <div className="exam-desc">Kiểm tra vốn từ vựng nâng cao với 20 câu hỏi</div>
                <button className="exam-button" onClick={() => navigate('/login')}>Thử ngay</button>
              </div>
              <div className="exam-item">
                <div className="exam-title">Bài test ngữ pháp</div>
                <div className="exam-desc">Kiểm tra kiến thức ngữ pháp với 15 câu hỏi</div>
                <button className="exam-button" onClick={() => navigate('/login')}>Thử ngay</button>
              </div>              <div className="exam-item">
                <div className="exam-title">Bài test giao tiếp</div>
                <div className="exam-desc">Kiểm tra kỹ năng giao tiếp với 10 câu hỏi</div>
                <button className="exam-button" onClick={() => navigate('/login')}>Thử ngay</button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeNonLogin;
