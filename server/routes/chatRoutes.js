const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const User = require('../models/User');
const Chat = require('../models/Chat');

router.post('/send', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const NewChat = new Chat({
      senderId: user.userId,
      recipientId: req.body.recipientId,
      content: req.body.content,
      timestamp: new Date(),
    });

    await NewChat.save();

    res.status(200).json({message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/gethistory', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId }).select('-password');
        const chats = await Chat.findOne({ senderId: user.userId}).sort('timestamp');
        console.log(req.params.recipientId);
    
        if (!chats) return res.status(404).json({ message: 'No chat history found' });
    
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;