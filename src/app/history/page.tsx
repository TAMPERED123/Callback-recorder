'use client';

import { useEffect, useState } from "react";
import { supabase, type Match } from "@/lib/supabase";
import { getOwnerId } from "@/lib/owner";
import { format } from "date-fns";
import Link from "next/link";
import { ChevronRight, Filter, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function fetchMatches() {
      try {
        const ownerId = getOwnerId();
        const { data, error } = await supabase
          .from("Matches")
          .select("*")
          .eq("creator", ownerId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMatches(data || []);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(m => filter === 'all' || m.status === filter);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors hidden md:block">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Match History</h1>
        </div>

        <div className="flex bg-slate-200/50 p-1 rounded-lg">
          <button 
            onClick={() => setFilter('all')} 
            className={cn("px-3 py-1.5 text-xs font-semibold rounded-md transition-colors", filter === 'all' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('active')} 
            className={cn("px-3 py-1.5 text-xs font-semibold rounded-md transition-colors", filter === 'active' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            className={cn("px-3 py-1.5 text-xs font-semibold rounded-md transition-colors", filter === 'completed' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl animate-pulse flex justify-between items-center border border-slate-100">
              <div className="space-y-3 w-1/2">
                <div className="h-5 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-2xl border border-slate-100 shadow-sm mt-8">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No matches found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {filter === 'all' ? "You haven't created any matches yet." : `No ${filter} matches found.`}
          </p>
          <Link href="/new-match" className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
            Create Match
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map(match => (
            <Link key={match.id} href={`/match/${match.share_code}`} className="block bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {match.match_name}
                    </h3>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", match.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                      {match.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{format(new Date(match.created_at), 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Code: {match.share_code}</span>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
