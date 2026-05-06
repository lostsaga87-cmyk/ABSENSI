import { createClient, SupabaseClient } from '@supabase/supabase-js';

// We export a mutable let instead of const so we can initialize it asynchronously
export let supabase: SupabaseClient;

// Add a way to manually re-initialize (useful after saving from ApiConfig page)
export function setSupabaseClient(url: string, key: string) {
  supabase = createClient(url, key);
}

export async function initSupabase() {
  try {
    // Try localStorage first
    const localUrl = localStorage.getItem('SUPABASE_URL');
    const localKey = localStorage.getItem('SUPABASE_ANON_KEY');

    if (localUrl && localKey) {
      supabase = createClient(localUrl, localKey);
      return;
    }

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
    console.error('Failed to fetch from /api/env. Falling back to import.meta.env:', error);
    
    // Try localStorage first even in catch
    const localUrl = localStorage.getItem('SUPABASE_URL');
    const localKey = localStorage.getItem('SUPABASE_ANON_KEY');
    
    // Fallbacks for dev without Express if needed
    const supabaseUrl = localUrl || import.meta.env.VITE_SUPABASE_URL || 'https://wtubgtvhjpwmndqykeew.supabase.co';
    const supabaseAnonKey = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key-to-prevent-crash');
  }
}
