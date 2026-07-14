import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/server/supabase';
import { generateShareCode } from '@/lib/utils';
import { generateOwnerToken, hashOwnerToken, getOwnerCookieName } from '@/lib/ownership';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const matchName = String(body?.matchName || '').trim();
    const players = Array.isArray(body?.players) ? body.players.filter((item: unknown) => typeof item === 'string' && item.trim()) : [];

    if (!matchName) {
      return NextResponse.json({ error: 'Match name is required.' }, { status: 400 });
    }

    if (players.length < 2) {
      return NextResponse.json({ error: 'At least 2 players are required.' }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();
    const ownerToken = generateOwnerToken();
    const ownerHash = hashOwnerToken(ownerToken);

    let shareCode = generateShareCode();
    let match: any = null;
    let attempts = 0;

    while (attempts < 8) {
      const { data, error } = await adminSupabase
        .from('Matches')
        .insert({
          match_name: matchName,
          status: 'active',
          share_code: shareCode,
          creator: ownerHash,
        })
        .select()
        .single();

      if (!error && data) {
        match = data;
        break;
      }

      if (error?.code !== '23505') {
        throw error;
      }

      shareCode = generateShareCode();
      attempts += 1;
    }

    if (!match) {
      return NextResponse.json({ error: 'Could not create match' }, { status: 500 });
    }

    const playersToInsert = players.map((name: string) => ({
      match_id: match.id,
      player_name: name.trim(),
    }));

    const { error: playersError } = await adminSupabase.from('Players').insert(playersToInsert);
    if (playersError) throw playersError;

    const cookieStore = await cookies();
    cookieStore.set({
      name: getOwnerCookieName(shareCode),
      value: ownerToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ shareCode, matchId: match.id });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to create match' }, { status: 500 });
  }
}
