import { NextResponse } from 'next/server';
import { storage, createTimestamp } from '@/lib/storage';

type Params = Promise<{ id: string }>;

export async function GET(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const before = searchParams.get('before');
  
  let messages = storage.messages.filter(m => m.conversation_id === params.id);
  
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
  const params = await segmentData.params;
  const { text, type = 'text', attachments = [] } = await request.json();
  
  const conversation = storage.conversations.find(c => c.id === params.id);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  
  // TODO: In production, extract sender_id from authenticated session/JWT token
  // Example: const userId = await auth.getUserId(request);
  // For demo purposes, hardcoding to U.001
  const message = {
    id: `msg_${Date.now()}`,
    conversation_id: params.id,
    sender_id: "U.001", // SECURITY: Replace with authenticated user ID in production
    text,
    type,
    attachments,
    timestamp: createTimestamp(),
    status: 'sent' as const
  };
  
  storage.messages.push(message);
  
  conversation.last_message = {
    text: message.text,
    timestamp: message.timestamp,
    sender: message.sender_id
  };
  
  return NextResponse.json({ message }, { status: 201 });
}
