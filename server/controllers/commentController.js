const jwt = require("jsonwebtoken");
const Comment = require("../models/Comment");

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const newComment = new Comment({
      postId,
      author: req.user.userId,
      content,
    });

    await newComment.save();
    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

module.exports = { createComment };

const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const token = req.headers.authorization?.split(" ")[1];
    let currentUserId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) {
        console.warn(
          "Invalid token in GET /comments/:postId (ignoring userVote)"
        );
      }
    }

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

    const formatted = comments.map((comment) => {
      let userVote = null;
      if (currentUserId) {
        if (comment.votes.upvotedBy.includes(currentUserId))
          userVote = "upvote";
        if (comment.votes.downvotedBy.includes(currentUserId))
          userVote = "downvote";
      }

      return {
        _id: comment._id,
        postId: comment.postId,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
        upvotes: comment.votes.upvotedBy.length,
        downvotes: comment.votes.downvotedBy.length,
        userVote, // Add this field
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

module.exports = { createComment, getCommentsByPost };

const voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.userId;

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let userVote = null;

    if (voteType === "upvote") {
      comment.votes.downvotedBy = comment.votes.downvotedBy.filter(
        (id) => id !== userId
      );

      if (comment.votes.upvotedBy.includes(userId)) {
        comment.votes.upvotedBy = comment.votes.upvotedBy.filter(
          (id) => id !== userId
        );
        userVote = null; // Toggled off
      } else {
        comment.votes.upvotedBy.push(userId);
        userVote = "upvote";
      }
    } else {
      comment.votes.upvotedBy = comment.votes.upvotedBy.filter(
        (id) => id !== userId
      );

      if (comment.votes.downvotedBy.includes(userId)) {
        comment.votes.downvotedBy = comment.votes.downvotedBy.filter(
          (id) => id !== userId
        );
        userVote = null; // Toggled off
      } else {
        comment.votes.downvotedBy.push(userId);
        userVote = "downvote";
      }
    }

    await comment.save();

    res.status(200).json({
      message: "Comment vote updated",
      upvotes: comment.votes.upvotedBy.length,
      downvotes: comment.votes.downvotedBy.length,
      userVote, // Add this field
    });
  } catch (err) {
    console.error("Comment voting error:", err.message);
    res.status(500).json({ message: "Failed to vote on comment" });
  }
};

module.exports = {
  createComment,
  getCommentsByPost,
  voteComment,
};
