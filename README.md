# Professional Real-Time Messenger App

A professional WhatsApp-like messaging application built with **Next.js 15**, **React 19**, **TypeScript**, and **WebSocket** for real-time communication. Features a beautiful dark theme UI with warm terracotta accents.

## 🎯 What is this?

A production-ready real-time messaging application that allows users to send and receive messages instantly. Built with modern web technologies including Next.js, React, TypeScript, and WebSocket, with a beautiful responsive UI powered by Tailwind CSS.

## ✨ Features

- **Real-time messaging** via WebSocket
- **Multiple conversations** support (direct and group chats)
- **Message status** indicators (sent ✓, read ✓✓)
- **Typing indicators** to show when someone is typing
- **Unread message badges** to track new messages
- **Online/offline status** for users
- **Beautiful WhatsApp-like UI** with warm dark theme
- **Fully responsive design** that works on all devices
- **TypeScript** for type safety and better developer experience
- **Modern React** with hooks and functional components
- **SWR** for efficient data fetching and caching
- **Tailwind CSS** for utility-first styling
- **Professional component architecture** with separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Real-time**: WebSocket (ws library with custom server)
- **Data Fetching**: SWR for client-side data fetching
- **State Management**: React hooks (useState, useEffect)
- **Storage**: In-memory (demo only - use a database for production)

### Project Structure

```
.
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── health/            # Health check endpoint
│   │   └── v1/                # Versioned API endpoints
│   │       ├── conversations/ # Conversation endpoints
│   │       └── users/         # User endpoints
│   ├── globals.css            # Global styles with Tailwind
│   ├── layout.tsx             # Root layout component
│   └── page.tsx               # Main messenger page
├── components/
│   └── chat/                  # Chat-related components
│       ├── Sidebar.tsx        # Conversation list sidebar
│       └── ChatArea.tsx       # Main chat interface
├── lib/
│   └── storage.ts             # In-memory data storage
├── types/
│   └── index.ts               # TypeScript type definitions
├── server-nextjs.js           # Custom server with WebSocket
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## 📋 API Endpoints

```
GET  /api/health                              # Health check
GET  /api/v1/users                            # Get all users
GET  /api/v1/users/me                         # Get current user

GET  /api/v1/conversations                    # List all conversations
POST /api/v1/conversations                    # Create new conversation
POST /api/v1/conversations/:id/read           # Mark conversation as read

GET  /api/v1/conversations/:id/messages       # Get messages in conversation
POST /api/v1/conversations/:id/messages       # Send a message
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

## 🎨 Design Philosophy

**Professional & Modern** because:
- Built with Next.js and React for production-ready code
- TypeScript for type safety and maintainability
- Component-based architecture for reusability
- Tailwind CSS for consistent, responsive design
- SWR for efficient data fetching
- Clean code structure following best practices
- Real-time updates with WebSocket
- Beautiful warm dark theme with terracotta accents
- Smooth animations and transitions
- Mobile-first responsive design

## ⚠️ Demo Limitations

**Important:** This is a demo application with some limitations:

- **No Authentication**: All users are hardcoded. In production, implement proper authentication (JWT, OAuth, etc.)
- **In-Memory Storage**: Data is stored in memory and will be lost on server restart. Use a database for production.
- **Single User**: The demo always sends messages as "Dan" (U.001). Multi-user support requires authentication.
- **No Persistence**: Conversation and message history is not persisted between sessions.
- **WebSocket on Vercel**: Vercel doesn't support WebSockets in serverless functions. For production deployment with real-time features, consider:
  - Using a separate WebSocket server (e.g., on Railway, Render, or AWS)
  - Implementing polling as a fallback
  - Using a managed real-time service (e.g., Pusher, Ably, or Socket.io with external hosting)

### For Production Use

Consider implementing:
- User authentication and session management
- Database storage (PostgreSQL, MongoDB, etc.)
- Rate limiting and abuse prevention
- Message encryption (end-to-end encryption)
- File upload and media handling
- Push notifications
- User presence tracking
- Message search and filtering
- Email notifications
- Backup and recovery
- Monitoring and logging
- Security best practices (HTTPS, CSP, etc.)

## 🚀 Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danvoulez/messenger-design)

### Manual Deploy
```bash
vercel
```

**Note:** WebSocket functionality will not work on Vercel's serverless environment. The app will work for viewing the UI, but real-time messaging requires a separate WebSocket server or alternative implementation.

## 🔧 Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Environment Variables

For production deployment, you may want to set:
- `NODE_ENV=production` - Set environment to production
- `PORT=3000` - Set server port (default: 3000)

## 📝 License

MIT

---

Built with ❤️ using Next.js, React, TypeScript, and WebSocket

**From Demo to Production-Ready**
This project has been migrated from a vanilla JavaScript demo to a professional Next.js application with modern architecture, type safety, and best practices.
