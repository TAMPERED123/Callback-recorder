'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, History, LogIn, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "New Match", href: "/new-match", icon: PlusCircle },
  { name: "Match History", href: "/history", icon: History },
  { name: "Join Match", href: "/join", icon: LogIn },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-indigo-950 text-white min-h-screen fixed left-0 top-0 bottom-0 z-10 shadow-xl">
        <div className="p-6 flex flex-col items-center border-b border-indigo-900">
          <div className="flex gap-1 mb-2 text-indigo-400">
            <span>♠</span><span className="text-red-400">♥</span><span>♣</span><span className="text-red-400">♦</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide">Call Break</h1>
          <p className="text-xs text-indigo-300 mt-1">Scorekeeper</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium", isActive ? "bg-indigo-900 text-white" : "text-indigo-200 hover:bg-indigo-900/50 hover:text-white")}>
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="grid h-16 grid-cols-4 items-center px-2">
          <Link href="/" className={cn("flex flex-col items-center justify-center min-w-0 gap-1 text-[11px] font-medium", pathname === "/" ? "text-indigo-700" : "text-slate-500")}>
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/history" className={cn("flex flex-col items-center justify-center min-w-0 gap-1 text-[11px] font-medium", pathname === "/history" ? "text-indigo-700" : "text-slate-500")}>
            <History className="w-5 h-5" />
            <span>History</span>
          </Link>
          <div className="relative flex items-center justify-center">
            <Link href="/new-match" className="absolute -top-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-700 text-white shadow-lg transition-colors hover:bg-indigo-600">
              <PlusCircle className="w-6 h-6" />
            </Link>
          </div>
          <Link href="/join" className={cn("flex flex-col items-center justify-center min-w-0 gap-1 text-[11px] font-medium", pathname === "/join" ? "text-indigo-700" : "text-slate-500")}>
            <LogIn className="w-5 h-5" />
            <span>Join</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
