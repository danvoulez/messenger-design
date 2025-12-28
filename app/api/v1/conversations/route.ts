import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  // Sort by last message timestamp
  const sorted = [...storage.conversations].sort((a, b) => {
    const aTime = a.last_message ? new Date(a.last_message.timestamp).getTime() : 0;
    const bTime = b.last_message ? new Date(b.last_message.timestamp).getTime() : 0;
    return bTime - aTime;
  });
  
  return NextResponse.json({ conversations: sorted });
}

export async function POST(request: Request) {
  const { type, name, participants } = await request.json();
  
  const conversation = {
    id: `conv_${Date.now()}`,
    type: type || 'direct',
    name,
    avatar_url: null,
    participants,
    unread_count: 0,
    created_at: new Date().toISOString()
  };
  
  storage.conversations.push(conversation);
  return NextResponse.json({ conversation }, { status: 201 });
}
