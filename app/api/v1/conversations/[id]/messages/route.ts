import { NextResponse } from 'next/server';
import { storage, createTimestamp } from '@/lib/storage';
import { getSessionFromRequest } from '@/lib/auth';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const before = searchParams.get('before');
  
  // Verify user has access to this conversation
  const conversation = storage.getConversation(params.id, session.tenantId);
  if (!conversation || !conversation.participants.includes(session.userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let messages = storage.getMessages(params.id, session.tenantId, undefined);
  
  if (before) {
    messages = messages.filter(m => new Date(m.timestamp) < new Date(before));
  }
  
  messages = messages
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
    .reverse();
  
  return NextResponse.json({ messages });
}

export async function POST(request: Request, segmentData: { params: Params }) {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const { text, type = 'text', attachments = [] } = await request.json();
  
  const conversation = storage.getConversation(params.id, session.tenantId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Verify user has access to this conversation
  if (!conversation.participants.includes(session.userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Use authenticated user ID
  const message = storage.createMessage({
    id: `msg_${Date.now()}`,
    conversation_id: params.id,
    sender_id: session.userId,
    text,
    type,
    attachments,
    timestamp: createTimestamp(),
    status: 'sent' as const,
    tenantId: session.tenantId,
  });
  
  storage.updateConversationLastMessage(params.id, session.tenantId, {
    text: message.text,
    timestamp: message.timestamp,
    sender: message.sender_id,
  });

  // Increment unread count for other participants
  for (const participantId of conversation.participants) {
    if (participantId !== session.userId) {
      storage.incrementUnreadCount(params.id, session.tenantId);
      break; // Only increment once
    }
  }
  
  return NextResponse.json({ message }, { status: 201 });
}
