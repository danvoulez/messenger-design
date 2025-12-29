import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSessionFromRequest } from '@/lib/auth';

type Params = Promise<{ id: string }>;

export async function POST(request: Request, segmentData: { params: Params }) {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const conversation = storage.getConversation(params.id, session.tenantId);
  
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Verify user has access to this conversation
  if (!conversation.participants.includes(session.userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  storage.markConversationAsRead(params.id, session.tenantId);
  return NextResponse.json({ conversation });
}
