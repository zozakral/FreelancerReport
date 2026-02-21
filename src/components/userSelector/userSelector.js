import { listUsers } from '../../services/users.js';
import { isAdmin } from '../../utils/permissions.js';

/**
 * UserSelector component for admin pages
 * Provides a dropdown to select user for impersonation
 */
export class UserSelector {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Container ${containerSelector} not found`);
    }

    this.options = {
      storageKey: 'admin_selected_user_id',
      onChange: options.onChange || null,
      includeAllOption: options.includeAllOption || false
    };

    this.selectedUserId = null;
    this.init();
  }

  async init() {
    // Check if user is admin
    if (!await isAdmin()) {
      console.warn('UserSelector should only be used on admin pages');
      return;
    }

    // Render UI
    this.render();

    // Load users
    await this.loadUsers();

    // Restore selected user from session storage
    this.restoreSelection();
  }

  render() {
    this.container.innerHTML = `
      <div class="user-selector mb-3">
        <label for="user-select" class="form-label">Acting on behalf of:</label>
        <select id="user-select" class="form-select">
          <option value="">Loading users...</option>
        </select>
      </div>
    `;

    this.selectElement = this.container.querySelector('#user-select');
    this.selectElement.addEventListener('change', (e) => this.handleChange(e));
  }

  async loadUsers() {
    try {
      const users = await listUsers();

      // Build options
      let optionsHtml = '';

      if (this.options.includeAllOption) {
        optionsHtml += '<option value="">All Users</option>';
      } else {
        optionsHtml += '<option value="">Select a user...</option>';
      }

      users.forEach(user => {
        optionsHtml += `<option value="${user.id}">${user.full_name} (${user.role})</option>`;
      });

      this.selectElement.innerHTML = optionsHtml;

      // Restore selection after loading
      this.restoreSelection();
    } catch (error) {
      console.error('Failed to load users:', error);
      this.selectElement.innerHTML = '<option value="">Error loading users</option>';
    }
  }

  handleChange(e) {
    this.selectedUserId = e.target.value || null;

    // Save to session storage
    if (this.selectedUserId) {
      sessionStorage.setItem(this.options.storageKey, this.selectedUserId);
    } else {
      sessionStorage.removeItem(this.options.storageKey);
    }

    // Call onChange callback if provided
    if (this.options.onChange) {
      this.options.onChange(this.selectedUserId);
    }
  }

  restoreSelection() {
    const storedUserId = sessionStorage.getItem(this.options.storageKey);
    if (storedUserId) {
      this.selectElement.value = storedUserId;
      this.selectedUserId = storedUserId;
    }
  }

  getSelectedUserId() {
    return this.selectedUserId;
  }

  clearSelection() {
    this.selectedUserId = null;
    this.selectElement.value = '';
    sessionStorage.removeItem(this.options.storageKey);
  }
}
