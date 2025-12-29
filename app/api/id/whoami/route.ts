import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { storage } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        sid: null,
        display_name: null,
        kind: null,
      });
    }

    const user = storage.getUser(session.userId, session.tenantId);

    return NextResponse.json({
      authenticated: session.authenticated,
      sid: session.userId,
      display_name: session.displayName,
      username: session.username,
      tenant_id: session.tenantId,
      kind: user?.status || 'offline',
    });
  } catch (error) {
    console.error('Whoami error:', error);
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
