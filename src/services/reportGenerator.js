import { supabase } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { isAdmin } from '../utils/permissions.js';
import { getReportConfig } from './reportConfigs.js';
import { getCompany } from './companies.js';
import { listWorkEntries } from './workEntries.js';

/**
 * Generate structured report data for PDF
 * @param {string} companyId - Company ID
 * @param {string} month - Month as 'YYYY-MM-01'
 * @param {string} reportDate - Date to display on report
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Structured report data
 * @throws {Error} - If data missing or generation fails
 */
export async function generateReportData(companyId, month, reportDate, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can generate reports on behalf of users');
  }

  // Fetch all required data in parallel
  const [config, company, workEntries, user] = await Promise.all([
    getReportConfig(companyId, onBehalfOfUserId),
    getCompany(companyId),
    listWorkEntries(companyId, month, onBehalfOfUserId),
    getCurrentUser()
  ]);

  // Validate data
  if (!config) {
    throw new Error('Report configuration not found for this company. Please configure report settings first.');
  }

  if (!workEntries || workEntries.length === 0) {
    throw new Error('No work entries found for this company and month');
  }

  // Calculate activities with totals
  const activities = workEntries.map((entry, index) => ({
    seq: index + 1,
    name: entry.activity.name,
    hourly_rate: parseFloat(entry.activity.hourly_rate),
    hours: parseFloat(entry.hours),
    total: parseFloat(entry.hours) * parseFloat(entry.activity.hourly_rate)
  }));

  // Calculate total amount
  const totalAmount = activities.reduce((sum, activity) => sum + activity.total, 0);

  // Structure report data
  return {
    reportDate: reportDate,
    location: config.location || '',
    company: {
      name: company.name,
      tax_number: company.tax_number || '',
      city: company.city || ''
    },
    worker: {
      full_name: user.full_name
    },
    introText: config.intro_text || '',
    outroText: config.outro_text || '',
    activities: activities,
    totalAmount: totalAmount,
    template: config.template
  };
}

/**
 * Save report metadata to database
 * @param {Object} reportData - { company_id, report_period, report_date, file_path?, save_to_storage }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Generated report record
 */
export async function saveGeneratedReport(reportData, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can save reports on behalf of users');
  }

  const { data, error } = await supabase
    .from('generated_reports')
    .insert({
      user_id: userId,
      company_id: reportData.company_id,
      report_period: reportData.report_period,
      report_date: reportData.report_date,
      file_path: reportData.file_path || null,
      save_to_storage: reportData.save_to_storage || false
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * List user's generated reports, optionally filtered by company
 * @param {string|null} companyId - Optional company filter
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of generated report objects
 */
export async function listGeneratedReports(companyId = null, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;

  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can view reports on behalf of users');
  }

  let query = supabase
    .from('generated_reports')
    .select(`
      *,
      company:companies(id, name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Delete generated report metadata
 * @param {string} reportId - Report ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 */
export async function deleteGeneratedReport(reportId, onBehalfOfUserId = null) {
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can delete reports on behalf of users');
  }

  const { error } = await supabase
    .from('generated_reports')
    .delete()
    .eq('id', reportId);

  if (error) throw new Error(error.message);
}

/**
 * Get signed URL for stored report
 * @param {string} filePath - File path in storage
 * @returns {Promise<string>} - Signed URL
 */
export async function getReportDownloadUrl(filePath) {
  const { data, error } = await supabase
    .storage
    .from('work-reports')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) throw new Error('Failed to generate download URL');
  return data.signedUrl;
}
