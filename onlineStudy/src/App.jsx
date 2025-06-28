/**
 * APP COMPONENT - Main Application Router
 * 
 * Component chính của ứng dụng React:
 * - Cấu hình React Router cho navigation
 * - Wrap toàn bộ app với AuthProvider context
 * - Định nghĩa routes cho tất cả pages
 * - Điều khiển hiển thị NavBar (trừ admin panel)
 * 
 * Routes bao gồm:
 * - Auth: /login, /register
 * - Home: /, /home-guest
 * - Flashcards: /flashcards/*
 * - Quiz: /quiz/*
 * - Streak: /streak
 * - Profile: /profile
 * - Admin: /admin-system-panel-access
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

import './App.css'
import NavBar from './components/NavBar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { AuthProvider } from './context/AuthProvider'
import HomeNonLogin from './pages/home/HomeNonLogin'
import FlashcardHome from './pages/flashcard/FlashcardHome'
import FlashcardDetail from './pages/flashcard/FlashcardDetail'
import FlashcardWords from './pages/flashcard/FlashcardWords'
import FlashcardLearning from './pages/flashcard/FlashcardLearning'
import QuizHome from './pages/quiz/QuizHome'
import QuizCategory from './pages/quiz/QuizCategory'
import QuizComprehensive from './pages/quiz/QuizComprehensive'
import QuizRandom from './pages/quiz/QuizRandom'
import StreakPage from './pages/streak/StreakPage'
import Profile from './pages/profile/Profile'
import AdminPanel from './pages/admin/AdminPanel'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Admin route - không có NavBar */}
            <Route path="/admin-system-panel-access" element={<AdminPanel />} />
            
            {/* Routes khác với NavBar */}
            <Route path="/*" element={
              <>
                <NavBar />
                <div className="container">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/welcome" element={<HomeNonLogin />} />
                    <Route path="/flashcard" element={<FlashcardHome />} />
                    <Route path="/flashcard/:categoryId" element={<FlashcardDetail />} />
                    <Route path="/flashcard/:categoryId/words" element={<FlashcardWords />} />
                    <Route path="/flashcard/:categoryId/learn" element={<FlashcardLearning />} />
                    <Route path="/quiz" element={<QuizHome />} />
                    <Route path="/quiz/category/:categoryId" element={<QuizCategory />} />
                    <Route path="/quiz/comprehensive" element={<QuizComprehensive />} />
                    <Route path="/quiz/random" element={<QuizRandom />} />
                    <Route path="/streak" element={<StreakPage />} />
                    <Route path="/account" element={<Profile />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
              </>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
