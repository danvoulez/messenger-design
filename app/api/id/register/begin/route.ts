import { NextResponse } from 'next/server';
import { generateRegistrationChallenge } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, display_name, tenant_id } = await request.json();

    if (!username || !display_name) {
      return NextResponse.json(
        { error: 'Username and display_name are required' },
        { status: 400 }
      );
    }

    const { challengeId, options } = await generateRegistrationChallenge(
      username,
      display_name,
      tenant_id || 'T.UBL'
    );

    return NextResponse.json({
      challenge_id: challengeId,
      options,
    });
  } catch (error) {
    console.error('Registration begin error:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
