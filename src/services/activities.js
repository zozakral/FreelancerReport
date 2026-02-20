import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { isAdmin } from '../utils/permissions.js';

/**
 * List all activities for user
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of activity objects
 * @throws {Error} - If permission denied or query fails
 */
export async function listActivities(onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can view activities on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get single activity by ID (respects RLS)
 * @param {string} activityId - Activity ID
 * @returns {Promise<Object>} - Activity object
 * @throws {Error} - If not found or access denied
 */
export async function getActivity(activityId) {
  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .eq('id', activityId)
    .single();

  if (error) throw new Error('Activity not found or access denied');
  return data;
}

/**
 * Create new activity
 * @param {Object} data - { name, hourly_rate }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Created activity object
 * @throws {Error} - If validation fails (rate > 0) or creation fails
 */
export async function createActivity(data, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can create activities on behalf of users');
  }

  if (!data.name) {
    throw new Error('Activity name is required');
  }

  if (!data.hourly_rate || data.hourly_rate <= 0) {
    throw new Error('Hourly rate must be greater than 0');
  }

  const { data: activity, error } = await supabaseClient
    .from('activities')
    .insert({
      user_id: userId,
      name: data.name,
      hourly_rate: data.hourly_rate
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return activity;
}

/**
 * Update activity
 * @param {string} activityId - Activity ID
 * @param {Object} updates - Fields to update
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Updated activity object
 * @throws {Error} - If access denied or update fails
 */
export async function updateActivity(activityId, updates, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can update activities on behalf of users');
  }

  if (updates.hourly_rate !== undefined && updates.hourly_rate <= 0) {
    throw new Error('Hourly rate must be greater than 0');
  }

  const { data, error } = await supabaseClient
    .from('activities')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete activity (cascades to work entries)
 * @param {string} activityId - Activity ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 * @throws {Error} - If access denied or deletion fails
 */
export async function deleteActivity(activityId, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can delete activities on behalf of users');
  }

  const { error } = await supabaseClient
    .from('activities')
    .delete()
    .eq('id', activityId);

  if (error) throw new Error(error.message);
}

/**
 * Search activities by name
 * @param {string} searchQuery - Search term
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Matching activity objects
 */
export async function searchActivities(searchQuery, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can search activities on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${searchQuery}%`)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}
