# Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy
1. Click the "Deploy to Vercel" button in README.md
2. Vercel will automatically detect the configuration
3. Deploy and get your live URL

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
cd messenger-design
vercel

# Follow prompts to link to your Vercel account
```

### Option 3: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Push changes to trigger automatic deployment
3. Vercel will build and deploy on every push

## Configuration

The `vercel.json` file is already configured:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

## Environment Variables

No environment variables are required for the demo version. The app uses in-memory storage.

For production, you may want to add:
- `NODE_ENV=production`
- Database connection strings
- Authentication secrets
- API keys for external services

## Post-Deployment

After deployment:
1. Visit your Vercel URL
2. The Admin Banner should activate automatically after 1 second
3. An approval card (L3 risk) will appear after 2 seconds
4. Test the approval flow

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000
```

## Project Structure

```
messenger-design/
├── api/
│   └── index.js          # Express API server
├── public/
│   └── index.html        # Frontend SPA
├── server.js             # Local dev server
├── package.json          # Dependencies
├── vercel.json           # Vercel config
└── README.md            # Documentation
```

## API Endpoints

All endpoints are available at `/api`:

- `GET  /health` - Health check
- `GET  /v1/participants` - List participants
- `POST /v1/cards/propose` - Propose action
- `GET  /v1/cards/:id` - Get card
- `POST /v1/policy/permit` - Request permit
- `POST /v1/commands/issue` - Issue command
- `GET  /v1/query/commands` - Query commands
- `POST /v1/exec.finish` - Finish execution
- `GET  /v1/receipts` - Get receipts
- `GET  /v1/allowlist` - Get allowlist
- `GET  /v1/policy/manifest` - Get policy manifest

## Features Verified

✅ WhatsApp-like dark theme UI
✅ Admin blue banner with TTL countdown
✅ Approval cards with risk badges (L0-L5)
✅ Hash display (policy_hash, subject_hash)
✅ Parameters toggle (Summary/JSON)
✅ Hold-to-approve for L3
✅ WebAuthn modal for L4/L5
✅ Toast notifications with clickable IDs
✅ Keyboard shortcuts (A, V, Escape)
✅ Result cards with artifacts and logs
✅ Participant management (humans + agents)
✅ Full API backend with Express.js
✅ Vercel deployment configuration

## Support

For issues or questions:
- Check the README.md for full documentation
- Review the problem statement for feature requirements
- Test API endpoints using curl or Postman

## Next Steps

To extend the application:
1. Add persistent storage (PostgreSQL, MongoDB)
2. Implement real WebAuthn authentication
3. Add WebSocket for real-time updates
4. Create dedicated views for Pending/Receipts
5. Implement quorum approval for L5
6. Add i18n translations
7. Create comprehensive test suite
