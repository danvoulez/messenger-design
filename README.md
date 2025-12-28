# Real-Time Messenger App

A WhatsApp-like messaging application with real-time communication, beautiful UI, and modern features.

## 🎯 What is this?

A real-time messaging application that allows users to send and receive messages instantly, just like WhatsApp. Built with Node.js, Express, WebSocket, and vanilla JavaScript with a beautiful dark theme UI.

## ✨ Features

- **Real-time messaging** via WebSocket
- **Multiple conversations** support (direct and group chats)
- **Message status** indicators (sent ✓, read ✓✓)
- **Typing indicators** to show when someone is typing
- **Unread message badges** to track new messages
- **Online/offline status** for users
- **Beautiful WhatsApp-like UI** with warm dark theme
- **Responsive design** that works on all devices
- **Emoji support** 🎉
- **Time formatting** (smart relative timestamps)

## 🚀 How to Use

### 1. Select a Conversation
Click on any conversation in the sidebar to open it and view the message history.

### 2. Send Messages
Type your message in the input field at the bottom and press Enter or click the send button.

### 3. Real-time Updates
Messages appear instantly for all participants in the conversation thanks to WebSocket connections.

## 📋 API Endpoints

```
GET  /api/health                              # Health check
GET  /api/v1/users                            # Get all users
GET  /api/v1/users/me                         # Get current user
PATCH /api/v1/users/me/status                 # Update user status

GET  /api/v1/conversations                    # List all conversations
GET  /api/v1/conversations/:id                # Get conversation details
POST /api/v1/conversations                    # Create new conversation
POST /api/v1/conversations/:id/read           # Mark conversation as read

GET  /api/v1/conversations/:id/messages       # Get messages in conversation
POST /api/v1/conversations/:id/messages       # Send a message
PATCH /api/v1/messages/:id                    # Update message status
DELETE /api/v1/messages/:id                   # Delete a message

POST /api/v1/conversations/:id/typing         # Send typing indicator
GET  /api/v1/conversations/:id/typing         # Get typing users

GET  /api/v1/search/messages                  # Search messages
```

## 🔌 WebSocket Events

The app uses WebSocket for real-time communication:

**Client → Server:**
- `authenticate` - Authenticate user session
- `message` - Broadcast new message to other users
- `typing` - Send typing indicator
- `read_receipt` - Send read receipt

**Server → Client:**
- `authenticated` - Confirmation of authentication
- `new_message` - Receive new message from another user
- `typing` - Receive typing indicator
- `read_receipt` - Receive read receipt

## 🔧 Development

### Prerequisites
- Node.js >= 18.x

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Demo Limitations

**Important:** This is a demo application with some limitations:

- **No Authentication**: All users are hardcoded. In production, implement proper authentication (JWT, OAuth, etc.)
- **In-Memory Storage**: Messages are stored in memory and will be lost on server restart. Use a database for production.
- **Single User**: The demo always sends messages as "Dan" (U.001). Multi-user support requires authentication.
- **No Persistence**: Conversation and message history is not persisted between sessions.

For production use, consider implementing:
- User authentication and session management
- Database storage (PostgreSQL, MongoDB, etc.)
- Rate limiting and abuse prevention
- Message encryption (end-to-end encryption)
- File upload and media handling
- Push notifications
- User presence tracking
- Message search and filtering

## 🚀 Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danvoulez/messenger-design)

### Manual Deploy
```bash
vercel
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **Real-time**: WebSocket (ws library)
- **Storage**: In-memory (demo only)

### Flow

```
User → WebSocket ← Server
         ↕
    REST API ← Database (in-memory)
```

1. **User sends message**: POST to `/api/v1/conversations/:id/messages`
2. **Server stores message**: In-memory storage
3. **Server broadcasts**: WebSocket sends to all connected clients
4. **Clients receive**: Update UI in real-time

## 🎨 Design Philosophy

**WhatsApp-inspired** because:
- Clean, familiar messaging interface
- Real-time updates with WebSocket
- Message status indicators (sent/read)
- Typing indicators for active conversations
- Unread badges for new messages
- Beautiful warm dark theme with terracotta accents
- Responsive and mobile-friendly
- Smooth animations and transitions
- Emoji support for expressive communication

## 📁 Project Structure

```
.
├── api/
│   └── index.js          # Express API server with REST endpoints
├── public/
│   └── index.html        # Frontend SPA with embedded CSS/JS
├── server.js             # WebSocket + HTTP server
├── package.json          # Dependencies
├── vercel.json           # Vercel deployment config
└── README.md             # This file
```

## 📝 License

MIT

---

Built with ❤️ as a real-time messaging demo
