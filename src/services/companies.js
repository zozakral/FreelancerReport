import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { isAdmin } from '../utils/permissions.js';

/**
 * List all companies for user
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of company objects
 * @throws {Error} - If permission denied or query fails
 */
export async function listCompanies(onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can view companies on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get single company by ID (respects RLS)
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} - Company object
 * @throws {Error} - If not found or access denied
 */
export async function getCompany(companyId) {
  const { data, error } = await supabaseClient
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw new Error('Company not found or access denied');
  return data;
}

/**
 * Create new company
 * @param {Object} data - { name, tax_number?, city? }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Created company object
 * @throws {Error} - If validation fails or creation fails
 */
export async function createCompany(data, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can create companies on behalf of users');
  }

  if (!data.name) {
    throw new Error('Company name is required');
  }

  const { data: company, error } = await supabaseClient
    .from('companies')
    .insert({
      user_id: userId,
      name: data.name,
      tax_number: data.tax_number || null,
      city: data.city || null
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return company;
}

/**
 * Update company
 * @param {string} companyId - Company ID
 * @param {Object} updates - Fields to update
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Updated company object
 * @throws {Error} - If access denied or update fails
 */
export async function updateCompany(companyId, updates, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can update companies on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('companies')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete company (cascades to related data)
 * @param {string} companyId - Company ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 * @throws {Error} - If access denied or deletion fails
 */
export async function deleteCompany(companyId, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can delete companies on behalf of users');
  }

  const { error } = await supabaseClient
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) throw new Error(error.message);
}

/**
 * Search companies by name
 * @param {string} searchQuery - Search term
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Matching company objects
 */
export async function searchCompanies(searchQuery, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can search companies on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${searchQuery}%`)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}
