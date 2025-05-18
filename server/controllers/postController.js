const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    console.log("Incoming request body:", req.body);
    console.log("User from token:", req.user);

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const newPost = new Post({
      userId: req.user.userId,
      title,
      content,
    });

    console.log("New post instance:", newPost);

    await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    let currentUserId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) {
        console.warn("Invalid token in GET /posts (skipping userVote)");
      }
    }

    const posts = await Post.find().sort({ createdAt: -1 });

    const formatted = posts.map((post) => {
      let userVote = null;
      if (currentUserId) {
        if (post.votes.upvotedBy.includes(currentUserId)) userVote = "upvote";
        if (post.votes.downvotedBy.includes(currentUserId))
          userVote = "downvote";
      }

      return {
        _id: post._id,
        author: post.userId,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        upvotes: post.votes.upvotedBy.length,
        downvotes: post.votes.downvotedBy.length,
        userVote,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    // Find the post by id
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if the logged-in user is the author
    if (post.author !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: Not your post' });
    }
    
    // Update fields if provided
    if (title) post.title = title;
    if (content) post.content = content;
    
    await post.save();
    res.status(200).json({ message: 'Post updated', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating post' });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const token = req.headers.authorization?.split(" ")[1];
    let currentUserId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (err) {
        console.warn("Invalid token in GET /posts/:id (ignoring userVote)");
      }
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let userVote = null;
    if (currentUserId) {
      if (post.votes.upvotedBy.includes(currentUserId)) userVote = "upvote";
      if (post.votes.downvotedBy.includes(currentUserId)) userVote = "downvote";
    }

    res.status(200).json({
      _id: post._id,
      author: post.userId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      upvotes: post.votes.upvotedBy.length,
      downvotes: post.votes.downvotedBy.length,
      userVote,
    });
  } catch (err) {
    console.error("Error fetching post:", err.message);
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the logged-in user is the author
    if (post.author !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: Not your post' });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

const togglePostVisibility = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the logged-in user is the author
    if (post.author !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized: Not your post' });
    }

    // Toggle the isHidden property
    post.isHidden = !post.isHidden;
    await post.save();

    res.status(200).json({ message: 'Post visibility updated', isHidden: post.isHidden });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating visibility' });
  }
};

const votePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.userId;

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove from opposite vote if exists
    if (voteType === "upvote") {
      post.votes.downvotedBy = post.votes.downvotedBy.filter(
        (id) => id !== userId
      );

      if (post.votes.upvotedBy.includes(userId)) {
        // Toggle off upvote
        post.votes.upvotedBy = post.votes.upvotedBy.filter(
          (id) => id !== userId
        );
      } else {
        post.votes.upvotedBy.push(userId);
      }
    } else if (voteType === "downvote") {
      post.votes.upvotedBy = post.votes.upvotedBy.filter((id) => id !== userId);

      if (post.votes.downvotedBy.includes(userId)) {
        // Toggle off downvote
        post.votes.downvotedBy = post.votes.downvotedBy.filter(
          (id) => id !== userId
        );
      } else {
        post.votes.downvotedBy.push(userId);
      }
    }

    await post.save();

    res.status(200).json({
      message: "Vote updated",
      upvotes: post.votes.upvotedBy.length,
      downvotes: post.votes.downvotedBy.length,
    });
  } catch (err) {
    console.error("Voting error:", err.message);
    res.status(500).json({ message: "Failed to vote" });
  }
};



module.exports = {
  createPost,
  getAllPosts,
  getSinglePost,
  votePost,
  editPost,
  deletePost,
  togglePostVisibility,
};
