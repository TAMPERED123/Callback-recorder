import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminSupabase } from '@/lib/server/supabase';
import { hashOwnerToken, getOwnerCookieName, normalizeShareCode } from '@/lib/ownership';

export async function GET(request: Request, { params }: { params: Promise<{ shareCode: string }> }) {
  try {
    const { shareCode } = await params;
    const normalizedShareCode = normalizeShareCode(shareCode);
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get(getOwnerCookieName(normalizedShareCode))?.value ?? null;

    const adminSupabase = getAdminSupabase();
    const { data: match, error } = await adminSupabase
      .from('Matches')
      .select('*')
      .eq('share_code', normalizedShareCode)
      .single();

    if (error || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const isHost = Boolean(match.creator && ownerToken && hashOwnerToken(ownerToken) === match.creator);
    return NextResponse.json({ isHost, match });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
