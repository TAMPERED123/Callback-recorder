import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Call Break Scorekeeper",
  description: "Track every call. Count every hand. Keep the score clear.",
};

import { AppNavigation } from "@/components/AppNavigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, "font-sans antialiased bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden")}>
        <AppNavigation />
        <main className="md:ml-64 min-h-screen w-full pb-24 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
