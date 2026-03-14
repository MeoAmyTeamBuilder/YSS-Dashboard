import { supabase } from './src/lib/supabase';

async function testFetch() {
  console.log('Testing fetch from CheckUpdateDataByUser...');
  const { data, error } = await supabase
    .from('CheckUpdateDataByUser')
    .select('*');
  
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Data fetched:', data);
  }
}

testFetch();
