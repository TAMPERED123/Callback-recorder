'use client';

import { useEffect, useState, use, useCallback } from "react";
import { supabase, type Match, type Player, type Round, type Score } from "@/lib/supabase";
import { calculatePlayerTotal } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Copy, Check, MoreVertical, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AddRoundModal from "./AddRoundModal";
import EditRoundModal from "./EditRoundModal";
import MatchSettingsModal from "./MatchSettingsModal";
import { buildShareText } from "@/lib/ownership";

export default function MatchPage({ params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode: rawShareCode } = use(params);
  const shareCode = decodeURIComponent(rawShareCode).trim().toUpperCase();
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Modal states
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const statusData = await response.json().catch(() => ({}));
      setIsHost(Boolean(statusData?.isHost));

      const { data: matchData, error: matchError } = await supabase
        .from('Matches')
        .select('*')
        .eq('share_code', shareCode)
        .single();

      if (matchError || !matchData) throw new Error("Match not found");
      setMatch(matchData);

      // 2. Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('Players')
        .select('*')
        .eq('match_id', matchData.id)
        .order('id', { ascending: true });
      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // 3. Fetch rounds
      const { data: roundsData, error: roundsError } = await supabase
        .from('Rounds')
        .select('*')
        .eq('match_id', matchData.id)
        .order('round_number', { ascending: true });
      if (roundsError) throw roundsError;
      setRounds(roundsData || []);

      // 4. Fetch scores using the player ids
      if (playersData && playersData.length > 0) {
        const playerIds = playersData.map(p => p.id);
        const { data: scoresData, error: scoresError } = await supabase
          .from('Scores')
          .select('*')
          .in('player_id', playerIds);
        if (scoresError) throw scoresError;
        setScores(scoresData || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };

    void loadData();

    const channel = supabase.channel(`match_${shareCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Matches' }, payload => {
        if (payload.new && (payload.new as Match).share_code === shareCode) {
          setMatch(payload.new as Match);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Players' }, () => {
        void fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Rounds' }, () => {
        void fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Scores' }, () => {
        void fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, shareCode]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(match?.share_code || shareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      window.prompt("Copy this share code:", match?.share_code || shareCode);
    }
  };

  const copyMatchCode = async () => {
    try {
      await navigator.clipboard.writeText(match?.share_code || shareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      window.prompt("Copy this share code:", match?.share_code || shareCode);
    }
  };

  const deleteRound = async (roundId: number) => {
    if (!confirm("Are you sure you want to delete this round?")) return;
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteRound", payload: { roundId } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete round");
    } catch (err: any) {
      alert("Failed to delete round: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-md mx-auto p-8 text-center mt-20">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Match Not Found</h2>
        <p className="text-slate-500 mb-6">{error || "The match you are looking for does not exist."}</p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  // Calculate totals
  const playerTotals = players.map(p => {
    const playerScores = scores.filter(s => s.player_id === p.id);
    return calculatePlayerTotal(playerScores);
  });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/history" className="p-2 hover:bg-slate-200 rounded-full transition-colors hidden md:block">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{match.match_name}</h1>
              {match.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
              <span className={cn(match.status === 'active' ? "text-emerald-600" : "text-slate-500")}>
                Status: {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
              <span>•</span>
              <span>{players.length} Players</span>
              <span>•</span>
              <span>Round {rounds.length}</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <span className="text-slate-500">Match Code:</span>
              <span className="font-mono font-semibold tracking-wider text-slate-900">{match.share_code}</span>
              <button onClick={copyMatchCode} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-700" title="Copy match code">
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-2 text-sm text-slate-500 bg-slate-50 border-r border-slate-200">
              Code
            </div>
            <div className="px-4 py-2 font-mono font-bold text-slate-900 tracking-wider">
              {match.share_code}
            </div>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-slate-100 transition-colors border-l border-slate-200 text-slate-500"
              title="Copy code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={async () => {
              const matchUrl = `${window.location.origin}/match/${encodeURIComponent(match.share_code)}`;
              const shareData = {
                title: match.match_name,
                text: buildShareText(match.match_name, match.share_code, matchUrl),
                url: matchUrl,
              };

              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                  return;
                }
                await navigator.clipboard.writeText(buildShareText(match.match_name, match.share_code, matchUrl));
                alert("Match details copied to clipboard!");
              } catch (err: any) {
                if (err?.name === "AbortError") return;
                try {
                  await navigator.clipboard.writeText(buildShareText(match.match_name, match.share_code, matchUrl));
                  alert("Match details copied to clipboard!");
                } catch {
                  window.prompt("Copy this match details:", buildShareText(match.match_name, match.share_code, matchUrl));
                }
              }
            }}
            className="flex items-center gap-2 bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-800 transition-colors shadow-sm"
          >
            Share
          </button>

          {isHost && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Score Sheet */}
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden relative">
        <div className="p-4 bg-indigo-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="text-xl">♠</span>
            <span className="text-red-400 text-xl">♥</span>
            <span className="font-semibold tracking-wide ml-1">Score Sheet</span>
          </div>
          {match.status === 'active' && isHost && (
            <button
              onClick={() => setIsAddRoundOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Round
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[600px]">
            <thead className="sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-4 px-3 bg-indigo-900 text-indigo-100 border-b border-indigo-800 w-20 font-medium text-sm">
                  Round
                </th>
                {players.map(p => (
                  <th key={p.id} className="py-4 px-3 bg-indigo-900 text-white border-b border-indigo-800 font-bold uppercase tracking-wide min-w-[100px]">
                    {p.player_name}
                  </th>
                ))}
                <th className="py-4 px-3 bg-indigo-900 text-indigo-100 border-b border-indigo-800 w-24">
                  {/* Actions */}
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y divide-slate-100 font-medium">
              {rounds.length === 0 ? (
                <tr>
                  <td colSpan={players.length + 2} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                      <div className="text-4xl">📝</div>
                      <p>No rounds yet. Add the first round to start scoring.</p>
                      {match.status === 'active' && isHost && (
                        <button
                          onClick={() => setIsAddRoundOpen(true)}
                          className="mt-2 text-indigo-600 font-semibold hover:underline"
                        >
                          + Add Round
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rounds.map((round, index) => (
                  <tr key={round.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-3 text-slate-400 border-r border-slate-100">
                      {index + 1}
                    </td>
                    {players.map(p => {
                      const scoreRecord = scores.find(s => s.round_id === round.id && s.player_id === p.id);
                      const scoreValue = scoreRecord ? scoreRecord.score : 0;
                      return (
                        <td key={p.id} className={cn("py-4 px-3 border-r border-slate-100 text-lg", scoreValue < 0 ? "text-red-500" : "text-slate-900")}>
                          {scoreValue}
                        </td>
                      );
                    })}
                    <td className="py-4 px-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {match.status === 'active' && isHost && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setEditingRound(round)} className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteRound(round.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-indigo-50/50 border-t-2 border-indigo-100">
              <tr>
                <td className="py-5 px-3 font-bold text-slate-500 uppercase tracking-wider text-sm border-r border-indigo-100">
                  TOTAL
                </td>
                {playerTotals.map((total, i) => (
                  <td key={i} className={cn("py-5 px-3 font-bold text-xl border-r border-indigo-100", total < 0 ? "text-red-600" : "text-indigo-700")}>
                    {total}
                  </td>
                ))}
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {isAddRoundOpen && isHost && (
        <AddRoundModal
          match={match}
          shareCode={shareCode}
          players={players}
          nextRoundNumber={rounds.length + 1}
          onClose={() => setIsAddRoundOpen(false)}
        />
      )}

      {editingRound && isHost && (
        <EditRoundModal
          match={match}
          round={editingRound}
          shareCode={shareCode}
          players={players}
          scores={scores.filter((score) => score.round_id === editingRound.id)}
          onClose={() => setEditingRound(null)}
        />
      )}

      {isSettingsOpen && isHost && (
        <MatchSettingsModal
          match={match}
          shareCode={shareCode}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
