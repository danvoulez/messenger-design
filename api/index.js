const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (for demo purposes - in production use a database)
const storage = {
  users: [
    {
      id: "U.001",
      username: "dan",
      display_name: "Dan",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=dan&backgroundColor=f5f5f5",
      status: "online",
      last_seen: new Date().toISOString()
    },
    {
      id: "U.002",
      username: "alex",
      display_name: "Alex (Advisor)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=alex&backgroundColor=e0e0e0",
      status: "online",
      last_seen: new Date().toISOString()
    },
    {
      id: "U.003",
      username: "sarah",
      display_name: "Sarah (Designer)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=c8e6c9",
      status: "away",
      last_seen: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  conversations: [
    {
      id: "conv_001",
      type: "direct",
      name: "Alex (Advisor)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=alex&backgroundColor=e0e0e0",
      participants: ["U.001", "U.002"],
      last_message: {
        text: "Let's sync on the investor deck",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        sender: "U.002"
      },
      unread_count: 0,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "conv_002",
      type: "direct",
      name: "Sarah (Designer)",
      avatar_url: "https://api.dicebear.com/7.x/notionists/svg?seed=sarah&backgroundColor=c8e6c9",
      participants: ["U.001", "U.003"],
      last_message: {
        text: "The new mockups are ready!",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        sender: "U.003"
      },
      unread_count: 2,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: "conv_003",
      type: "group",
      name: "UBL 2.0 Sprint",
      avatar_url: null,
      participants: ["U.001", "U.002", "U.003"],
      last_message: {
        text: "Policy VM bytecode tests passing",
        timestamp: new Date(Date.now() - 720000).toISOString(),
        sender: "U.001"
      },
      unread_count: 0,
      created_at: new Date(Date.now() - 259200000).toISOString()
    }
  ],
  messages: [
    {
      id: "msg_001",
      conversation_id: "conv_001",
      sender_id: "U.002",
      text: "Hey Dan, do you have time this week to review the investor deck?",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: "read",
      type: "text"
    },
    {
      id: "msg_002",
      conversation_id: "conv_001",
      sender_id: "U.001",
      text: "Sure! How about Thursday afternoon?",
      timestamp: new Date(Date.now() - 12600000).toISOString(),
      status: "read",
      type: "text"
    },
    {
      id: "msg_003",
      conversation_id: "conv_001",
      sender_id: "U.002",
      text: "Perfect! I'll send over the deck by Wednesday.",
      timestamp: new Date(Date.now() - 11800000).toISOString(),
      status: "read",
      type: "text"
    },
    {
      id: "msg_004",
      conversation_id: "conv_001",
      sender_id: "U.002",
      text: "Let's sync on the investor deck",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: "read",
      type: "text"
    }
  ],
  typing: {}
};

// Helper function to create timestamps
function createTimestamp() {
  return new Date().toISOString();
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', service: 'messenger' });
});

// ============================================
// USER ENDPOINTS
// ============================================

// Get current user
app.get('/v1/users/me', (req, res) => {
  // In a real app, this would be authenticated
  const user = storage.users.find(u => u.id === "U.001");
  res.json({ user });
});

// Get all users
app.get('/v1/users', (req, res) => {
  res.json({ users: storage.users });
});

// Update user status
app.patch('/v1/users/me/status', (req, res) => {
  const { status } = req.body;
  const user = storage.users.find(u => u.id === "U.001");
  
  if (user) {
    user.status = status;
    user.last_seen = createTimestamp();
  }
  
  res.json({ user });
});

// ============================================
// CONVERSATION ENDPOINTS
// ============================================

// Get all conversations
app.get('/v1/conversations', (req, res) => {
  // Sort by last message timestamp
  const sorted = [...storage.conversations].sort((a, b) => 
    new Date(b.last_message.timestamp) - new Date(a.last_message.timestamp)
  );
  
  res.json({ conversations: sorted });
});

// Get a specific conversation
app.get('/v1/conversations/:id', (req, res) => {
  const conversation = storage.conversations.find(c => c.id === req.params.id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json({ conversation });
});

// Create new conversation
app.post('/v1/conversations', (req, res) => {
  const { type, name, participants } = req.body;
  
  const conversation = {
    id: `conv_${uuidv4()}`,
    type: type || 'direct',
    name,
    avatar_url: null,
    participants,
    last_message: null,
    unread_count: 0,
    created_at: createTimestamp()
  };
  
  storage.conversations.push(conversation);
  res.status(201).json({ conversation });
});

// Mark conversation as read
app.post('/v1/conversations/:id/read', (req, res) => {
  const conversation = storage.conversations.find(c => c.id === req.params.id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  conversation.unread_count = 0;
  res.json({ conversation });
});

// ============================================
// MESSAGE ENDPOINTS
// ============================================

// Get messages for a conversation
app.get('/v1/conversations/:id/messages', (req, res) => {
  const { limit = 50, before } = req.query;
  
  let messages = storage.messages.filter(m => m.conversation_id === req.params.id);
  
  // Filter by timestamp if 'before' is provided
  if (before) {
    messages = messages.filter(m => new Date(m.timestamp) < new Date(before));
  }
  
  // Sort by timestamp descending and limit
  messages = messages
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit))
    .reverse(); // Reverse to show oldest first
  
  res.json({ messages });
});

// Send a message
app.post('/v1/conversations/:id/messages', (req, res) => {
  const { text, type = 'text', attachments = [] } = req.body;
  const conversationId = req.params.id;
  
  const conversation = storage.conversations.find(c => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  const message = {
    id: `msg_${uuidv4()}`,
    conversation_id: conversationId,
    sender_id: "U.001", // Current user (would be from auth in real app)
    text,
    type,
    attachments,
    timestamp: createTimestamp(),
    status: 'sent'
  };
  
  storage.messages.push(message);
  
  // Update conversation's last message
  conversation.last_message = {
    text: message.text,
    timestamp: message.timestamp,
    sender: message.sender_id
  };
  
  // Broadcast to other participants via WebSocket (handled in server.js)
  res.status(201).json({ message });
});

// Update message status (read, delivered, etc)
app.patch('/v1/messages/:id', (req, res) => {
  const { status } = req.body;
  const message = storage.messages.find(m => m.id === req.params.id);
  
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  message.status = status;
  res.json({ message });
});

// Delete a message
app.delete('/v1/messages/:id', (req, res) => {
  const index = storage.messages.findIndex(m => m.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  storage.messages.splice(index, 1);
  res.json({ success: true });
});

// ============================================
// TYPING INDICATORS
// ============================================

// Set typing status
app.post('/v1/conversations/:id/typing', (req, res) => {
  const { is_typing } = req.body;
  const conversationId = req.params.id;
  const userId = "U.001"; // Current user
  
  if (!storage.typing[conversationId]) {
    storage.typing[conversationId] = {};
  }
  
  if (is_typing) {
    storage.typing[conversationId][userId] = createTimestamp();
  } else {
    delete storage.typing[conversationId][userId];
  }
  
  res.json({ success: true });
});

// Get typing users for conversation
app.get('/v1/conversations/:id/typing', (req, res) => {
  const conversationId = req.params.id;
  const typingUsers = storage.typing[conversationId] || {};
  
  // Remove stale typing indicators (older than 5 seconds)
  const now = Date.now();
  Object.keys(typingUsers).forEach(userId => {
    if (now - new Date(typingUsers[userId]).getTime() > 5000) {
      delete typingUsers[userId];
    }
  });
  
  const userIds = Object.keys(typingUsers);
  res.json({ typing_users: userIds });
});

// ============================================
// SEARCH
// ============================================

// Search messages
app.get('/v1/search/messages', (req, res) => {
  const { q, conversation_id } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  let results = storage.messages.filter(m => 
    m.text && m.text.toLowerCase().includes(q.toLowerCase())
  );
  
  if (conversation_id) {
    results = results.filter(m => m.conversation_id === conversation_id);
  }
  
  // Sort by relevance (timestamp for now)
  results = results.sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  ).slice(0, 50);
  
  res.json({ messages: results });
});

// Export storage for WebSocket access
app.locals.storage = storage;

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 UBL Console API running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  });
}
