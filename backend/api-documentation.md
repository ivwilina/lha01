# API Documentation

This document provides a comprehensive overview of all API endpoints in the LeHaiAnh backend application.

## Table of Contents
1. [User API](#user-api)
2. [Word API](#word-api)
3. [Category API](#category-api)
4. [Learning API](#learning-api)
5. [Streak API](#streak-api)
6. [Quiz API](#quiz-api)

---

## User API

Base route: `/user`

### Create a New User
- **Endpoint**: `POST /user/create`
- **Description**: Creates a new user account
- **Request Body**:
  ```json
  {
    "username": "example_user",
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: The created user object

### Check if User Exists
- **Endpoint**: `POST /user/check`
- **Description**: Checks if a user with specific email or username already exists
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "example_user"
  }
  ```
- **Response**: Status indicating if the user exists

### User Login
- **Endpoint**: `POST /user/login`
- **Description**: Authenticates a user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: Authentication token and user information

---

## Word API

Base route: `/word`

### Create a New Word
- **Endpoint**: `POST /word/add`
- **Description**: Creates a single new word
- **Request Body**:
  ```json
  {
    "word": "example",
    "partOfSpeech": "noun",
    "ipa": "/ɪɡˈzæmpəl/",
    "meaning": "A thing characteristic of its kind or illustrating a general rule",
    "example": "This is an example of how the word is used in a sentence",
    "exampleForQuiz": "This is an ___ of how the word is used in a sentence"
  }
  ```
- **Response**: The created word object

### Create Multiple Words
- **Endpoint**: `POST /word/add/many`
- **Description**: Creates multiple words in one request
- **Request Body**: An array of word objects
  ```json
  [
    {
      "word": "word1",
      "partOfSpeech": "noun",
      "ipa": "/wərd1/",
      "meaning": "First word meaning",
      "example": "Example sentence for word1",
      "exampleForQuiz": "Example sentence for ___"
    },
    {
      "word": "word2",
      "partOfSpeech": "verb",
      "ipa": "/wərd2/",
      "meaning": "Second word meaning",
      "example": "Example sentence for word2",
      "exampleForQuiz": "Example ___ for word2"
    }
  ]
  ```
- **Response**: An array of created word objects

### Create Category with Words
- **Endpoint**: `POST /word/add/category-with-words`
- **Description**: Creates a new category and multiple words in that category
- **Request Body**:
  ```json
  {
    "categoryTopic": "Daily Life",
    "words": [
      {
        "word": "breakfast",
        "partOfSpeech": "noun",
        "ipa": "/ˈbrekfəst/",
        "meaning": "The first meal of the day",
        "example": "She had cereal for breakfast",
        "exampleForQuiz": "She had cereal for ___"
      },
      {
        "word": "commute",
        "partOfSpeech": "verb",
        "ipa": "/kəˈmjuːt/",
        "meaning": "Travel regularly to and from work",
        "example": "He commutes to the city every day",
        "exampleForQuiz": "He ___ to the city every day"
      }
    ]
  }
  ```
- **Response**: A category object with populated words

### Get All Words
- **Endpoint**: `GET /word/get`
- **Description**: Retrieves all words in the database
- **Response**: An array of all word objects

### Get Words Except Remembered
- **Endpoint**: `GET /word/get/except/:learningId`
- **Description**: Gets all words except those already remembered in a learning record
- **Parameters**:
  - `learningId`: The ID of the learning record
- **Response**: An array of word objects not yet remembered by the user

---

## Category API

Base route: `/category`

### Create a New Category
- **Endpoint**: `POST /category/add`
- **Description**: Creates a new category
- **Request Body**:
  ```json
  {
    "categoryTopic": "Business English",
    "totalWords": 0,
    "words": []
  }
  ```
- **Response**: The created category object

### Get All Categories
- **Endpoint**: `GET /category/`
- **Description**: Retrieves all categories
- **Response**: An array of all category objects

### Get Category by ID
- **Endpoint**: `GET /category/list/:topic`
- **Description**: Retrieves a category by its ID
- **Parameters**:
  - `topic`: The ID of the category to retrieve
- **Response**: The matched category object

### Get Words in a Category
- **Endpoint**: `GET /category/words/:id`
- **Description**: Retrieves all words associated with a specific category
- **Parameters**:
  - `id`: The ID of the category
- **Response**: An array of word objects belonging to the category

### Update Category by ID
- **Endpoint**: `PUT /category/update/:id`
- **Description**: Updates a category by its ID
- **Parameters**:
  - `id`: The ID of the category to update
- **Request Body**: The fields to update
  ```json
  {
    "categoryTopic": "Updated Topic Name",
    "totalWords": 15,
    "words": ["word_id1", "word_id2", ...]
  }
  ```
- **Response**: The updated category object

---

## Learning API

Base route: `/learning`

### Create Learning Record
- **Endpoint**: `POST /learning/add`
- **Description**: Creates a new learning record for a user and category
- **Request Body**:
  ```json
  {
    "user": "user_id",
    "category": "category_id",
    "remembered": []
  }
  ```
- **Response**: The created learning record

### Get All Learning Records
- **Endpoint**: `GET /learning/get`
- **Description**: Retrieves all learning records
- **Response**: An array of all learning records with populated references

### Get Learning Records by User ID
- **Endpoint**: `GET /learning/get/:userId`
- **Description**: Gets all learning records for a specific user
- **Parameters**:
  - `userId`: The ID of the user
- **Response**: An array of learning records for the user

### Update Learning Record
- **Endpoint**: `PUT /learning/update/:id`
- **Description**: Updates a specific learning record
- **Parameters**:
  - `id`: The ID of the learning record to update
- **Request Body**: The fields to update
  ```json
  {
    "remembered": ["word_id1", "word_id2"]
  }
  ```
- **Response**: The updated learning record

### Add Word to Learning Record
- **Endpoint**: `PUT /learning/add-remembered/:id`
- **Description**: Adds a word to the remembered list in a learning record
- **Parameters**:
  - `id`: The ID of the learning record
- **Request Body**:
  ```json
  {
    "wordId": "word_id_to_add"
  }
  ```
- **Response**: The updated learning record with the new word added to the remembered list

### Delete Learning Record
- **Endpoint**: `DELETE /learning/delete/:id`
- **Description**: Deletes a specific learning record
- **Parameters**:
  - `id`: The ID of the learning record to delete
- **Response**: Confirmation message

---

## Streak API

Base route: `/streak`

### Initialize Streak
- **Endpoint**: `POST /streak/initialize`
- **Description**: Initializes a new streak for a user
- **Request Body**:
  ```json
  {
    "user": "user_id"
  }
  ```
- **Response**: The created streak object

### Extend Streak
- **Endpoint**: `PUT /streak/extend`
- **Description**: Extends a user's current streak
- **Request Body**:
  ```json
  {
    "user": "user_id"
  }
  ```
- **Response**: The updated streak object

### Get Current Streak
- **Endpoint**: `GET /streak/current/:userId`
- **Description**: Gets the current active streak for a user
- **Parameters**:
  - `userId`: The ID of the user
- **Response**: The user's current streak information

### End Streak
- **Endpoint**: `PUT /streak/end`
- **Description**: Ends a user's current streak
- **Request Body**:
  ```json
  {
    "user": "user_id"
  }
  ```
- **Response**: The finalized streak object

---

## Quiz API

Base route: `/quiz`

### Create a New Quiz
- **Endpoint**: `POST /quiz/create`
- **Description**: Creates a new quiz based on selected words
- **Request Body**:
  ```json
  {
    "words": ["word_id1", "word_id2", "word_id3"],
    "numOfQuestion": 10
  }
  ```
- **Response**: The created quiz object

### Get Quiz by ID
- **Endpoint**: `GET /quiz/:id`
- **Description**: Retrieves a specific quiz by ID
- **Parameters**:
  - `id`: The ID of the quiz
- **Response**: The quiz object

### Submit Quiz Answers
- **Endpoint**: `POST /quiz/:id/submit`
- **Description**: Submits answers for a quiz and gets results
- **Parameters**:
  - `id`: The ID of the quiz
- **Request Body**:
  ```json
  {
    "answers": [
      { 
        "questionId": "question_id1",
        "selectedOption": "option_id"
      },
      { 
        "questionId": "question_id2",
        "selectedOption": "option_id"
      }
    ]
  }
  ```
- **Response**: Quiz results with correct answers and score

### Get User Quiz History
- **Endpoint**: `GET /quiz/history/:userId`
- **Description**: Gets quiz history for a specific user
- **Parameters**:
  - `userId`: The ID of the user
- **Response**: An array of quiz summary objects

---

## Notes

- All API endpoints that require authentication should include an Authorization header with a valid token.
- Error responses include a message field describing the error.
- Most endpoints return status code 200 for success, 400 for bad request, 404 for not found, and 500 for server errors.
