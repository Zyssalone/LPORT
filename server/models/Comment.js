const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: String, // Could be userId or username
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  votes: {
    upvotedBy: { type: [String], default: [] },
    downvotedBy: { type: [String], default: [] }
  }
});

module.exports = mongoose.model('Comment', commentSchema);
