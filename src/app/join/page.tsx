'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { extractShareCode } from "@/lib/ownership";

export default function JoinMatch() {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const extractedCode = extractShareCode(shareCode);
    if (!extractedCode) {
      setError("Invalid share code");
      return;
    }

    setLoading(true);
    router.push(`/match/${encodeURIComponent(extractedCode)}`);
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors hidden md:block">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Join Match</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-2">
          <LogIn className="w-8 h-8 ml-1" />
        </div>

        <p className="text-slate-600 text-sm mb-6">
          Enter the share code provided by the match creator to view the live scoreboard.
        </p>

        <div className="space-y-2 text-left">
          <label className="block text-sm font-semibold text-slate-700">Enter Share Code</label>
          <input
            type="text"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value)}
            className="w-full border-slate-300 rounded-xl px-4 py-4 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-center text-lg font-medium tracking-wide placeholder:text-slate-300"
            placeholder="e.g. CB7K4P or paste the shared message"
            required
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !shareCode.trim()}
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
        >
          {loading ? "Joining..." : "Join Match"}
        </button>
      </form>
    </div>
  );
}
