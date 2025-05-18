const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const {
  createComment,
  getCommentsByPost,
  voteComment
} = require('../controllers/commentController');

// Add a comment (protected)
router.post('/:postId', verifyToken, createComment);

// Get comments for a post (public)
router.get('/:postId', getCommentsByPost);

// Vote on a comment (protected)
router.post('/vote/:commentId', verifyToken, voteComment);

router.get('/user/:userId', async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Failed to fetch user comments:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

module.exports = router;
