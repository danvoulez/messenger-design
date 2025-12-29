# Authentication Implementation Guide

## Overview

The UBL Messenger now implements **production-ready WebAuthn authentication** with **multi-tenant and multi-user support**. This replaces the previous demo hardcoded user system.

## Key Features

### ✅ Implemented Features

1. **WebAuthn Passwordless Authentication**
   - Passkey-based registration and login
   - Biometric authentication support (fingerprint, Face ID, etc.)
   - Hardware security key support
   - Phishing-resistant authentication

2. **Multi-Tenant Support**
   - Isolated data per tenant (default: `T.UBL`)
   - Tenant-scoped conversations, messages, and users
   - Tenant-aware WebSocket connections

3. **Multi-User Support**
   - Multiple users can register and authenticate
   - User sessions managed with JWT tokens
   - Each user has their own conversations and messages

4. **Session Management**
   - JWT-based session tokens (7-day expiration)
   - Secure token storage in localStorage
   - Session validation on all protected API endpoints
   - Automatic session refresh and validation

5. **Protected API Endpoints**
   - All `/api/v1/*` endpoints require authentication
   - Authorization header with Bearer token
   - 401 Unauthorized responses for invalid sessions

6. **Real-time Authentication**
   - WebSocket connections validate JWT tokens
   - Tenant-scoped message broadcasting
   - Authenticated user identification in real-time events

## API Endpoints

### Authentication Endpoints (`/api/id/*`)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/id/register/begin` | POST | Start passkey registration | `{ username, display_name, tenant_id? }` | `{ challenge_id, options }` |
| `/api/id/register/finish` | POST | Complete registration | `{ challenge_id, attestation, tenant_id? }` | `{ sid, session_token, user }` |
| `/api/id/login/begin` | POST | Start passkey login | `{ username, tenant_id? }` | `{ challenge_id, public_key }` |
| `/api/id/login/finish` | POST | Complete login | `{ challenge_id, credential, tenant_id? }` | `{ sid, session_token, user }` |
| `/api/id/whoami` | GET | Get current user info | Headers: `Authorization: Bearer <token>` | `{ authenticated, sid, display_name, username, tenant_id }` |
| `/api/id/logout` | POST | Logout user | Headers: `Authorization: Bearer <token>` | `{ ok: true }` |

### Protected Messenger Endpoints

All `/api/v1/*` endpoints now require authentication via the `Authorization: Bearer <token>` header.

- `/api/v1/users` - List users in tenant
- `/api/v1/users/me` - Get current authenticated user
- `/api/v1/conversations` - List/create conversations
- `/api/v1/conversations/:id/messages` - Get/send messages
- `/api/v1/conversations/:id/read` - Mark conversation as read

## Architecture

### Authentication Flow

```
User visits / → Not authenticated → Redirect to /login
User registers/logs in with passkey → JWT token generated → Stored in localStorage
Subsequent requests include Authorization header → Token validated → Access granted
```

### Data Isolation

**Tenant-Scoped:**
- Users (each user belongs to a tenant)
- Conversations (tenant-isolated)
- Messages (tenant-isolated)
- WebSocket connections (tenant-scoped broadcasting)

### Storage Structure

```typescript
// lib/storage.ts - Multi-tenant storage
storage = {
  users: TenantUser[]        // { id, username, display_name, tenantId, ... }
  conversations: TenantConversation[]  // { id, participants, tenantId, ... }
  messages: TenantMessage[]  // { id, sender_id, tenantId, ... }
}
```

### Security Features

1. **JWT Token Security**
   - HS256 signing algorithm
   - 7-day expiration
   - Secure secret key (configurable via environment)

2. **WebAuthn Security**
   - Challenge-based authentication
   - 5-minute challenge expiration
   - Credential counter validation
   - Origin and RP ID verification

3. **Authorization Checks**
   - Session validation on every protected endpoint
   - Conversation participant verification
   - Tenant isolation enforcement

