import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';

export async function getMyProfile() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

export async function updateMyProfile({ full_name } = {}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  if (!full_name || String(full_name).trim().length === 0) {
    throw new Error('Full name is required');
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .update({
      full_name: String(full_name).trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
