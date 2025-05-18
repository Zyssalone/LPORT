const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  // New fields
  avatar: {
    type: String,
    default: '/profile_picture_user_icon_153847.ico',
  },
  status: {
    type: String,
    default: 'Hey there! I am using CampusConnect.',
  },
  title: {
    type: String,
    default: 'Newbie',
  },

  // Friendships and relationships
  friends: {
    type: [String], // Array of userIds (friends are mutual)
    default: [],
  },
  followers: {
    type: [String], // Array of userIds (those who follow this user)
    default: [],
  },
  following: {
    type: [String], // Array of userIds (users this user is following)
    default: [],
  },
}, {
  timestamps: true, // automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema);
