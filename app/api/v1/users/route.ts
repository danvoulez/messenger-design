import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  return NextResponse.json({ users: storage.users });
}
