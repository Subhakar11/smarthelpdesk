const Article = require('../models/Article');

// @desc    Get all articles with optional search
// @route   GET /api/kb
// @access  Public
const getArticles = async (req, res) => {
  try {
    const { query, status } = req.query;
    let filter = {};

    // Safe user role check
    const userRole = req.user?.role;

    // Filter by status if provided
    if (status) {
      filter.status = status;
    } else {
      // Default to published articles for non-admins
      if (userRole !== 'admin') {
        filter.status = 'published';
      }
    }

    // Search functionality
    if (query && query.trim() !== '') {
      const searchQuery = query.trim();
      
      // Simple search without complex regex
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { body: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const articles = await Article.find(filter)
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.json(articles);

  } catch (error) {
    console.error('Error in getArticles:', error);
    res.status(500).json({ 
      message: 'Failed to fetch articles',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single article
// @route   GET /api/kb/:id
// @access  Public
const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Safe user role check
    const userRole = req.user?.role;

    // Check if user can view draft articles
    if (article.status === 'draft' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error in getArticle:', error);
    res.status(500).json({ 
      message: 'Failed to fetch article',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Create new article
// @route   POST /api/kb
// @access  Private/Admin
const createArticle = async (req, res) => {
  try {
    console.log('Creating article with data:', req.body);
    
    const articleData = {
      title: req.body.title?.trim(),
      body: req.body.body?.trim(),
      status: req.body.status || 'draft'
    };

    // Handle tags safely
    if (req.body.tags) {
      articleData.tags = Array.isArray(req.body.tags) 
        ? req.body.tags.map(tag => tag?.toString().trim()).filter(tag => tag)
        : [req.body.tags.toString().trim()].filter(tag => tag);
    }

    const article = await Article.create(articleData);
    res.status(201).json(article);
  } catch (error) {
    console.error('Error in createArticle:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create article',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update article
// @route   PUT /api/kb/:id
// @access  Private/Admin
const updateArticle = async (req, res) => {
  try {
    console.log('Updating article:', req.params.id, 'with data:', req.body);
    
    const updateData = {};
    
    if (req.body.title !== undefined) {
      updateData.title = req.body.title.trim();
    }
    
    if (req.body.body !== undefined) {
      updateData.body = req.body.body.trim();
    }
    
    if (req.body.status !== undefined) {
      updateData.status = req.body.status;
    }
    
    if (req.body.tags !== undefined) {
      updateData.tags = Array.isArray(req.body.tags) 
        ? req.body.tags.map(tag => tag?.toString().trim()).filter(tag => tag)
        : [req.body.tags.toString().trim()].filter(tag => tag);
    }

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error in updateArticle:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update article',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/kb/:id
// @access  Private/Admin
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article removed' });
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    res.status(500).json({ 
      message: 'Failed to delete article',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle
};