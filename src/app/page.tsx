import Link from "next/link";
import { PlusCircle, History, LogIn, Spade } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] md:min-h-screen p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 text-indigo-100 opacity-50 rotate-12 scale-150 pointer-events-none">
        <Spade className="w-96 h-96" />
      </div>

      <div className="z-10 max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-900 rounded-2xl shadow-xl text-white mb-4 rotate-3">
            <Spade className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Call Break
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Track every call. Count every hand. Keep the score clear.
          </p>
        </div>

        <div className="grid gap-4">
          <Link href="/new-match" className="flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white p-4 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]">
            <PlusCircle className="w-5 h-5" />
            Create New Match
          </Link>
          
          <Link href="/join" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 border-2 border-indigo-100 p-4 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]">
            <LogIn className="w-5 h-5" />
            Join Match
          </Link>

          <Link href="/history" className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-xl font-semibold transition-all active:scale-[0.98]">
            <History className="w-5 h-5" />
            Match History
          </Link>
        </div>
      </div>
    </div>
  );
}
