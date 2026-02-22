import { t } from './i18n.js';

/**
 * Show success alert message
 * @param {string} message - Success message
 */
export function showSuccessMessage(message) {
  showAlert(message, 'success');
}

/**
 * Show error alert message
 * @param {string} message - Error message
 */
export function showErrorAlert(message) {
  showAlert(message, 'danger');
}

/**
 * Show info alert message
 * @param {string} message - Info message
 */
export function showInfoMessage(message) {
  showAlert(message, 'info');
}

/**
 * Show alert message with Bootstrap alert component
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, danger, info, warning)
 */
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    console.error('Alert container not found');
    return;
  }

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="${t('aria.close')}"></button>
  `;

  alertContainer.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

/**
 * Show loading spinner
 * @param {string} containerSelector - Selector for spinner container
 */
export function showLoadingSpinner(containerSelector = '#loading-spinner') {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.classList.remove('d-none');
  }
}

/**
 * Hide loading spinner
 * @param {string} containerSelector - Selector for spinner container
 */
export function hideLoadingSpinner(containerSelector = '#loading-spinner') {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.classList.add('d-none');
  }
}

/**
 * Confirm action with user
 * @param {string} message - Confirmation message
 * @returns {boolean} - True if confirmed
 */
export function confirmAction(message) {
  return confirm(message);
}
