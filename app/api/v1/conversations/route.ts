import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get conversations for this user in their tenant
  const conversations = storage.getConversations(session.tenantId, session.userId);
  
  // Sort by last message timestamp
  const sorted = [...conversations].sort((a, b) => {
    const aTime = a.last_message ? new Date(a.last_message.timestamp).getTime() : 0;
    const bTime = b.last_message ? new Date(b.last_message.timestamp).getTime() : 0;
    return bTime - aTime;
  });
  
  return NextResponse.json({ conversations: sorted });
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, name, participants } = await request.json();
  
  // Ensure the current user is in the participants list
  const allParticipants = participants.includes(session.userId)
    ? participants
    : [...participants, session.userId];
  
  const conversation = storage.createConversation({
    id: `conv_${Date.now()}`,
    type: type || 'direct',
    name,
    avatar_url: null,
    participants: allParticipants,
    unread_count: 0,
    created_at: new Date().toISOString(),
    tenantId: session.tenantId,
  });
  
  return NextResponse.json({ conversation }, { status: 201 });
}
