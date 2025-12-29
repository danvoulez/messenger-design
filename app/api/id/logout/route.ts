import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (session) {
      // Update user status to offline
      storage.updateUserStatus(session.userId, session.tenantId, 'offline');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
