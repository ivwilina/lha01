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


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
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
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
