import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { isAdmin } from '../utils/permissions.js';

/**
 * List work entries for company and month
 * @param {string} companyId - Company ID
 * @param {string} month - Month as 'YYYY-MM-01'
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of work entry objects with activity details
 * @throws {Error} - If permission denied or query fails
 */
export async function listWorkEntries(companyId, month, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can view work entries on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('work_entries')
    .select(`
      *,
      activity:activities(id, name, hourly_rate)
    `)
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .eq('month', month)
    .order('created_at');

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get work entry by ID
 * @param {string} workEntryId - Work entry ID
 * @returns {Promise<Object>} - Work entry object
 * @throws {Error} - If not found or access denied
 */
export async function getWorkEntry(workEntryId) {
  const { data, error } = await supabaseClient
    .from('work_entries')
    .select(`
      *,
      activity:activities(id, name, hourly_rate)
    `)
    .eq('id', workEntryId)
    .single();

  if (error) throw new Error('Work entry not found or access denied');
  return data;
}

/**
 * Create or update work entry (upsert based on unique constraint)
 * @param {Object} data - { activity_id, company_id, month, hours }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Work entry object
 * @throws {Error} - If validation fails (hours > 0) or operation fails
 */
export async function upsertWorkEntry(data, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can create work entries on behalf of users');
  }

  if (!data.activity_id || !data.company_id || !data.month) {
    throw new Error('Activity, company, and month are required');
  }

  if (!data.hours || data.hours <= 0) {
    throw new Error('Hours must be greater than 0');
  }

  const { data: workEntry, error } = await supabaseClient
    .from('work_entries')
    .upsert({
      user_id: userId,
      activity_id: data.activity_id,
      company_id: data.company_id,
      month: data.month,
      hours: data.hours
    }, {
      onConflict: 'user_id,activity_id,company_id,month'
    })
    .select(`
      *,
      activity:activities(id, name, hourly_rate)
    `)
    .single();

  if (error) throw new Error(error.message);
  return workEntry;
}

/**
 * Delete work entry
 * @param {string} workEntryId - Work entry ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 * @throws {Error} - If access denied or deletion fails
 */
export async function deleteWorkEntry(workEntryId, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can delete work entries on behalf of users');
  }

  const { error } = await supabaseClient
    .from('work_entries')
    .delete()
    .eq('id', workEntryId);

  if (error) throw new Error(error.message);
}

/**
 * Calculate total hours and amount for month
 * @param {string} companyId - Company ID
 * @param {string} month - Month as 'YYYY-MM-01'
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - { totalHours, totalAmount, entries }
 */
export async function getMonthlyTotal(companyId, month, onBehalfOfUserId = null) {
  const entries = await listWorkEntries(companyId, month, onBehalfOfUserId);

  const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
  const totalAmount = entries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.hours) * parseFloat(entry.activity.hourly_rate));
  }, 0);

  return {
    totalHours,
    totalAmount,
    entries
  };
}

/**
 * List all work entries for user across all companies and months
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of work entry objects
 */
export async function listAllWorkEntries(onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can view work entries on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('work_entries')
    .select(`
      *,
      activity:activities(id, name, hourly_rate),
      company:companies(id, name)
    `)
    .eq('user_id', userId)
    .order('month', { ascending: false })
    .order('created_at');

  if (error) throw new Error(error.message);
  return data || [];
}
