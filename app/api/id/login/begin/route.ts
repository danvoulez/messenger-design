import { NextResponse } from 'next/server';
import { generateAuthenticationChallenge } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, tenant_id } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const { challengeId, options } = await generateAuthenticationChallenge(
      username,
      tenant_id || 'T.UBL'
    );

    return NextResponse.json({
      challenge_id: challengeId,
      public_key: options,
    });
  } catch (error) {
    console.error('Login begin error:', error);
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
