const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Post = require("../models/Post");
const {
  createPost,
  getAllPosts,
  getSinglePost,
  votePost,
  editPost,
  deletePost,
  togglePostVisibility,
} = require("../controllers/postController");

// Create a post (requires login)
router.post("/create", verifyToken, createPost);

// ✅ Get all posts (public)
router.get("/", getAllPosts);

// ✅ Get posts by a specific user (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user's posts" });
  }
});

// Get posts upvoted by a user
router.get("/upvoted/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ "votes.upvotedBy": req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch upvoted posts" });
  }
});

// Get posts downvoted by a user
router.get("/downvoted/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ "votes.downvotedBy": req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch downvoted posts" });
  }
});

// ✅ Get a single post (must come AFTER `/user/:userId`)
router.get("/:postId", getSinglePost);

// ✅ Vote on a post (requires login)
router.post("/:postId/vote", verifyToken, votePost);

// ✅ Edit a post (requires login)
router.put("/:postId", verifyToken, editPost);

// ✅ Delete a post (requires login)
router.delete("/:postId", verifyToken, deletePost);

// ✅ Toggle visibility (requires login)
router.put("/:postId/toggle-visibility", verifyToken, togglePostVisibility);

module.exports = router;
