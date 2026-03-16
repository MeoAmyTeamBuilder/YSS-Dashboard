import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export async function logUpdateAction(userName: string, action: string) {
  // Logging to Supabase is disabled as the CheckUpdateDataByUser table was removed
  console.log(`[Update Action] User: ${userName}, Action: ${action}`);
}