## Environment Variables

```bash
# Authentication Configuration
JWT_SECRET=your-secret-key-change-in-production
RP_NAME=UBL Messenger
RP_ID=localhost  # Change to your domain in production
ORIGIN=http://localhost:3000  # Change to your production URL
```

## Usage

### User Registration

1. Navigate to `/login`
2. Click "Register" tab
3. Enter username and display name
4. Click "Create Passkey"
5. Follow browser's WebAuthn prompt (biometric/security key)
6. Automatically logged in on success

### User Login

1. Navigate to `/login`
2. Click "Sign In" tab
3. Enter username
4. Click "Sign in with Passkey"
5. Follow browser's WebAuthn prompt
6. Redirected to messenger on success

### Logout

1. Click the logout button (door icon) in the sidebar
2. Session cleared and redirected to login

## Frontend Integration

### Auth Context

```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user.displayName}</div>;
}
```

### Protected API Calls

```typescript
const token = localStorage.getItem('ubl_session_token');
const response = await fetch('/api/v1/conversations', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### WebSocket Authentication

```typescript
const token = localStorage.getItem('ubl_session_token');
websocket.send(JSON.stringify({
  type: 'authenticate',
  userId: user.id,
  token: token,
}));
```

## Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Register a new user with passkey
4. Send messages as that user
5. Open incognito window
6. Register another user
7. Both users can now chat in real-time

### Multi-Tenant Testing

Currently, all users default to tenant `T.UBL`. To test multi-tenancy:

1. Modify registration request to include different `tenant_id`
2. Users in different tenants cannot see each other's data
3. WebSocket messages are scoped to tenant

## Production Deployment

### Required Changes

1. **Set strong JWT secret:**
   ```bash
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Configure WebAuthn for your domain:**
   ```bash
   RP_ID=yourdomain.com
   ORIGIN=https://yourdomain.com
   ```

3. **Enable HTTPS** (required for WebAuthn)

4. **Database Integration**
   - Replace in-memory storage with PostgreSQL/MongoDB
   - Store user credentials in database
   - Store challenges in Redis for expiration

5. **Session Management**
   - Consider using HTTP-only cookies instead of localStorage
   - Implement refresh token rotation
   - Add rate limiting

### Security Recommendations

- ✅ WebAuthn provides phishing-resistant authentication
- ✅ JWT tokens expire after 7 days
- ✅ Challenges expire after 5 minutes
- ⚠️ Store JWT secret securely (use environment variables)
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for auth endpoints
- ⚠️ Add CSRF protection
- ⚠️ Consider using HTTP-only cookies for token storage

## Migration from Demo

### Breaking Changes

- **Removed hardcoded `U.001` user**
- All endpoints now require authentication
- WebSocket connections require JWT token
- No demo mode fallback

### Migration Steps

1. All users must register new accounts
2. Previous demo conversations/messages are cleared
3. Update API client to include Authorization header
4. Update WebSocket connection to include token

## Troubleshooting

### WebAuthn Not Working

- Ensure you're on HTTPS (or localhost for development)
- Check browser supports WebAuthn
- Verify RP_ID matches your domain
- Check browser console for errors

### 401 Unauthorized Errors

- Token may be expired (re-login)
- Token not included in request headers
- Check localStorage for `ubl_session_token`

### Users Can't See Each Other's Messages

- Verify both users in same tenant
- Check WebSocket connection authenticated
- Ensure messages include correct conversation participants

## Future Enhancements

- [ ] Password fallback authentication
- [ ] Social login (OAuth)
- [ ] Two-factor authentication
- [ ] Session management UI (view active sessions)
- [ ] Passkey management (add/remove passkeys)
- [ ] Email verification
- [ ] Password reset flow
- [ ] User profile editing
- [ ] Account deletion

## Support

For issues or questions:
- Check browser console for errors
- Verify WebAuthn support in browser
- Ensure HTTPS enabled (production)
- Check JWT secret is set correctly
