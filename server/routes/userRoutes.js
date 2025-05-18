const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const User = require('../models/User');
const Chat = require('../models/Chat');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Only accept image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Store in memory so Sharp can process
const storage = multer.memoryStorage();
const upload = multer({ storage, fileFilter });

// Upload avatar route
router.post('/upload-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const extension = path.extname(req.file.originalname);
    const safeFilename = `${req.user.userId}-${Date.now()}.jpg`;
    const uploadPath = path.join(__dirname, '../uploads', safeFilename);
    const newAvatarPath = `/uploads/${safeFilename}`;

    // Resize, convert to .jpg, and save
    await sharp(req.file.buffer)
      .resize(256, 256)
      .jpeg({ quality: 80 })
      .toFile(uploadPath);

    // Find the current user to get their existing avatar
    const user = await User.findOne({ userId: req.user.userId });

    if (user && user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath); // Delete old file
        console.log('Deleted old avatar:', oldAvatarPath);
      }
    }

    // Update DB with new avatar
    await User.updateOne({ userId: req.user.userId }, { avatar: newAvatarPath });

    res.status(200).json({ avatar: newAvatarPath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Failed to process avatar' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// // Get a user by their userId
// router.get('/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;  // Grab userId from the URL params
//     const user = await User.findOne({ userId }).select('-password');  // Search user by userId
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.status(200).json(user);  // Return the user data
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Route to follow a user
router.post('/follow', verifyToken, async (req, res) => {
  
  try {
    const { followerId, followeeId } = req.body;

    // Validation checks
    if (followerId === followeeId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const [follower, followee] = await Promise.all([
      User.findOne({ userId: followerId }),
      User.findOne({ userId: followeeId })
    ]);

    if (!follower || !followee) {
      return res.status(404).json({ message: 'User nost found' });
    }

    if (follower.following.includes(followeeId)) {
      return res.status(400).json({ message: 'Already following' });
    }

    // Update follow relationships
    follower.following.push(followeeId);
    followee.followers.push(followerId);

    // Check and update friendship if mutual
    let becameFriends = false;
    if (followee.following.includes(followerId)) {
      if (!follower.friends.includes(followeeId)) {
        follower.friends.push(followeeId);
        followee.friends.push(followerId);
        becameFriends = true;
      }
    }

    await Promise.all([follower.save(), followee.save()]);

    return res.status(200).json({ 
      message: 'Followed successfully',
      becameFriends
    });
  } catch (error) {
    console.error('Follow error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Route to unfollow a user
router.post('/unfollow', verifyToken, async (req, res) => {
  try {
    const { followerId, followeeId } = req.body;

    const follower = await User.findOne({ userId: followerId });
    const followee = await User.findOne({ userId: followeeId });

    if (!follower || !followee) {
      return res.status(404).json({ message: 'User nost found.' });
    }

    if (!follower.following.includes(followeeId)) {
      return res.status(400).json({ message: 'You are not following this user.' });
    }

    // Update follow relationships
    follower.following = follower.following.filter(id => id !== followeeId);
    followee.followers = followee.followers.filter(id => id !== followerId);
    
    // Remove from friends if they were friends
    if (follower.friends.includes(followeeId)) {
      follower.friends = follower.friends.filter(id => id !== followeeId);
      followee.friends = followee.friends.filter(id => id !== followerId);
    }

    await follower.save();
    await followee.save();

    return res.status(200).json({ message: 'Unfollowed successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// Route to add a friend
router.post('/add-friend', verifyToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    // Find both users
    const user1 = await User.findOne({ userId: userId1 });
    const user2 = await User.findOne({ userId: userId2 });

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'User nost found.' });
    }

    // Check if both users follow each other
    if (!user1.following.includes(userId2) || !user2.following.includes(userId1)) {
      return res.status(400).json({ message: 'Both users must follow each other before becoming friends.' });
    }

    // Add each other to friends list if not already friends
    if (!user1.friends.includes(userId2)) {
      user1.friends.push(userId2);
    }

    if (!user2.friends.includes(userId1)) {
      user2.friends.push(userId1);
    }

    await user1.save();
    await user2.save();

    return res.status(200).json({ message: 'Friends added successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route to remove a friend
router.post('/remove-friend', verifyToken, async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    // Find both users
    const user1 = await User.findOne({ userId: userId1 });
    const user2 = await User.findOne({ userId: userId2 });

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'User nost found.' });
    }

    // Remove each other from the friends list
    user1.friends = user1.friends.filter(id => id !== userId2);
    user2.friends = user2.friends.filter(id => id !== userId1);

    await user1.save();
    await user2.save();

    return res.status(200).json({ message: 'Friend removed successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/friends', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');

    if (!user) {
      console.error("User not found. Query:", { userId: req.user.userId });
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.friends || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get chat history
router.get('/chat/:friendId', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [
        { senderId: req.user.userId, recipientId: req.params.friendId },
        { senderId: req.params.friendId, recipientId: req.user.userId }
      ]
    }).sort('timestamp');
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

router.patch('/update-status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status length
    if (!status || status.trim().length === 0) {
      return res.status(400).json({ message: 'Status cannot be empty' });
    }
    
    if (status.length > 150) {
      return res.status(400).json({ message: 'Status must be 150 characters or less' });
    }

    // Update user status
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { status: status.trim() },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Status updated successfully',
      status: updatedUser.status
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});