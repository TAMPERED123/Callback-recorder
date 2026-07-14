'use client';

import { useState } from "react";
import { type Match, type Player, type Round, type Score } from "@/lib/supabase";
import { calculateScore } from "@/lib/utils";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  match: Match;
  round: Round;
  shareCode: string;
  players: Player[];
  scores: Score[];
  onClose: () => void;
}

export default function EditRoundModal({ match, round, shareCode, players, scores, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [playerInputs, setPlayerInputs] = useState(
    players.map((p) => {
      const s = scores.find((score) => score.player_id === p.id);
      return {
        playerId: p.id,
        scoreId: s?.id,
        call: s ? s.call.toString() : "",
        score: s ? s.score.toString() : "",
        useRecalc: false,
        actual: "",
      };
    })
  );

  const updateInput = (index: number, field: string, value: string) => {
    const newInputs = [...playerInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };

    if ((field === "call" || field === "actual") && newInputs[index].useRecalc) {
      const c = parseInt(newInputs[index].call);
      const a = parseInt(newInputs[index].actual);
      if (!isNaN(c) && !isNaN(a)) {
        newInputs[index].score = calculateScore(c, a).toString();
      }
    }

    setPlayerInputs(newInputs);
  };

  const handleSave = async () => {
    setError("");

    for (let i = 0; i < playerInputs.length; i++) {
      const { call, score } = playerInputs[i];
      if (call === "" || score === "") {
        setError(`Please ensure call and score are provided for ${players[i].player_name}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateRound",
          payload: {
            matchId: match.id,
            roundId: round.id,
            playerInputs,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update round");

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update round");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Round {round.round_number}</h2>
            <p className="text-xs text-slate-500 font-medium">Update calls and final scores</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-[1fr_80px_80px] gap-2 items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
            <div>Player</div>
            <div className="text-center">Call</div>
            <div className="text-center">Final Score</div>
          </div>

          <div className="space-y-3">
            {players.map((p, i) => {
              const input = playerInputs[i];
              return (
                <div key={p.id} className="grid grid-cols-[1fr_80px_80px] gap-2 items-center p-2 rounded-xl border border-slate-100 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                  <div className="font-semibold text-slate-900 truncate pr-2">
                    {p.player_name}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="13"
                      value={input.call}
                      onChange={(e) => updateInput(i, "call", e.target.value)}
                      className="w-full h-10 text-center font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-lg shadow-sm"
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={input.score}
                      onChange={(e) => updateInput(i, "score", e.target.value)}
                      className={cn("w-full h-10 text-center font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-lg shadow-sm", parseInt(input.score) < 0 ? "text-red-500" : "text-indigo-600")}
                      placeholder="-"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-start gap-2 mt-4">
            <div className="text-indigo-500 mt-0.5">ℹ️</div>
            <p>
              Since actual tricks are not saved historically, you can directly correct the <b>Call</b> and resulting <b>Final Score</b> for this round.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-3 pb-safe">
          <button
            onClick={onClose}
            className="py-3 px-4 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="py-3 px-4 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Round"}
          </button>
        </div>
      </div>
    </div>
  );
}
