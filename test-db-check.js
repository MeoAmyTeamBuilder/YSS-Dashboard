const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking table CheckUpdateDataByUser...');
  
  // Check if table exists and its columns
  const { data: columns, error: colError } = await supabase
    .rpc('get_table_columns', { table_name: 'CheckUpdateDataByUser' });

  if (colError) {
    // If RPC doesn't exist, try a simple select
    console.log('RPC failed, trying simple select limit 1');
    const { data, error } = await supabase
      .from('CheckUpdateDataByUser')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error selecting from table:', error);
    } else {
      console.log('Table exists. Data sample:', data);
    }
  } else {
    console.log('Columns:', columns);
  }
}

checkTable();
