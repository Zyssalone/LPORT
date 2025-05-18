const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true,
  },
  author: {
    type: String, // userId of the admin who created the announcement
    required: true,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    default: null, // null means never expires
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // automatically adds createdAt and updatedAt fields
});

// Index for better performance
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ pinned: 1 });
announcementSchema.index({ active: 1 });

// Virtual to check if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

module.exports = mongoose.model('Announcement', announcementSchema);