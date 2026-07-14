import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminSupabase } from '@/lib/server/supabase';
import { hashOwnerToken, getOwnerCookieName, normalizeShareCode } from '@/lib/ownership';

async function getMatchAndVerifyOwner(shareCode: string) {
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
    throw new Error('Match not found');
  }

  if (!match.creator) {
    throw new Error('This match is not owned by a host token');
  }

  const ownerHash = ownerToken ? hashOwnerToken(ownerToken) : null;
  const isHost = Boolean(ownerHash && ownerHash === match.creator);

  return { match, isHost };
}

export async function POST(request: Request, { params }: { params: Promise<{ shareCode: string }> }) {
  try {
    const { shareCode } = await params;
    const body = await request.json();
    const { action, payload } = body || {};

    const { match, isHost } = await getMatchAndVerifyOwner(shareCode);

    if (!isHost) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = getAdminSupabase();

    switch (action) {
      case 'addRound': {
        const { nextRoundNumber, playerInputs } = payload || {};
        const { data: roundData, error: roundError } = await adminSupabase
          .from('Rounds')
          .insert({
            match_id: match.id,
            round_number: nextRoundNumber,
          })
          .select()
          .single();

        if (roundError || !roundData) throw roundError || new Error('Could not create round');

        const scoresToInsert = (playerInputs || []).map((input: any) => {
          const callNum = parseInt(input.call, 10);
          const actualNum = parseInt(input.actual, 10);
          return {
            player_id: input.playerId,
            round_id: roundData.id,
            call: callNum,
            score: callNum >= actualNum ? (callNum * 10) + (actualNum - callNum) : -(callNum * 10),
          };
        });

        const { error: scoresError } = await adminSupabase.from('Scores').insert(scoresToInsert);
        if (scoresError) throw scoresError;
        break;
      }
      case 'updateRound': {
        const { roundId, playerInputs } = payload || {};
        const updates = (playerInputs || []).map((input: any) => {
          if (input.scoreId) {
            return adminSupabase
              .from('Scores')
              .update({
                call: parseInt(input.call, 10),
                score: parseInt(input.score, 10),
              })
              .eq('id', input.scoreId);
          }

          return adminSupabase.from('Scores').insert({
            player_id: input.playerId,
            round_id: roundId,
            call: parseInt(input.call, 10),
            score: parseInt(input.score, 10),
          });
        });

        await Promise.all(updates);
        break;
      }
      case 'updateMatch': {
        const { matchName, status } = payload || {};
        const patch: Record<string, unknown> = {};
        if (typeof matchName === 'string' && matchName.trim()) patch.match_name = matchName.trim();
        if (typeof status === 'string') patch.status = status;
        const { error } = await adminSupabase.from('Matches').update(patch).eq('id', match.id);
        if (error) throw error;
        break;
      }
      case 'deleteRound': {
        const { roundId } = payload || {};
        const { error } = await adminSupabase.from('Rounds').delete().eq('id', roundId);
        if (error) throw error;
        break;
      }
      case 'deleteMatch': {
        const { error } = await adminSupabase.from('Matches').delete().eq('id', match.id);
        if (error) throw error;
        break;
      }
      default:
        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error(error);
    const message = error?.message || 'Unauthorized';
    const status = message === 'Match not found' ? 404 : message === 'Forbidden' ? 403 : message.includes('Missing Supabase service role configuration') ? 503 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
