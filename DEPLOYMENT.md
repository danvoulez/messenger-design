# Deployment Guide

## UBL Messenger - Next.js Application

This guide covers deployment options for the professional Next.js messenger application.

## Table of Contents
- [Vercel Deployment](#vercel-deployment)
- [Custom Server Deployment](#custom-server-deployment)
- [Environment Variables](#environment-variables)
- [WebSocket Considerations](#websocket-considerations)

## Vercel Deployment

### One-Click Deploy
The easiest way to deploy is using Vercel's one-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danvoulez/messenger-design)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to complete deployment.

### Important Note about WebSocket on Vercel

⚠️ **WebSocket limitations**: Vercel uses serverless functions that don't support long-lived WebSocket connections. The app will work for viewing the UI and sending messages via API calls, but real-time features (like instant message delivery and typing indicators) will not function.

**Solutions for real-time features on Vercel:**
1. **Use a separate WebSocket server** on a platform that supports persistent connections
2. **Implement polling** as a fallback mechanism
3. **Use a managed real-time service** like Pusher, Ably, or Socket.io Cloud

## Custom Server Deployment

For full WebSocket support, deploy to a platform that supports long-running Node.js servers:

### Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect your Node.js app
4. Deploy!

### Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Deploy!

### DigitalOcean App Platform

1. Create a new App on [DigitalOcean](https://www.digitalocean.com/products/app-platform)
2. Connect your GitHub repository
3. Deploy!

## Environment Variables

Create a `.env.local` file for development:

```bash
# Optional: Override default port
PORT=3000

# Optional: Set Node environment
NODE_ENV=production
```

## WebSocket Considerations

### Development
WebSocket works out of the box in development using the custom server (`server-nextjs.js`).

### Production with Custom Server
When deploying to platforms that support WebSocket (Railway, Render, DigitalOcean, etc.), the WebSocket connection will work automatically.

### Production on Vercel (Serverless)
For Vercel deployments, consider implementing polling or using a managed real-time service.

## Production Checklist

- [ ] Build succeeds: `npm run build`
- [ ] Choose deployment platform based on WebSocket needs
- [ ] Configure custom domain (optional)
- [ ] Test all features in production environment
- [ ] Implement authentication before public launch

---

**Note**: This is a demo application. Implement proper authentication, database persistence, and security measures before deploying to production.
