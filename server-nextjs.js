const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Create WebSocket server
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('📱 New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 Received:', data.type);

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

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Next.js Messenger App running on http://${hostname}:${port}`);
    console.log(`📡 API: http://${hostname}:${port}/api/health`);
    console.log(`💬 WebSocket: ws://${hostname}:${port}`);
  });
});
