import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  const user = storage.users.find(u => u.id === "U.001");
  return NextResponse.json({ user });
}
