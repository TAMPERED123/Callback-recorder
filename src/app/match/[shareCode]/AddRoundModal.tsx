'use client';

import { useState } from "react";
import { type Match, type Player } from "@/lib/supabase";
import { calculateScore } from "@/lib/utils";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  match: Match;
  shareCode: string;
  players: Player[];
  nextRoundNumber: number;
  onClose: () => void;
}

export default function AddRoundModal({ match, shareCode, players, nextRoundNumber, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [playerInputs, setPlayerInputs] = useState(
    players.map((p) => ({
      playerId: p.id,
      call: "",
      actual: "",
    }))
  );

  const updateInput = (index: number, field: "call" | "actual", value: string) => {
    const newInputs = [...playerInputs];
    newInputs[index][field] = value;
    setPlayerInputs(newInputs);
  };

  const handleSave = async () => {
    setError("");

    for (let i = 0; i < playerInputs.length; i++) {
      const { call, actual } = playerInputs[i];
      if (call === "" || actual === "") {
        setError(`Please enter both call and actual tricks for ${players[i].player_name}`);
        return;
      }
      const c = parseInt(call);
      const a = parseInt(actual);
      if (isNaN(c) || isNaN(a) || c < 0 || a < 0 || c > 13 || a > 13) {
        setError(`Invalid numbers for ${players[i].player_name}. Calls and tricks must be between 0 and 13.`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addRound",
          payload: {
            matchId: match.id,
            nextRoundNumber,
            playerInputs,
          },
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to save round");

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save round");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Add Round</h2>
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

          <div className="grid grid-cols-[1fr_70px_70px_60px] gap-2 items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
            <div>Player</div>
            <div className="text-center">Call</div>
            <div className="text-center">Actual</div>
            <div className="text-right">Score</div>
          </div>

          <div className="space-y-3">
            {players.map((p, i) => {
              const input = playerInputs[i];
              const callNum = parseInt(input.call);
              const actualNum = parseInt(input.actual);
              const hasValidInput = !isNaN(callNum) && !isNaN(actualNum);
              const previewScore = hasValidInput ? calculateScore(callNum, actualNum) : null;

              return (
                <div key={p.id} className="grid grid-cols-[1fr_70px_70px_60px] gap-2 items-center p-2 rounded-xl border border-slate-100 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
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
                      min="0"
                      max="13"
                      value={input.actual}
                      onChange={(e) => updateInput(i, "actual", e.target.value)}
                      className="w-full h-10 text-center font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 text-lg shadow-sm"
                      placeholder="-"
                    />
                  </div>
                  <div className={cn("text-right font-bold text-lg", previewScore !== null ? (previewScore < 0 ? "text-red-500" : "text-indigo-600") : "text-slate-300")}>
                    {previewScore !== null ? previewScore : "--"}
                  </div>
                </div>
              );
            })}
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
            {loading ? "Saving..." : "Save Round"}
          </button>
        </div>
      </div>
    </div>
  );
}
