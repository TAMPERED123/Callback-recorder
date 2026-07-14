import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-server';
export async function POST(req: Request) {
 try {
  const b=await req.json(); const db=getAdminSupabase();
  const {data:m,error}=await db.from('Matches').select('id,creator').eq('id',b.matchId).single();
  if(error||!m) return NextResponse.json({error:'Match not found'},{status:404});
  if(!b.ownerId || m.creator!==b.ownerId) return NextResponse.json({error:'Owner access required'},{status:403});
  let r:any;
  if(b.action==='updateMatch') r=await db.from('Matches').update(b.values).eq('id',b.matchId);
  else if(b.action==='deleteMatch') r=await db.from('Matches').delete().eq('id',b.matchId);
  else if(b.action==='deleteRound') r=await db.from('Rounds').delete().eq('id',b.roundId).eq('match_id',b.matchId);
  else if(b.action==='addRound') {
    const rr=await db.from('Rounds').insert({match_id:b.matchId,round_number:b.roundNumber}).select().single(); if(rr.error) throw rr.error;
    r=await db.from('Scores').insert(b.scores.map((x:any)=>({...x,round_id:rr.data.id})));
    if(r.error) { await db.from('Rounds').delete().eq('id',rr.data.id); }
  }
  else if(b.action==='updateRound') {
    for (const x of b.scores) { const q=x.id ? db.from('Scores').update({call:x.call,score:x.score}).eq('id',x.id) : db.from('Scores').insert({player_id:x.player_id,round_id:b.roundId,call:x.call,score:x.score}); const qr=await q; if(qr.error) throw qr.error; }
    r={error:null};
  }
  else return NextResponse.json({error:'Unsupported action'},{status:400});
  if(r.error) throw r.error; return NextResponse.json({ok:true});
 } catch(e:any){return NextResponse.json({error:e.message||'Write failed'},{status:500});}
}
