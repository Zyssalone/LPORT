const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  content: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  votes: {
    upvotedBy: { type: [String], default: [] },
    downvotedBy: { type: [String], default: [] }
  }
});

module.exports = mongoose.model('Post', postSchema);
