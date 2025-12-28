import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

type Params = Promise<{ id: string }>;

export async function POST(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const conversation = storage.conversations.find(c => c.id === params.id);
  
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  
  conversation.unread_count = 0;
  return NextResponse.json({ conversation });
}
