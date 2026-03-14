import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export async function logUpdateAction(userName: string, action: string) {
  try {
    const { error } = await supabase
      .from('CheckUpdateDataByUser')
      .insert({
        idUser: userName,
        dateUpdate: new Date().toISOString(),
        actionUpdate: action
      });
    
    if (error) {
      console.error('Error logging update action:', error);
      toast.error('Failed to log update history');
    }
  } catch (err) {
    console.error('Failed to log update action:', err);
  }
}
