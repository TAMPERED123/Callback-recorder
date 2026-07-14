export function calculateScore(call: number, actualTricks: number): number {
  if (actualTricks >= call) {
    return (call * 10) + (actualTricks - call);
  } else {
    return -(call * 10);
  }
}

export function calculatePlayerTotal(scores: { score: number }[]): number {
  return scores.reduce((total, s) => total + s.score, 0);
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
