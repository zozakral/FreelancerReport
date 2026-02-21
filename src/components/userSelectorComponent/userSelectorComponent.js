import { UserSelector } from '../userSelector/userSelector.js';

export function initUserSelectorComponent(rootEl, options = {}) {
  const container = rootEl.querySelector('#user-selector-container');
  if (!container) throw new Error('UserSelectorComponent: missing container');

  const tempId = `user-selector-${crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())}`;
  container.id = tempId;

  return new UserSelector(`#${tempId}`, options);
}

