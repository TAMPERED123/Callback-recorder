import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getReadOnlySupabase } from '@/lib/server/supabase';
import { hashOwnerToken, getOwnerCookieName, normalizeShareCode } from '@/lib/ownership';

export async function GET(request: Request, { params }: { params: Promise<{ shareCode: string }> }) {
  try {
    const { shareCode } = await params;
    const normalizedShareCode = normalizeShareCode(shareCode);
    const cookieStore = await cookies();
    const ownerToken = cookieStore.get(getOwnerCookieName(normalizedShareCode))?.value ?? null;

    const readSupabase = getReadOnlySupabase();
    if (!readSupabase) {
      return NextResponse.json({ isHost: false, match: null, error: 'Supabase read configuration is missing.' });
    }

    const { data: match, error } = await readSupabase
      .from('Matches')
      .select('*')
      .eq('share_code', normalizedShareCode)
      .maybeSingle();

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
