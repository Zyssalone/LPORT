const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/AdminMiddleware');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

// Get all active announcements (public route)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get active announcements (not expired)
    const announcements = await Announcement.find({
      active: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ pinned: -1, createdAt: -1 }) // Pinned first, then by date
    .skip(skip)
    .limit(limit);

    // Get author details for each announcement
    const announcementsWithAuthors = await Promise.all(
      announcements.map(async (announcement) => {
        const author = await User.findOne({ userId: announcement.author }).select('userId avatar title');
        return {
          ...announcement.toObject(),
          authorDetails: author || { userId: 'Unknown', avatar: '/default-avatar.ico', title: 'Admin' }
        };
      })
    );

    // Get total count for pagination
    const total = await Announcement.countDocuments({
      active: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.json({
      announcements: announcementsWithAuthors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single announcement
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if announcement is expired
    if (announcement.expiresAt && announcement.expiresAt < new Date()) {
      return res.status(404).json({ message: 'Announcement has expired' });
    }

    // Get author details
    const author = await User.findOne({ userId: announcement.author }).select('userId avatar title');
    
    res.json({
      ...announcement.toObject(),
      authorDetails: author || { userId: 'Unknown', avatar: '/default-avatar.ico', title: 'Admin' }
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new announcement (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { content, pinned, expiresAt } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Content must be 2000 characters or less' });
    }

    // Create announcement
    const announcement = new Announcement({
      content: content.trim(),
      author: req.user.userId,
      pinned: pinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await announcement.save();

    // Get author details for response
    const author = await User.findOne({ userId: req.user.userId }).select('userId avatar title');

    res.status(201).json({
      ...announcement.toObject(),
      authorDetails: author
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update announcement (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { content, pinned, expiresAt, active } = req.body;
    
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if current user is the author
    if (announcement.author !== req.user.userId) {
      return res.status(403).json({ message: 'You can only edit your own announcements' });
    }

    // Update fields
    if (content !== undefined) {
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Content is required' });
      }
      if (content.length > 2000) {
        return res.status(400).json({ message: 'Content must be 2000 characters or less' });
      }
      announcement.content = content.trim();
    }
    
    if (pinned !== undefined) announcement.pinned = pinned;
    if (active !== undefined) announcement.active = active;
    if (expiresAt !== undefined) {
      announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    await announcement.save();

    // Get author details for response
    const author = await User.findOne({ userId: announcement.author }).select('userId avatar title');

    res.json({
      ...announcement.toObject(),
      authorDetails: author
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if current user is the author
    if (announcement.author !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own announcements' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pinned announcements (for displaying at top of feeds)
router.get('/pinned/active', async (req, res) => {
  try {
    const announcements = await Announcement.find({
      pinned: true,
      active: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5); // Limit to 5 pinned announcements

    // Get author details for each announcement
    const announcementsWithAuthors = await Promise.all(
      announcements.map(async (announcement) => {
        const author = await User.findOne({ userId: announcement.author }).select('userId avatar title');
        return {
          ...announcement.toObject(),
          authorDetails: author || { userId: 'Unknown', avatar: '/default-avatar.ico', title: 'Admin' }
        };
      })
    );

    res.json(announcementsWithAuthors);
  } catch (error) {
    console.error('Error fetching pinned announcements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;