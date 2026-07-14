import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-server';
import { generateShareCode } from '@/lib/utils';
export async function POST(req: Request) {
  try {
    const { matchName, players, ownerId } = await req.json();
    if (!matchName?.trim() || !Array.isArray(players) || players.length < 2 || !ownerId) return NextResponse.json({ error: 'Invalid match data' }, { status: 400 });
    const db = getAdminSupabase();
    let match: any = null;
    for (let i=0;i<8;i++) {
      const share_code = generateShareCode();
      const r = await db.from('Matches').insert({ match_name: matchName.trim(), status:'active', share_code, creator: ownerId }).select().single();
      if (!r.error) { match = r.data; break; }
      if (r.error.code !== '23505') throw r.error;
    }
    if (!match) throw new Error('Could not create a unique match code');
    const p = await db.from('Players').insert(players.map((name:string)=>({ match_id:match.id, player_name:name.trim() })));
    if (p.error) { await db.from('Matches').delete().eq('id', match.id); throw p.error; }
    return NextResponse.json({ shareCode: match.share_code });
  } catch (e:any) { return NextResponse.json({ error:e.message || 'Failed to create match' }, { status:500 }); }
}
