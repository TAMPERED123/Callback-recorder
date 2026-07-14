import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Match = {
  id: number;
  created_at: string;
  match_name: string;
  creator: string | null;
  status: string;
  share_code: string;
};

export type Player = {
  id: number;
  created_at: string;
  match_id: number;
  player_name: string;
};

export type Round = {
  id: number;
  created_at: string;
  match_id: number;
  round_number: number;
};

export type Score = {
  id: number;
  created_at: string;
  player_id: number;
  round_id: number;
  score: number;
  call: number;
};
