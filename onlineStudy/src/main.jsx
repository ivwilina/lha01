/**
 * MAIN ENTRY POINT - English Vocabulary Learning System Frontend
 * 
 * File khởi động chính của React application:
 * - Setup React StrictMode để phát hiện lỗi
 * - Render App component vào root element
 * - Import CSS styles toàn cục
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Render ứng dụng React vào DOM
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
