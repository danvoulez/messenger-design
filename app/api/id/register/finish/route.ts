import { NextResponse } from 'next/server';
import { verifyRegistrationChallenge } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { challenge_id, attestation, tenant_id } = await request.json();

    if (!challenge_id || !attestation) {
      return NextResponse.json(
        { error: 'challenge_id and attestation are required' },
        { status: 400 }
      );
    }

    const { session, token } = await verifyRegistrationChallenge(
      challenge_id,
      attestation,
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
    console.error('Registration finish error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
