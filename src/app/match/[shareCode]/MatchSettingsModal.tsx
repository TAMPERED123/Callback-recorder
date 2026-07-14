'use client';

import { useState } from "react";
import { type Match } from "@/lib/supabase";
import { X, Trash2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  match: Match;
  shareCode: string;
  onClose: () => void;
}

export default function MatchSettingsModal({ match, shareCode, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState(match.match_name);
  const [isEditingName, setIsEditingName] = useState(false);
  const router = useRouter();

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim() === match.match_name) {
      setIsEditingName(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateMatch", payload: { matchName: newName.trim() } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update name");
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = match.status === 'active' ? 'completed' : 'active';
    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateMatch", payload: { status: newStatus } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to update status");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update status");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${match.match_name}"? This will remove all rounds and scores.`)) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${encodeURIComponent(shareCode)}/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMatch" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete match");
      router.push('/history');
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to delete match");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full md:max-w-sm rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Match Settings</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Match Name</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setIsEditingName(true);
                }}
                className="flex-1 border-slate-300 rounded-xl px-4 py-2 bg-slate-50 border focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              />
              {isEditingName && (
                <button 
                  onClick={handleUpdateName}
                  disabled={loading}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-xl font-medium shadow-sm"
                >
                  Save
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleToggleStatus}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            {match.status === 'active' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Mark as Completed
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-slate-400" />
                Reopen Match
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Delete Match
          </button>
        </div>
      </div>
    </div>
  );
}
