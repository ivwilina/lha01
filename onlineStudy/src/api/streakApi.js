// API functions for streak management
const API_BASE_URL = 'http://localhost:3000';

// Initialize or get streak for a user
export const initializeStreak = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error initializing streak:', error);
    throw error;
  }
};

// Get current streak for a user
export const getCurrentStreak = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/current/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return simplified streak data
    return {
      streakCount: data.streakCount || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive || false
    };
  } catch (error) {
    console.error('Error getting current streak:', error);
    throw error;
  }
};

// Update streak when user learns words
export const updateWordsLearned = async (userId, wordsCount = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/update-words`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, wordsCount }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating words learned:', error);
    throw error;
  }
};

// Update streak when user completes quiz
export const updateQuizCompleted = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/update-quiz`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating quiz completion:', error);
    throw error;
  }
};

// Get streak statistics and leaderboard
export const getStreakStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/stats/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting streak stats:', error);
    throw error;
  }
};

// Get streak history for the past 7 days
export const getStreakHistory = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/history/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting streak history:', error);
    throw error;
  }
};

// Reset streak for a user
export const resetStreak = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/streak/reset`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting streak:', error);
    throw error;
  }
};
