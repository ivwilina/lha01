import React, { useState } from 'react';

// Mock để test mà không cần backend
const StreakCounterTest = () => {
  const [streakCount, setStreakCount] = useState(7);
  const [loading, setLoading] = useState(false);

  // Simulate streak update
  const simulateStreakUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setStreakCount(prev => prev + 1);
      setLoading(false);
    }, 1000);
  };

  const handleClick = () => {
    console.log('Navigate to streak page');
    // navigate('/streak');
  };

  const getTooltipText = () => {
    if (streakCount === 0) {
      return "Start your learning streak today!";
    } else if (streakCount === 1) {
      return "1 day streak - Keep going!";
    } else {
      return `${streakCount} days streak - Amazing!`;
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Streak Counter Test Component</h1>
      
      {/* Mock NavBar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        padding: '15px 30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
          Elektro
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Streak Counter */}
          <div 
            className="streak-counter" 
            onClick={handleClick}
            title={getTooltipText()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #FFD54F, #FFA726)',
              padding: '8px 14px',
              borderRadius: '25px',
              color: '#333',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 3px 10px rgba(255, 213, 79, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              userSelect: 'none',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <span style={{
              fontSize: '16px',
              fontWeight: '800',
              color: '#2d2d2d',
              minWidth: '20px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)'
            }}>
              {loading ? '...' : streakCount}
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Thunder Icon SVG */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="#e65100"
                style={{
                  filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))',
                  transition: 'transform 0.3s ease'
                }}
              >
                <path d="M13 0L8.5 8H1l6.5 16L11.5 16H19L13 0z"/>
              </svg>
            </span>
          </div>
          
          {/* Menu Button */}
          <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Test Controls */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Test Controls</h2>
        <button 
          onClick={simulateStreakUpdate}
          style={{
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Simulate Streak Update (+1)
        </button>
        
        <button 
          onClick={() => setStreakCount(0)}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Reset Streak to 0
        </button>
        
        <button 
          onClick={() => setStreakCount(Math.floor(Math.random() * 100))}
          style={{
            background: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Random Streak Value
        </button>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h3>Current Status:</h3>
        <p><strong>Streak Count:</strong> {streakCount} days</p>
        <p><strong>Tooltip:</strong> {getTooltipText()}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default StreakCounterTest;
