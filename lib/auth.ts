import { SignJWT, jwtVerify } from 'jose';
import { 
  generateAuthenticationOptions, 
  generateRegistrationOptions, 
  verifyAuthenticationResponse, 
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON
} from '@simplewebauthn/server';
import { storage } from './storage';

// Environment configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ubl-messenger-secret-key-change-in-production'
);

const RP_NAME = process.env.RP_NAME || 'UBL Messenger';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

export interface Session {
  userId: string;
  tenantId: string;
  username: string;
  displayName: string;
  authenticated: boolean;
}

export interface Challenge {
  id: string;
  userId?: string;
  username: string;
  challenge: string;
  createdAt: number;
}

// Store for WebAuthn challenges (in production, use Redis or database)
const challenges = new Map<string, Challenge>();

// Store for user credentials (in production, use database)
interface StoredCredential {
  id: string;
  publicKey: Uint8Array;
  counter: number;
  transports?: AuthenticatorTransport[];
}

const userCredentials = new Map<string, StoredCredential[]>();

/**
 * Create a JWT session token
 */
export async function createSessionToken(session: Session): Promise<string> {
  const token = await new SignJWT({
    userId: session.userId,
    tenantId: session.tenantId,
    username: session.username,
    displayName: session.displayName,
    authenticated: session.authenticated,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      tenantId: payload.tenantId as string,
      username: payload.username as string,
      displayName: payload.displayName as string,
      authenticated: payload.authenticated as boolean,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract session from request headers
 */
export async function getSessionFromRequest(request: Request): Promise<Session | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifySessionToken(token);
}

/**
 * Generate registration options for WebAuthn
 */
export async function generateRegistrationChallenge(
  username: string,
  displayName: string,
  tenantId: string = 'T.UBL'
): Promise<{ challengeId: string; options: Record<string, unknown> }> {
  // Check if user already exists
  const existingUser = storage.getUserByUsername(username, tenantId);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: username,
    userDisplayName: displayName,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
  });

  // Store challenge
  challenges.set(challengeId, {
    id: challengeId,
    username,
    challenge: options.challenge,
    createdAt: Date.now(),
  });

  // Clean up old challenges (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [id, challenge] of challenges.entries()) {
    if (challenge.createdAt < fiveMinutesAgo) {
      challenges.delete(id);
    }
  }

  return { challengeId, options };
}

/**
 * Verify registration response and create user
 */
export async function verifyRegistrationChallenge(
  challengeId: string,
  attestation: RegistrationResponseJSON,
  tenantId: string = 'T.UBL'
): Promise<{ session: Session; token: string }> {
  const challenge = challenges.get(challengeId);
  if (!challenge) {
    throw new Error('Challenge not found or expired');
  }

  const verification = await verifyRegistrationResponse({
    response: attestation,
    expectedChallenge: challenge.challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed');
  }

  // Create user
  const userId = `U.${Date.now().toString(36).toUpperCase()}`;
  const user = storage.createUser({
    id: userId,
    username: challenge.username,
    display_name: challenge.username,
    tenantId,
    avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${challenge.username}&backgroundColor=f5f5f5`,
    status: 'online',
  });

  // Store credential
  const { credential } = verification.registrationInfo;
  const credentials = userCredentials.get(userId) || [];
  credentials.push({
    id: Buffer.from(credential.id).toString('base64'),
    publicKey: credential.publicKey,
    counter: credential.counter,
  });
  userCredentials.set(userId, credentials);

  // Clean up challenge
  challenges.delete(challengeId);

  // Create session
  const session: Session = {
    userId: user.id,
    tenantId,
    username: user.username,
    displayName: user.display_name,
    authenticated: true,
  };

  const token = await createSessionToken(session);

  return { session, token };
}

/**
 * Generate authentication options for WebAuthn
 */
export async function generateAuthenticationChallenge(
  username: string,
  tenantId: string = 'T.UBL'
): Promise<{ challengeId: string; options: Record<string, unknown> }> {
  // Check if user exists
  const user = storage.getUserByUsername(username, tenantId);
  if (!user) {
    throw new Error('User not found');
  }

  const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Get user's credentials
  const credentials = userCredentials.get(user.id) || [];
  const allowCredentials = credentials.map((cred) => ({
    id: cred.id,
    transports: cred.transports,
  }));

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials,
    userVerification: 'preferred',
  });

  // Store challenge
  challenges.set(challengeId, {
    id: challengeId,
    userId: user.id,
    username,
    challenge: options.challenge,
    createdAt: Date.now(),
  });

  return { challengeId, options };
}

/**
 * Verify authentication response
 */
export async function verifyAuthenticationChallenge(
  challengeId: string,
  credential: AuthenticationResponseJSON,
  tenantId: string = 'T.UBL'
): Promise<{ session: Session; token: string }> {
  const challenge = challenges.get(challengeId);
  if (!challenge || !challenge.userId) {
    throw new Error('Challenge not found or expired');
  }

  const user = storage.getUser(challenge.userId, tenantId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get stored credential
  const credentials = userCredentials.get(challenge.userId) || [];
  const credentialId = credential.id;
  const storedCredential = credentials.find((c) => c.id === credentialId);

  if (!storedCredential) {
    throw new Error('Credential not found');
  }

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: challenge.challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: storedCredential.id,
      publicKey: new Uint8Array(storedCredential.publicKey),
      counter: storedCredential.counter,
    },
  });

  if (!verification.verified) {
    throw new Error('Authentication verification failed');
  }

  // Update counter
  storedCredential.counter = verification.authenticationInfo.newCounter;

  // Clean up challenge
  challenges.delete(challengeId);

  // Update user status
  storage.updateUserStatus(user.id, tenantId, 'online');

  // Create session
  const session: Session = {
    userId: user.id,
    tenantId,
    username: user.username,
    displayName: user.display_name,
    authenticated: true,
  };

  const token = await createSessionToken(session);

  return { session, token };
}
