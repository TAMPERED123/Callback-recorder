'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusCircle, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewMatch() {
  const router = useRouter();
  const [matchName, setMatchName] = useState("");
  const [players, setPlayers] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addPlayer = () => setPlayers([...players, ""]);

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const updatePlayer = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validPlayers = players.map((p) => p.trim()).filter((p) => p !== "");
    if (!matchName.trim()) {
      setError("Match name is required.");
      return;
    }
    if (validPlayers.length < 2) {
      setError("At least 2 players are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchName: matchName.trim(),
          players: validPlayers,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create match");

      router.push(`/match/${encodeURIComponent(data.shareCode)}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create match");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors hidden md:block">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Match</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Match Name</label>
          <input
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            className="w-full border-slate-300 rounded-xl px-4 py-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            placeholder="e.g. Sunday Night Match"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Players</label>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                  className="min-w-0 flex-1 border-slate-300 rounded-xl px-4 py-3 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder={`Player ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => removePlayer(index)}
                  disabled={players.length <= 2}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                  aria-label="Remove player"
                >
                  <MinusCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addPlayer}
            className="w-full py-3 flex items-center justify-center gap-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors border border-dashed border-indigo-200"
          >
            <PlusCircle className="w-4 h-4" />
            Add Player
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? "Creating..." : "Create Match"}
        </button>
      </form>
    </div>
  );
}
