// lib/wsServer.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ noServer: true });
const activeConnections = new Map();

wss.on('connection', (ws, request) => {
  try {
    const token = new URL(request.url, `ws://${request.headers.host}`).searchParams.get('token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    activeConnections.set(decoded.userId, ws);

    ws.on('message', async (message) => {
      const { recipientId, content } = JSON.parse(message);
      
      // Verify friendship before delivering message
      const isFriend = await require('../models/User').exists({
        userId: decoded.userId,
        friends: recipientId
      });
      
      if (isFriend && activeConnections.has(recipientId)) {
        activeConnections.get(recipientId).send(JSON.stringify({
          senderId: decoded.userId,
          content,
          timestamp: new Date().toISOString()
        }));
      }
    });

    ws.on('close', () => {
      activeConnections.delete(decoded.userId);
    });

  } catch (err) {
    ws.close();
  }
});

module.exports = { wss };