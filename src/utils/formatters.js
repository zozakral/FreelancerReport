/**
 * Format date as YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to first day of month (YYYY-MM-01)
 * @param {Date|string} date - Date object or date string
 * @returns {string} - First day of month as YYYY-MM-01
 */
export function formatMonthStart(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Format month for display (e.g., "January 2026")
 * @param {string} monthString - Month as YYYY-MM-01
 * @returns {string} - Formatted month name
 */
export function formatMonthDisplay(monthString) {
  const date = new Date(monthString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format hours with 2 decimal places
 * @param {number} hours - Hours to format
 * @returns {string} - Formatted hours
 */
export function formatHours(hours) {
  return parseFloat(hours).toFixed(2);
}
