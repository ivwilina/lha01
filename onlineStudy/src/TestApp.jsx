import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🎉 React App is Working!</h1>
      <p>If you can see this, React is running correctly.</p>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        marginTop: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Next Steps:</h2>
        <ol>
          <li>Check browser console for errors (F12)</li>
          <li>Make sure backend is running on port 3000</li>
          <li>Test navigation to different routes</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Quick Links:</h3>
        <a href="/login" style={{ margin: '0 10px', color: '#007bff' }}>Login</a>
        <a href="/register" style={{ margin: '0 10px', color: '#007bff' }}>Register</a>
        <a href="/flashcard" style={{ margin: '0 10px', color: '#007bff' }}>Flashcard</a>
        <a href="/quiz" style={{ margin: '0 10px', color: '#007bff' }}>Quiz</a>
      </div>
    </div>
  );
};

export default TestApp;
