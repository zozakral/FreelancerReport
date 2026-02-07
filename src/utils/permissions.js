import { getCurrentUser } from '../services/auth.js';

/**
 * Check if current user is admin
 * @returns {Promise<boolean>} - True if admin, false otherwise
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * Check if current user is freelancer
 * @returns {Promise<boolean>} - True if freelancer, false otherwise
 */
export async function isFreelancer() {
  const user = await getCurrentUser();
  return user && user.role === 'freelancer';
}

/**
 * Redirect to page if user is not admin
 * @param {string} redirectUrl - URL to redirect to if not admin
 * @returns {Promise<void>}
 */
export async function requireAdmin(redirectUrl = '/pages/dashboard.html') {
  if (!await isAdmin()) {
    window.location.href = redirectUrl;
  }
}

/**
 * Get user role
 * @returns {Promise<string|null>} - 'admin', 'freelancer', or null
 */
export async function getUserRole() {
  const user = await getCurrentUser();
  return user ? user.role : null;
}
