import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/NavBar.css";
import homeIcon from "../assets/icons/home-svgrepo-com.svg";
import flashcardIcon from "../assets/icons/library-svgrepo-com.svg";
import quizIcon from "../assets/icons/student-cap-svgrepo-com.svg";
import hamburgerIcon from "../assets/icons/hamburger-menu-svgrepo-com.svg";
import thunderIcon from "../assets/icons/thunder-2-svgrepo-com.svg";
import { useAuth } from "../context/useAuth";

const NavBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">Elektro</Link>
        </div>
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            <img src={homeIcon} alt="Home" className="navbar-icon" />
            Home
          </Link>
          <Link
            to="/flashcard"
            className={`navbar-link ${
              location.pathname === "/flashcard" ? "active" : ""
            }`}
          >
            <img src={flashcardIcon} alt="Flashcard" className="navbar-icon" />
            Flashcard
          </Link>
          <Link
            to="/quiz"
            className={`navbar-link ${
              location.pathname === "/quiz" ? "active" : ""
            }`}
          >
            <img src={quizIcon} alt="Quiz" className="navbar-icon" />
            Quiz
          </Link>
        </div>

        <div className="navbar-right">
          {" "}
          <div className="streak-counter">
            <span className="streak-number">0</span>
            <span className="streak-icon">
              <img src={thunderIcon} alt="Streak" />
            </span>
          </div>
          <div className="dropdown-container" ref={dropdownRef}>
            <button className="hamburger-button" onClick={toggleDropdown}>
              <img src={hamburgerIcon} alt="Menu" />
            </button>            {isDropdownOpen && (
              <div className="dropdown-menu">
                {isAuthenticated ? (
                  <>
                    <Link to="/account" className="dropdown-item">
                      Tài khoản
                    </Link>
                    <button 
                      className="dropdown-item logout-button"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item">
                      Đăng nhập
                    </Link>
                    <Link to="/register" className="dropdown-item">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
