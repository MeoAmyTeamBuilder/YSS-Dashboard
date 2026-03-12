import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://ofaaesxvivcveksleagg.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mYWFlc3h2aXZjdmVrc2xlYWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTQxODksImV4cCI6MjA4ODc5MDE4OX0.bHOGqOzb37IjhgmY13ajXJXKMO-0DbOuk-PqtA_l_Uk'
);
