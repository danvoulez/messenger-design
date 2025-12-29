import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = storage.getUsers(session.tenantId);
  return NextResponse.json({ users });
}
