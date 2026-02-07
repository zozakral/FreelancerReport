import { supabase } from '../config/supabase.js';
import { isAdmin } from '../utils/permissions.js';

/**
 * List all users (admin only)
 * @param {string|null} searchQuery - Optional search by name or email
 * @returns {Promise<Array>} - Array of user objects
 * @throws {Error} - If not admin or query fails
 */
export async function listUsers(searchQuery = null) {
  if (!await isAdmin()) {
    throw new Error('Only admins can list users');
  }

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get user by ID (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object
 * @throws {Error} - If not admin or not found
 */
export async function getUser(userId) {
  if (!await isAdmin()) {
    throw new Error('Only admins can view user details');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error('User not found');
  return data;
}

/**
 * Update user profile (admin only)
 * @param {string} userId - User ID to update
 * @param {Object} updates - Fields to update { full_name?, role? }
 * @returns {Promise<Object>} - Updated user object
 * @throws {Error} - If not admin or update fails
 */
export async function updateUser(userId, updates) {
  if (!await isAdmin()) {
    throw new Error('Only admins can update users');
  }

  // Validate role if provided
  if (updates.role && !['freelancer', 'admin'].includes(updates.role)) {
    throw new Error('Invalid role. Must be "freelancer" or "admin"');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete user (admin only)
 * Note: This deletes the profile. The auth.users entry should be deleted via Supabase Admin API
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 * @throws {Error} - If not admin or deletion fails
 */
export async function deleteUser(userId) {
  if (!await isAdmin()) {
    throw new Error('Only admins can delete users');
  }

  // Delete profile (will cascade delete related data)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw new Error(error.message);

  // Note: In production, you should also delete from auth.users using Admin API
  // This requires server-side code or Supabase Edge Function
}

/**
 * Search users by name or email (admin only)
 * @param {string} searchQuery - Search term
 * @returns {Promise<Array>} - Matching user objects
 * @throws {Error} - If not admin or query fails
 */
export async function searchUsers(searchQuery) {
  return await listUsers(searchQuery);
}
