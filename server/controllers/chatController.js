const User = require('../models/Chat');

// Follow User
const sendMessage = async (req, res) => {
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

module.exports = {
  sendMessage,
};
