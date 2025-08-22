const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters']
  },
  body: {
    type: String,
    required: [true, 'Body is required'],
    minlength: [20, 'Body must be at least 20 characters']
  },
  tags: [{
    type: String,
    trim: true,
    validate: {
      validator: function(tag) {
        return tag && tag.length > 0;
      },
      message: 'Tag cannot be empty'
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['draft', 'published'],
      message: 'Status must be either draft or published'
    },
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Article', articleSchema);