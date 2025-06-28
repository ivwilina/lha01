const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/admin.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// Authentication routes
router.post('/login', adminController.adminLogin);

// Protected routes - require admin authentication
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Category management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Word management
router.get('/words', adminController.getAllWords);
router.post('/words', adminController.createWord);
router.put('/words/:id', adminController.updateWord);
router.delete('/words/:id', adminController.deleteWord);

// Bulk import routes
router.post('/words/import', uploadSingle, adminController.importWordsFromFile);
router.post('/categories/import-with-words', uploadSingle, adminController.importCategoryWithWords);

module.exports = router;
