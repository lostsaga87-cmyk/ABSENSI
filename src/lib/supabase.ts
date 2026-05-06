import { createClient, SupabaseClient } from '@supabase/supabase-js';

// We export a mutable let instead of const so we can initialize it asynchronously
export let supabase: SupabaseClient;

export async function initSupabase() {
  try {
    const res = await fetch('/api/env');
    const env = await res.json();
    
    // Fallbacks just in case
    const supabaseUrl = env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://wtubgtvhjpwmndqykeew.supabase.co';
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      console.warn('VITE_SUPABASE_ANON_KEY is missing. Supabase will not work correctly until you provide it.');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key-to-prevent-crash');
  } catch (error) {
    console.error('Failed to initialize Supabase config:', error);
    // Fallbacks for dev without Express if needed
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtubgtvhjpwmndqykeew.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key-to-prevent-crash');
  }
}
