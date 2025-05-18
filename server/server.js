const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const http = require('http');
const { wss } = require('./lib/wsServer');
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get("/", (req, res) => res.send("API is working"));

// Create HTTP server
const server = http.createServer(app);

// WebSocket upgrade handler
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Database connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`HTTP server running on port ${PORT}`);
      console.log(`WebSocket server ready for connections`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling for WebSocket server
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});