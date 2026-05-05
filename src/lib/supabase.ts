import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wtubgtvhjpwmndqykeew.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is missing. Supabase will not work correctly until you provide it.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key-to-prevent-crash');
