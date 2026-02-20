import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { isAdmin } from '../utils/permissions.js';

/**
 * Get report config for company
 * @param {string} companyId - Company ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object|null>} - Report config or null if not exists
 */
export async function getReportConfig(companyId, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can view report configs on behalf of users');
  }

  const { data, error } = await supabaseClient
    .from('report_configs')
    .select(`
      *,
      template:report_templates(*)
    `)
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single();

  if (error) {
    // Not found is okay, return null
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create or update report config
 * @param {Object} data - { company_id, template_id, intro_text?, outro_text?, location? }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Report config object
 * @throws {Error} - If validation or operation fails
 */
export async function upsertReportConfig(data, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can create report configs on behalf of users');
  }

  if (!data.company_id || !data.template_id) {
    throw new Error('Company and template are required');
  }

  const { data: config, error } = await supabaseClient
    .from('report_configs')
    .upsert({
      user_id: userId,
      company_id: data.company_id,
      template_id: data.template_id,
      intro_text: data.intro_text || null,
      outro_text: data.outro_text || null,
      location: data.location || null
    }, {
      onConflict: 'user_id,company_id'
    })
    .select(`
      *,
      template:report_templates(*)
    `)
    .single();

  if (error) throw new Error(error.message);
  return config;
}

/**
 * Delete report config
 * @param {string} configId - Config ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 */
export async function deleteReportConfig(configId, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can delete report configs on behalf of users');
  }

  const { error } = await supabaseClient
    .from('report_configs')
    .delete()
    .eq('id', configId);

  if (error) throw new Error(error.message);
}

/**
 * List all available report templates (global, no user filter)
 * @returns {Promise<Array>} - Array of template objects
 */
export async function listReportTemplates() {
  const { data, error } = await supabaseClient
    .from('report_templates')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Get template by ID
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} - Template object
 */
export async function getReportTemplate(templateId) {
  const { data, error } = await supabaseClient
    .from('report_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw new Error('Template not found');
  return data;
}
