// Debug component to test streak API
import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { 
  initializeStreak, 
  updateWordsLearned, 
  updateQuizCompleted, 
  getCurrentStreak 
} from '../api/streakApi';

const StreakDebug = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { timestamp, message, data }]);
  };

  const testInitialize = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const result = await initializeStreak(currentUser._id);
      addResult('Initialize Streak Success', result);
    } catch (error) {
      addResult('Initialize Streak Error', error.message);
    }
    setLoading(false);
  };

  const testUpdateWords = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const result = await updateWordsLearned(currentUser._id, 3);
      addResult('Update Words Success', result);
    } catch (error) {
      addResult('Update Words Error', error.message);
    }
    setLoading(false);
  };

  const testUpdateQuiz = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const result = await updateQuizCompleted(currentUser._id);
      addResult('Update Quiz Success', result);
    } catch (error) {
      addResult('Update Quiz Error', error.message);
    }
    setLoading(false);
  };

  const testGetCurrent = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const result = await getCurrentStreak(currentUser._id);
      addResult('Get Current Streak Success', result);
    } catch (error) {
      addResult('Get Current Streak Error', error.message);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return <div>Please login to test streak functionality</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Streak API Debug Tool</h2>
      <p>User ID: {currentUser._id}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testInitialize} disabled={loading}>
          Test Initialize Streak
        </button>
        <button onClick={testUpdateWords} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Update Words (+3)
        </button>
        <button onClick={testUpdateQuiz} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Update Quiz (+1)
        </button>
        <button onClick={testGetCurrent} disabled={loading} style={{ marginLeft: '10px' }}>
          Test Get Current
        </button>
        <button 
          onClick={() => setResults([])} 
          style={{ marginLeft: '10px', backgroundColor: '#ff6b6b', color: 'white' }}
        >
          Clear Results
        </button>
      </div>

      {loading && <div>Loading...</div>}

      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', maxHeight: '400px', overflow: 'auto' }}>
        <h3>Test Results:</h3>
        {results.length === 0 ? (
          <p>No tests run yet</p>
        ) : (
          results.map((result, index) => (
            <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#333' }}>
                [{result.timestamp}] {result.message}
              </div>
              {result.data && (
                <pre style={{ fontSize: '12px', backgroundColor: '#fff', padding: '5px', margin: '5px 0' }}>
                  {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StreakDebug;
