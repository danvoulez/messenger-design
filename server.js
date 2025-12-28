const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const apiApp = require('./api/index');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve API routes
app.use('/api', apiApp);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('📱 New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 Received:', data.type);
      
      // Handle different message types
      switch (data.type) {
        case 'authenticate':
          ws.userId = data.userId || 'U.001';
          ws.send(JSON.stringify({ 
            type: 'authenticated', 
            userId: ws.userId,
            timestamp: new Date().toISOString()
          }));
          break;
          
        case 'message':
          // Broadcast message to all connected clients except sender
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: data.message,
                timestamp: new Date().toISOString()
              }));
            }
          });
          break;
          
        case 'typing':
          // Broadcast typing indicator
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'typing',
                conversation_id: data.conversation_id,
                user_id: ws.userId,
                is_typing: data.is_typing,
                timestamp: new Date().toISOString()
              }));
            }
          });
          break;
          
        case 'read_receipt':
          // Broadcast read receipt
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'read_receipt',
                message_id: data.message_id,
                user_id: ws.userId,
                timestamp: new Date().toISOString()
              }));
            }
          });
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('📴 WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Messenger App running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
  console.log(`🎨 UI: http://localhost:${PORT}`);
  console.log(`💬 WebSocket: ws://localhost:${PORT}`);
});
