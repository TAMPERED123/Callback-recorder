'use client';

import { useEffect, useState } from "react";
import { getUserName, setUserName } from "@/lib/owner";

export default function UserNamePrompt() {
  const [name, setName] = useState<string>("");
  const [savedName, setSavedName] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentName = getUserName();
    setSavedName(currentName);
    if (currentName) {
      setName(currentName);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    setUserName(trimmed);
    setSavedName(trimmed);
    setError("");
  };

  if (savedName) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <span className="text-2xl">👋</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Welcome to Call Break</h2>
            <p className="text-sm text-slate-600">Enter your name so matches you create show a friendly owner label.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
              setDirty(true);
            }}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="e.g. Shivam"
            autoFocus
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-700 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            Save Name
          </button>
        </form>
      </div>
    </div>
  );
}
