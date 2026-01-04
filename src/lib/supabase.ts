import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERREUR: Variables Supabase manquantes!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MANQUANT');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'OK' : 'MANQUANT');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
