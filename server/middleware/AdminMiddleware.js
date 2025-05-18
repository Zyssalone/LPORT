const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Find the user and check admin status
    const user = await User.findOne({ userId: req.user.userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // User is admin, proceed
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = verifyAdmin;