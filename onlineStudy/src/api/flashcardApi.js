// API base URL từ authApi
const API_BASE_URL = 'http://localhost:3000';

/**
 * Lấy tất cả các category từ API
 * @returns {Promise} Mảng các category
 */
export const getAllCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/category/`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tải danh sách category');
  }
  
  return data;
};

/**
 * Lấy category theo tên
 * @param {string} topic - Tên của category
 * @returns {Promise} Thông tin của category
 */
export const getCategoryByTopic = async (topic) => {
  const response = await fetch(`${API_BASE_URL}/category/list/${topic}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không tìm thấy category');
  }
  
  return data;
};

/**
 * Lấy tất cả các từ trong một category
 * @param {string} categoryId - ID của category
 * @returns {Promise} Mảng các từ trong category
 */
export const getWordsInCategory = async (categoryId) => {
  try {
    console.log(`Fetching words for category ${categoryId}`);
    const response = await fetch(`${API_BASE_URL}/category/words/${categoryId}`);
    const data = await response.json();
    
    console.log('API Response:', response.status, response.statusText);
    console.log('Raw data from API:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải danh sách từ');
    }
    
    // Kiểm tra xem data có phải là một mảng không
    if (!Array.isArray(data)) {
      console.warn('API did not return an array:', data);
      
      // Nếu data có thuộc tính words và words là một mảng
      if (data.words && Array.isArray(data.words)) {
        console.log(`Using words array from response, ${data.words.length} items`);
        return data.words;
      }
      
      // Trường hợp không có từ nào
      return [];
    }
    
    // Nếu API trả về mảng rỗng, thử lấy từ vựng từ category thay thế
    if (data.length === 0) {
      console.log("API returned empty array, trying to get words from category details");
      try {
        const categoryResponse = await fetch(`${API_BASE_URL}/category/list/${categoryId}`);
        const categoryData = await categoryResponse.json();
        
        if (categoryResponse.ok && categoryData && Array.isArray(categoryData.words)) {
          console.log(`Found ${categoryData.words.length} words in category details`);
          return categoryData.words;
        }
      } catch (err) {
        console.error("Error fetching category details:", err);
      }
    }
    
    console.log(`Successfully loaded ${data.length} words for category ${categoryId}`);
    return data;
  } catch (error) {
    console.error(`Error loading words for category ${categoryId}:`, error);
    
    // Nếu có lỗi, thử lấy chi tiết category để xem có thuộc tính words không
    try {
      console.log("Attempting to fetch category details to get words");
      const categoryResponse = await fetch(`${API_BASE_URL}/category/list/${categoryId}`);
      const categoryData = await categoryResponse.json();
      
      if (categoryResponse.ok && categoryData && Array.isArray(categoryData.words)) {
        console.log(`Found ${categoryData.words.length} words in category details`);
        return categoryData.words;
      }
    } catch (err) {
      console.error("Error fetching category details:", err);
    }
    
    // Cuối cùng, trả về mảng rỗng nếu không lấy được dữ liệu
    return [];
  }
};

/**
 * Tạo learning record mới cho user và category
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @returns {Promise} Learning record đã tạo
 */
export const createLearningRecord = async (userId, categoryId) => {
  const response = await fetch(`${API_BASE_URL}/learning/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: userId,
      category: categoryId,
      remembered: []
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tạo learning record');
  }
  
  return data;
};

/**
 * Lấy learning record của user
 * @param {string} userId - ID của user
 * @returns {Promise} Mảng các learning record
 */
export const getLearningRecords = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/learning/get/${userId}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tải learning records');
  }
  
  return data;
};

/**
 * Lấy thông tin chi tiết của một category theo ID
 * @param {string} categoryId - ID của category
 * @returns {Promise} Thông tin chi tiết của category
 */
export const getCategoryById = async (categoryId) => {
  try {
    // Sử dụng endpoint /category/list/:id cho tất cả các trường hợp
    const response = await fetch(`${API_BASE_URL}/category/list/${categoryId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải thông tin category');
    }
    
    return data;
  } catch (error) {
    // Nếu không tìm được category, trả về dữ liệu mẫu
    console.error('Error fetching category:', error);
    return {
      _id: categoryId,
      categoryTopic: 'Information Technology',
      totalWords: 125,
      words: []
    };
  }
};

/**
 * Lấy learning record cụ thể cho user và category
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @returns {Promise} Learning record
 */
export const getLearningRecordForCategory = async (userId, categoryId) => {
  try {
    const records = await getLearningRecords(userId);
    
    if (!records || records.length === 0) {
      console.log('No learning records found for user');
      return null;
    }
    
    // Xử lý nhiều trường hợp có thể xảy ra với cấu trúc dữ liệu
    const record = records.find(record => {
      if (!record.category) return false;
      
      if (typeof record.category === 'string') {
        return record.category === categoryId;
      }
      
      if (typeof record.category === 'object') {
        return record.category._id === categoryId;
      }
      
      return false;
    });
    
    console.log('Found learning record:', record);
    return record;
  } catch (error) {
    console.error('Error loading learning records:', error);
    throw new Error('Không thể tải learning record cho category này');
  }
};

/**
 * Lấy thông tin chi tiết của các từ vựng theo danh sách ID
 * @param {Array} wordIds - Mảng chứa ID của các từ vựng cần lấy thông tin
 * @returns {Promise} Mảng các từ vựng với thông tin chi tiết
 */
