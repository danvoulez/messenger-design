import { NextResponse } from 'next/server';
import { verifyAuthenticationChallenge } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { challenge_id, credential, tenant_id } = await request.json();

    if (!challenge_id || !credential) {
      return NextResponse.json(
        { error: 'challenge_id and credential are required' },
        { status: 400 }
      );
    }

    const { session, token } = await verifyAuthenticationChallenge(
      challenge_id,
      credential,
      tenant_id || 'T.UBL'
    );

    return NextResponse.json({
      sid: session.userId,
      session_token: token,
      user: {
        id: session.userId,
        username: session.username,
        display_name: session.displayName,
        tenant_id: session.tenantId,
      },
    });
  } catch (error) {
    console.error('Login finish error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
