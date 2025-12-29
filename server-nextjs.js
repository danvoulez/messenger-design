const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const { jwtVerify } = require('jose');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// JWT Secret (should match the one in lib/auth.ts)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ubl-messenger-secret-key-change-in-production'
);

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

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 Received:', data.type);

        switch (data.type) {
          case 'authenticate':
            // Verify JWT token
            if (data.token) {
              try {
                const { payload } = await jwtVerify(data.token, JWT_SECRET);
                ws.userId = payload.userId;
                ws.tenantId = payload.tenantId;
                ws.authenticated = true;
                ws.send(JSON.stringify({
                  type: 'authenticated',
                  userId: ws.userId,
                  tenantId: ws.tenantId,
                  timestamp: new Date().toISOString()
                }));
                console.log(`✅ Authenticated user: ${ws.userId} (tenant: ${ws.tenantId})`);
              } catch (error) {
                console.error('❌ Authentication failed:', error);
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Authentication failed',
                  timestamp: new Date().toISOString()
                }));
              }
            } else {
              // Fallback for backward compatibility (demo mode)
              ws.userId = data.userId || 'U.001';
              ws.tenantId = 'T.UBL';
              ws.authenticated = false;
              ws.send(JSON.stringify({
                type: 'authenticated',
                userId: ws.userId,
                timestamp: new Date().toISOString()
              }));
            }
            break;

          case 'message':
            // Broadcast message to all connected clients in the same tenant
            if (!ws.authenticated) {
              console.log('⚠️ Unauthenticated message broadcast (demo mode)');
            }
            
            wss.clients.forEach((client) => {
              if (client !== ws && 
                  client.readyState === WebSocket.OPEN &&
                  (!ws.tenantId || client.tenantId === ws.tenantId)) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  message: data.message,
                  timestamp: new Date().toISOString()
                }));
              }
            });
            break;

          case 'typing':
            // Broadcast typing indicator to clients in same tenant
            wss.clients.forEach((client) => {
              if (client !== ws && 
                  client.readyState === WebSocket.OPEN &&
                  (!ws.tenantId || client.tenantId === ws.tenantId)) {
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
            // Broadcast read receipt to clients in same tenant
            wss.clients.forEach((client) => {
              if (client !== ws && 
                  client.readyState === WebSocket.OPEN &&
                  (!ws.tenantId || client.tenantId === ws.tenantId)) {
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
    console.log(`🔐 Authentication: WebAuthn enabled`);
  });
});