export const getWordsWithIds = async (wordIds) => {
  try {
    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      console.warn('No word IDs provided for getWordsWithIds');
      return [];
    }
    
    console.log(`Fetching details for ${wordIds.length} words`);
    
    const response = await fetch(`${API_BASE_URL}/category/words-with-ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: wordIds }),
    });
    
    const data = await response.json();
    console.log('Words with IDs API Response:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải thông tin từ vựng');
    }
    
    if (!Array.isArray(data)) {
      console.warn('API did not return an array for words-with-ids:', data);
      return [];
    }
    
    console.log(`Successfully loaded ${data.length} words with provided IDs`);
    return data;
  } catch (error) {
    console.error('Error loading words with IDs:', error);
    return [];
  }
};

/**
 * Đánh dấu một từ đã học
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @param {string} wordId - ID của từ vựng
 * @returns {Promise} Learning record đã cập nhật
 */
export const markWordAsLearned = async (userId, categoryId, wordId) => {
  const response = await fetch(`${API_BASE_URL}/learning/mark-learned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      categoryId,
      wordId
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể đánh dấu từ đã học');
  }
  
  return data;
};

/**
 * Bỏ đánh dấu từ đã học
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @param {string} wordId - ID của từ vựng
 * @returns {Promise} Learning record đã cập nhật
 */
export const unmarkWordAsLearned = async (userId, categoryId, wordId) => {
  const response = await fetch(`${API_BASE_URL}/learning/unmark-learned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      categoryId,
      wordId
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể bỏ đánh dấu từ đã học');
  }
  
  return data;
};

/**
 * Lấy tiến độ học tập cho category cụ thể
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @returns {Promise} Thông tin tiến độ học tập
 */
export const getLearningProgress = async (userId, categoryId) => {
  const response = await fetch(`${API_BASE_URL}/learning/progress/${userId}/${categoryId}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể lấy tiến độ học tập');
  }
  
  return data;
};

/**
 * Đánh dấu nhiều từ đã học (dùng cho quiz)
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @param {Array} wordIds - Mảng ID của các từ vựng
 * @returns {Promise} Learning record đã cập nhật
 */
export const markMultipleWordsAsLearned = async (userId, categoryId, wordIds) => {
  const response = await fetch(`${API_BASE_URL}/learning/mark-multiple-learned`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      categoryId,
      wordIds
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể đánh dấu các từ đã học');
  }
  
  return data;
};

/**
 * Tạo quiz từ danh sách từ vựng
 * @param {Array} wordIds - Mảng ID của các từ vựng
 * @param {number} numOfQuestion - Số câu hỏi
 * @returns {Promise} Quiz đã tạo
 */
export const createQuiz = async (wordIds, numOfQuestion) => {
  const response = await fetch(`${API_BASE_URL}/quiz/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      words: wordIds,
      numOfQuestion
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tạo quiz');
  }
  
  return data;
};

/**
 * Tạo quiz theo category (từ các từ đã học)
 * @param {string} categoryId - ID của category
 * @param {string} userId - ID của user
 * @param {number} numOfQuestion - Số câu hỏi
 * @returns {Promise} Quiz đã tạo
 */
export const createCategoryQuiz = async (categoryId, userId, numOfQuestion) => {
  const response = await fetch(`${API_BASE_URL}/quiz/create/category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      categoryId,
      userId,
      numOfQuestion
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tạo quiz theo category');
  }
  
  return data;
};

/**
 * Tạo quiz tổng hợp (từ tất cả từ đã học)
 * @param {string} userId - ID của user
 * @param {number} numOfQuestion - Số câu hỏi
 * @returns {Promise} Quiz đã tạo
 */
export const createComprehensiveQuiz = async (userId, numOfQuestion) => {
  const response = await fetch(`${API_BASE_URL}/quiz/create/comprehensive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      numOfQuestion
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tạo quiz tổng hợp');
  }
  
  return data;
};

/**
 * Tạo quiz ngẫu nhiên (từ tất cả từ trong database)
 * @param {number} numOfQuestion - Số câu hỏi
 * @returns {Promise} Quiz đã tạo
 */
export const createRandomQuiz = async (numOfQuestion) => {
  const response = await fetch(`${API_BASE_URL}/quiz/create/random`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      numOfQuestion
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể tạo quiz ngẫu nhiên');
  }
  
  return data;
};

/**
 * Lấy quiz theo ID
 * @param {string} quizId - ID của quiz
 * @returns {Promise} Thông tin quiz
 */
export const getQuizById = async (quizId) => {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể lấy thông tin quiz');
  }
  
  return data;
};

/**
 * Nộp bài quiz
 * @param {string} quizId - ID của quiz
 * @param {Array} answers - Mảng câu trả lời
 * @param {string} userId - ID của user
 * @param {string} categoryId - ID của category
 * @returns {Promise} Kết quả quiz
 */
export const submitQuiz = async (quizId, answers, userId, categoryId) => {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answers,
      userId,
      categoryId
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể nộp bài quiz');
  }
  
  return data;
};

/**
 * Lấy lịch sử quiz của user
 * @param {string} userId - ID của user
 * @returns {Promise} Lịch sử quiz
 */
export const getUserQuizHistory = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/quiz/history/${userId}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Không thể lấy lịch sử quiz');
  }
  
  return data;
};
