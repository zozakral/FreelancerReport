import { isAdmin } from '../utils/permissions.js';
import { loadComponent } from './componentLoader.js';

export const ADMIN_SELECTED_USER_ID_STORAGE_KEY = 'admin_selected_user_id';

export function getSelectedUserIdFromSession() {
  return sessionStorage.getItem(ADMIN_SELECTED_USER_ID_STORAGE_KEY) || null;
}

/**
 * Loads the admin user selector component into mountEl if current user is admin.
 * Returns the current selected user id (or null).
 */
export async function initAdminUserSelector({ mountEl, onChange } = {}) {
  if (!mountEl) return { selectedUserId: null, selector: null };

  const admin = await isAdmin();
  if (!admin) {
    mountEl.innerHTML = '';
    return { selectedUserId: null, selector: null };
  }

  await loadComponent({
    name: 'userSelectorComponent',
    mountEl,
    initExport: 'initUserSelectorComponent',
    initArgs: [{
      storageKey: ADMIN_SELECTED_USER_ID_STORAGE_KEY,
      onChange: (userId) => {
        if (typeof onChange === 'function') onChange(userId || null);
      },
    }],
  });

  return { selectedUserId: getSelectedUserIdFromSession(), selector: null };
}
