const express = require('express');
const { 
  getArticles, 
  getArticle, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} = require('../controllers/kbController');
const { protect, authorize } = require('../middleware/auth');
const { validate, articleSchema } = require('../middleware/validation');

const router = express.Router();

// Public routes - NO authentication middleware
router.get('/', getArticles);
router.get('/:id', getArticle);

// Protected admin routes - WITH authentication middleware
router.post('/', protect, authorize('admin'), validate(articleSchema), createArticle);
router.put('/:id', protect, authorize('admin'), validate(articleSchema), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);

module.exports = router;