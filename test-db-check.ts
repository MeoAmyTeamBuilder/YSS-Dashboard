import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking table CheckUpdateDataByUser...');
  
  const { data, error } = await supabase
    .from('CheckUpdateDataByUser')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error selecting from table:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  } else {
    console.log('Table exists. Data count:', data.length);
    console.log('Data sample:', data);
  }
}

checkTable();
