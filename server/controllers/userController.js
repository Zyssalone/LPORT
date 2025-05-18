const User = require('../models/User');

// Follow User
const followUser = async (req, res) => {
  try {
    const { followerId, followeeId } = req.body;

    if (followerId === followeeId) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    // Find both users
    const follower = await User.findOne({ userId: followerId });
    const followee = await User.findOne({ userId: followeeId });

    if (!follower || !followee) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if already following
    if (follower.following.includes(followeeId)) {
      return res.status(400).json({ message: 'You are already following this user.' });
    }

    // Add to following list of follower and followers list of followee
    follower.following.push(followeeId);
    followee.followers.push(followerId);

    await follower.save();
    await followee.save();

    return res.status(200).json({ message: 'Followed successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Unfollow User
const unfollowUser = async (req, res) => {
  try {
    const { followerId, followeeId } = req.body;

    // Find both users
    const follower = await User.findOne({ userId: followerId });
    const followee = await User.findOne({ userId: followeeId });

    if (!follower || !followee) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if user is not following
    if (!follower.following.includes(followeeId)) {
      return res.status(400).json({ message: 'You are not following this user.' });
    }

    // Remove from following list of follower and followers list of followee
    follower.following = follower.following.filter(id => id !== followeeId);
    followee.followers = followee.followers.filter(id => id !== followerId);

    await follower.save();
    await followee.save();

    return res.status(200).json({ message: 'Unfollowed successfully!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add Friend
const addFriend = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    // Find both users
    const user1 = await User.findOne({ userId: userId1 });
    const user2 = await User.findOne({ userId: userId2 });

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'User not found.' });
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
};

// Remove Friend
const removeFriend = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    // Find both users
    const user1 = await User.findOne({ userId: userId1 });
    const user2 = await User.findOne({ userId: userId2 });

    if (!user1 || !user2) {
      return res.status(404).json({ message: 'User not found.' });
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
};

module.exports = {
  followUser,
  unfollowUser,
  addFriend,
  removeFriend,
};
