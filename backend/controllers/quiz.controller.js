/**
 * QUIZ CONTROLLER
 * 
 * Xử lý các chức năng liên quan đến quiz/kiểm tra:
 * - Tạo quiz theo category (từ words đã học)
 * - Tạo quiz tổng hợp từ tất cả words đã học  
 * - Tạo quiz ngẫu nhiên từ database
 * - Lấy quiz theo ID
 * - Nộp bài và tính điểm tự động
 * - Lịch sử quiz của user
 * - Generate câu hỏi đa dạng (multiple choice, fill blank, etc.)
 * - Cập nhật streak khi hoàn thành quiz
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const Quiz = require('../models/quiz.model');
const Word = require('../models/word.model');
const Learning = require('../models/learning.model');
const Streak = require('../models/streak.model');

/**
 * Tạo quiz từ words đã học trong category
 * 
 * @desc Tạo quiz chỉ từ những từ mà user đã đánh dấu là "đã nhớ" trong category cụ thể
 * @route POST /quiz/create-category
 * @access Public
 * @param {Object} req.body - { categoryId, userId, numOfQuestion }
 * @returns {Object} Quiz object với questions được generate
 */
const create_category_quiz = async (req, res) => {
  try {
    const { categoryId, userId, numOfQuestion } = req.body;

    // Validate required fields
    if (!categoryId || !userId || !numOfQuestion) {
      return res.status(400).json({ 
        message: "Category ID, User ID, and number of questions are required" 
      });
    }

    if (numOfQuestion <= 0 || numOfQuestion > 60) {
      return res.status(400).json({ 
        message: "Number of questions must be between 1 and 60" 
      });
    }

    // Lấy learning record để tìm words đã học
    const learningRecord = await Learning.findOne({ 
      user: userId, 
      category: categoryId 
    }).populate('remembered');

    if (!learningRecord || !learningRecord.remembered || learningRecord.remembered.length === 0) {
      return res.status(400).json({ 
        message: "No learned words found in this category. Please learn some words first." 
      });
    }

    const learnedWords = learningRecord.remembered;
    
    if (learnedWords.length < numOfQuestion) {
      return res.status(400).json({ 
        message: `Not enough learned words. You have learned ${learnedWords.length} words but requested ${numOfQuestion} questions.` 
      });
    }

    // Create quiz questions
    const questions = generateQuizQuestions(learnedWords, numOfQuestion);

    // Create the quiz
    const newQuiz = await Quiz.create({
      words: learnedWords.map(word => word._id),
      questions: questions,
      numOfQuestion: numOfQuestion,
      createdDate: new Date(),
      logs: {},
      summary: `Category quiz with ${numOfQuestion} questions from category ${categoryId}`
    });

    res.status(200).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Create a comprehensive quiz from all learned words
const create_comprehensive_quiz = async (req, res) => {
  try {
    const { userId, numOfQuestion } = req.body;

    // Validate required fields
    if (!userId || !numOfQuestion) {
      return res.status(400).json({ 
        message: "User ID and number of questions are required" 
      });
    }

    if (numOfQuestion <= 0 || numOfQuestion > 60) {
      return res.status(400).json({ 
        message: "Number of questions must be between 1 and 60" 
      });
    }

    // Get all learned words from all categories for this user
    const learningRecords = await Learning.find({ 
      user: userId 
    }).populate('remembered');

    if (!learningRecords || learningRecords.length === 0) {
      return res.status(400).json({ 
        message: "No learned words found. Please learn some words first." 
      });
    }

    // Collect all unique learned words
    const allLearnedWords = [];
    const seenWordIds = new Set();

    learningRecords.forEach(record => {
      if (record.remembered && record.remembered.length > 0) {
        record.remembered.forEach(word => {
          if (!seenWordIds.has(word._id.toString())) {
            seenWordIds.add(word._id.toString());
            allLearnedWords.push(word);
          }
        });
      }
    });

    if (allLearnedWords.length === 0) {
      return res.status(400).json({ 
        message: "No learned words found. Please learn some words first." 
      });
    }

    if (allLearnedWords.length < numOfQuestion) {
      return res.status(400).json({ 
        message: `Not enough learned words. You have learned ${allLearnedWords.length} words but requested ${numOfQuestion} questions.` 
      });
    }

    // Create quiz questions
    const questions = generateQuizQuestions(allLearnedWords, numOfQuestion);

    // Create the quiz
    const newQuiz = await Quiz.create({
      words: allLearnedWords.map(word => word._id),
      questions: questions,
      numOfQuestion: numOfQuestion,
      createdDate: new Date(),
      logs: {},
      summary: `Comprehensive quiz with ${numOfQuestion} questions from ${allLearnedWords.length} learned words`
    });

    res.status(200).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Create a random quiz from all available words
const create_random_quiz = async (req, res) => {
  try {
    const { numOfQuestion } = req.body;

    // Validate required fields
    if (!numOfQuestion) {
      return res.status(400).json({ 
        message: "Number of questions is required" 
      });
    }

    if (numOfQuestion <= 0 || numOfQuestion > 60) {
      return res.status(400).json({ 
        message: "Number of questions must be between 1 and 60" 
      });
    }

    // Get all words from database
    const allWords = await Word.find({});

    if (!allWords || allWords.length === 0) {
      return res.status(400).json({ 
        message: "No words found in database" 
      });
    }

    if (allWords.length < numOfQuestion) {
      return res.status(400).json({ 
        message: `Not enough words in database. Available: ${allWords.length}, requested: ${numOfQuestion}` 
      });
    }

    // Create quiz questions
    const questions = generateQuizQuestions(allWords, numOfQuestion);

    // Create the quiz
    const newQuiz = await Quiz.create({
      words: allWords.map(word => word._id),
      questions: questions,
      numOfQuestion: numOfQuestion,
      createdDate: new Date(),
      logs: {},
      summary: `Random quiz with ${numOfQuestion} questions from ${allWords.length} available words`
    });

    res.status(200).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Create a new quiz (legacy - keep for backward compatibility)
const create_quiz = async (req, res) => {
  try {
    const { words, numOfQuestion } = req.body;

    // Validate required fields
    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ message: "Words array is required and cannot be empty" });
    }

    if (!numOfQuestion || numOfQuestion <= 0) {
      return res.status(400).json({ message: "Number of questions must be greater than 0" });
    }

    // Validate that we have enough words for the quiz
    if (words.length < numOfQuestion) {
      return res.status(400).json({ 
        message: `Not enough words. Requested ${numOfQuestion} questions but only ${words.length} words available` 
      });
    }

    // Get detailed word information
    const wordDetails = await Word.find({ _id: { $in: words } });
    
    if (wordDetails.length !== words.length) {
      return res.status(400).json({ message: "Some words were not found in the database" });
    }

    // Create quiz questions
    const questions = generateQuizQuestions(wordDetails, numOfQuestion);

    // Create the quiz
    const newQuiz = await Quiz.create({
      words: words,
      questions: questions,
      numOfQuestion: numOfQuestion,
      createdDate: new Date(),
      logs: {},
      summary: `Quiz with ${numOfQuestion} questions created from ${words.length} words`
    });

    res.status(200).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get quiz by ID
const get_quiz_by_id = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findById(id).populate('words');
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Submit quiz answers and mark correct words as learned
const submit_quiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, userId, categoryId } = req.body;

    // Validate required fields
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    // Get quiz
    const quiz = await Quiz.findById(id).populate('words');
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Calculate score and get correct words
    const results = calculateQuizResults(quiz.questions, answers);
    const correctWordIds = results.correctAnswers.map(answer => answer.wordId);
    
    // If userId and categoryId provided, mark correct words as learned
    if (userId && categoryId && correctWordIds.length > 0) {
      try {
        // Find or create learning record
        let learningRecord = await Learning.findOne({ user: userId, category: categoryId });
        
        if (!learningRecord) {
          learningRecord = await Learning.create({
            user: userId,
            category: categoryId,
            remembered: correctWordIds
          });
        } else {
          // Add new correct words to remembered list (avoid duplicates)
          const newWords = correctWordIds.filter(wordId => 
            !learningRecord.remembered.some(rememberedId => 
              rememberedId.toString() === wordId.toString()
            )
          );
          learningRecord.remembered.push(...newWords);
          await learningRecord.save();
        }
      } catch (learningError) {
        console.error("Error updating learning record:", learningError);
        // Continue with quiz results even if learning update fails
      }
    }

    // Update quiz logs
    await Quiz.findByIdAndUpdate(id, {
      $set: {
        [`logs.${Date.now()}`]: {
          userId: userId || 'anonymous',
          score: results.score,
          totalQuestions: results.totalQuestions,
          submittedAt: new Date()
        }
      }
    });

    // Update streak for quiz completion (only if userId provided)
    let updatedStreak = null;
    if (userId) {
      updatedStreak = await updateStreakForQuizCompleted(userId);
    }

    res.status(200).json({
      quizId: id,
      score: results.score,
      totalQuestions: results.totalQuestions,
      percentage: results.percentage,
      correctAnswers: results.correctAnswers,
      incorrectAnswers: results.incorrectAnswers,
      wordsMarkedAsLearned: correctWordIds.length,
      streak: updatedStreak
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Get user quiz history
const get_user_quiz_history = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all quizzes that have logs for this user
    const quizzes = await Quiz.find({
      [`logs.${userId}`]: { $exists: true }
    }).select('_id questions numOfQuestion createdDate logs summary');
    
    // Extract user-specific quiz history
    const userHistory = quizzes.map(quiz => {
      const userLogs = Object.entries(quiz.logs).filter(([timestamp, log]) => 
        log.userId === userId
      );
      
      return {
        quizId: quiz._id,
        numOfQuestion: quiz.numOfQuestion,
        createdDate: quiz.createdDate,
        summary: quiz.summary,
        attempts: userLogs.map(([timestamp, log]) => ({
          timestamp: timestamp,
          score: log.score,
          totalQuestions: log.totalQuestions,
          percentage: ((log.score / log.totalQuestions) * 100).toFixed(2),
          submittedAt: log.submittedAt
        }))
      };
    });
    
    res.status(200).json(userHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* Helper function to generate diverse quiz questions
function generateQuizQuestions(words, numOfQuestion) {
  // Shuffle words and take only the number needed
  const shuffledWords = words.sort(() => 0.5 - Math.random()).slice(0, numOfQuestion);
  
  const questions = {};
  const questionTypes = ['multiple_choice', 'fill_blank', 'word_match', 'complete_word'];
  
  shuffledWords.forEach((word, index) => {
    const questionId = `q${index + 1}`;
    const questionType = questionTypes[index % questionTypes.length]; // Rotate through types
    
    switch (questionType) {
      case 'multiple_choice':
        questions[questionId] = generateMultipleChoiceQuestion(word, words);
        break;
      case 'fill_blank':
        questions[questionId] = generateFillBlankQuestion(word);
        break;
      case 'word_match':
        questions[questionId] = generateWordMatchQuestion(word, words);
        break;
      case 'complete_word':
        questions[questionId] = generateCompleteWordQuestion(word);
        break;
      default:
        questions[questionId] = generateMultipleChoiceQuestion(word, words);
    }
    
    questions[questionId].wordId = word._id;
  });
  
  return questions;
}

//* Generate Multiple Choice Question (Original)
function generateMultipleChoiceQuestion(word, allWords) {
  const correctAnswer = word.meaning;
  const wrongAnswers = generateWrongAnswers(allWords, word.meaning, 3);
  const allOptions = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
  
  return {
    word: word.word,
    IPA: word.IPA,
    partOfSpeech: word.partOfSpeech,
    example: word.example,
    question: `What does "${word.word}" mean?`,
    options: allOptions,
    correctAnswer: correctAnswer,
    type: 'multiple_choice'
  };
}

//* Generate Fill in the Blank Question
function generateFillBlankQuestion(word) {
  const example = word.example || `This is a ${word.word}.`;
  // Replace the word with blank in the example
  const questionText = example.replace(new RegExp(word.word, 'gi'), '______');
  
  return {
    word: word.word,
    IPA: word.IPA,
    partOfSpeech: word.partOfSpeech,
    example: word.example,
    question: `Fill in the blank: ${questionText}`,
    correctAnswer: word.word.toLowerCase(),
    type: 'fill_blank',
    placeholder: 'Type your answer here...'
  };
}

//* Generate Word Matching Question
function generateWordMatchQuestion(word, allWords) {
  // Create 4 word-meaning pairs
  const wrongWords = allWords
    .filter(w => w._id.toString() !== word._id.toString())
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  
  const allWordPairs = [word, ...wrongWords];
  const words = allWordPairs.map(w => w.word).sort(() => 0.5 - Math.random());
  const meanings = allWordPairs.map(w => w.meaning).sort(() => 0.5 - Math.random());
  
  return {
    word: word.word,
    IPA: word.IPA,
    partOfSpeech: word.partOfSpeech,
    example: word.example,
    question: `Match the word "${word.word}" with its correct meaning:`,
    words: words,
    meanings: meanings,
    correctAnswer: word.meaning,
    type: 'word_match'
  };
}

//* Generate Complete the Word Question
function generateCompleteWordQuestion(word) {
  // Hide some letters from the word
  const wordLength = word.word.length;
  const hideCount = Math.min(Math.floor(wordLength / 2), 3); // Hide up to 3 letters
  let hiddenWord = word.word.toLowerCase();
  
  // Randomly hide letters (but not the first letter)
  const hiddenPositions = [];
  for (let i = 0; i < hideCount; i++) {
    let pos;
    do {
      pos = Math.floor(Math.random() * (wordLength - 1)) + 1; // Skip first letter
    } while (hiddenPositions.includes(pos));
    hiddenPositions.push(pos);
  }
  
  hiddenPositions.forEach(pos => {
    hiddenWord = hiddenWord.substring(0, pos) + '_' + hiddenWord.substring(pos + 1);
  });
  
  return {
    word: word.word,
    IPA: word.IPA,
    partOfSpeech: word.partOfSpeech,
    example: word.example,
    question: `Complete the word: ${hiddenWord.toUpperCase()}`,
    hint: `Meaning: ${word.meaning}`,
    correctAnswer: word.word.toLowerCase(),
    type: 'complete_word',
    hiddenWord: hiddenWord.toUpperCase(),
    placeholder: 'Type the complete word...'
  };
}

//* Helper function to generate wrong answers
function generateWrongAnswers(allWords, correctAnswer, count) {
  const wrongAnswers = allWords
    .filter(word => word.meaning !== correctAnswer)
    .map(word => word.meaning)
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
    
  return wrongAnswers;
}

//* Helper function to calculate quiz results
function calculateQuizResults(questions, answers) {
  const results = {
    score: 0,
    totalQuestions: Object.keys(questions).length,
    correctAnswers: [],
    incorrectAnswers: [],
    skippedAnswers: []
  };
  
  // Create a map of answered questions for quick lookup
  const answeredQuestions = new Map();
  answers.forEach(answer => {
    answeredQuestions.set(answer.questionId, answer);
  });
  
  // Process all questions
  Object.keys(questions).forEach(questionId => {
    const question = questions[questionId];
    const answer = answeredQuestions.get(questionId);
    
    if (!answer) {
      // Question was skipped
      results.skippedAnswers.push({
        questionId: questionId,
        wordId: question.wordId,
        word: question.word,
        correctAnswer: question.correctAnswer,
        type: question.type
      });
      return;
    }
    
    let isCorrect = false;
    
    // Different scoring logic based on question type
    switch (question.type) {
      case 'multiple_choice':
        isCorrect = answer.selectedOption === question.correctAnswer;
        break;
        
      case 'fill_blank':
      case 'complete_word':
        // Case-insensitive comparison for text answers
        const userAnswer = (answer.selectedOption || '').toLowerCase().trim();
        const correctAnswer = (question.correctAnswer || '').toLowerCase().trim();
        isCorrect = userAnswer === correctAnswer;
        break;
        
      case 'word_match':
        // For word matching, the answer should be the correct meaning of the target word
        isCorrect = answer.selectedOption === question.correctAnswer;
        break;
        
      default:
        isCorrect = answer.selectedOption === question.correctAnswer;
    }
    
    if (isCorrect) {
      results.score++;
      results.correctAnswers.push({
        questionId: questionId,
        wordId: question.wordId,
        word: question.word,
        selectedOption: answer.selectedOption,
        correctAnswer: question.correctAnswer,
        type: question.type
      });
    } else {
      results.incorrectAnswers.push({
        questionId: questionId,
        wordId: question.wordId,
        word: question.word,
        selectedOption: answer.selectedOption,
        correctAnswer: question.correctAnswer,
        type: question.type
      });
    }
  });
  
  results.percentage = ((results.score / results.totalQuestions) * 100).toFixed(2);
  
  return results;
}

// Helper function to update streak when quiz is completed
const updateStreakForQuizCompleted = async (userId) => {
  try {
    console.log('Updating streak for quiz completion, userId:', userId);
    
    let streak = await Streak.findOne({ user: userId });
    
    if (!streak) {
      // Create new streak if doesn't exist
      streak = new Streak({
        user: userId,
        streakCount: 0,
        startDate: null,
        endDate: null
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    // Check if this is a new streak day
    if (!streak.endDate || !isSameDay(streak.endDate, today)) {
      
      // Check if streak should continue
      if (streak.endDate && isYesterday(streak.endDate)) {
        // Continue streak
        streak.streakCount += 1;
        streak.endDate = today;
        console.log(`Streak continued: ${streak.streakCount} days`);
      } else if (streak.endDate && !isYesterday(streak.endDate)) {
        // Streak broken, restart
        streak.streakCount = 1;
        streak.startDate = today;
        streak.endDate = today;
        console.log('Streak broken, restarting with 1 day');
      } else {
        // First time or very first streak
        streak.streakCount = 1;
        streak.startDate = today;
        streak.endDate = today;
        console.log('Starting new streak: 1 day');
      }
    } else {
      console.log('Activity already recorded for today, streak unchanged');
    }

    await streak.save();    console.log('Updated streak:', streak);
    return streak;
  } catch (error) {
    console.error('Error updating streak for quiz completion:', error);
    return null;
  }
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Helper function to check if a date is yesterday
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

module.exports = {
  create_category_quiz,
  create_comprehensive_quiz,
  create_random_quiz,
  create_quiz,
  get_quiz_by_id,
  submit_quiz,
  get_user_quiz_history
};