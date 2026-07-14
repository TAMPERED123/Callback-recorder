import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function createSupabaseClient(apiKey: string) {
  return createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getAdminSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase service role configuration. Add SUPABASE_SERVICE_ROLE_KEY to your server environment.');
  }

  return createSupabaseClient(supabaseServiceRoleKey);
}

export function hasAdminSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getReadOnlySupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createSupabaseClient(supabaseAnonKey);
}
