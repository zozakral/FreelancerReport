import { getCurrentUser, logout, onAuthStateChange } from '../../services/auth.js';
import { isAdmin } from '../../utils/permissions.js';
import { showErrorAlert } from '../../utils/ui.js';
import { applyTranslations, getLanguage, setLanguage, t } from '../../utils/i18n.js';

function setVisibleByAuth(rootEl, { isLoggedIn, isAdminUser }) {
  const guestEls = rootEl.querySelectorAll('[data-auth="guest"]');
  const userEls = rootEl.querySelectorAll('[data-auth="user"]');
  const adminEls = rootEl.querySelectorAll('[data-auth="admin"]');

  guestEls.forEach((el) => el.classList.toggle('d-none', isLoggedIn));
  userEls.forEach((el) => el.classList.toggle('d-none', !isLoggedIn));
  adminEls.forEach((el) => el.classList.toggle('d-none', !isLoggedIn || !isAdminUser));
}

function markActiveLink(rootEl) {
  const pathname = window.location.pathname || '/';
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  const links = rootEl.querySelectorAll('a.nav-link[data-path]');
  links.forEach((a) => {
    const linkPath = a.getAttribute('data-path');
    const isActive = linkPath === normalized || (linkPath === '/' && normalized === '/');
    a.classList.toggle('active', isActive);
    if (isActive) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });
}

async function renderHeaderState(rootEl) {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const isAdminUser = isLoggedIn ? await isAdmin() : false;

  setVisibleByAuth(rootEl, { isLoggedIn, isAdminUser });
  markActiveLink(rootEl);

  const nameEl = rootEl.querySelector('#nav-user-name');
  if (nameEl) {
    nameEl.textContent = user?.full_name || user?.email || t('nav.userDefault');
  }
}

export function initHeader(rootEl) {
  const languageSelect = rootEl.querySelector('#language-select');
  if (languageSelect) {
    languageSelect.value = getLanguage();
    languageSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
      applyTranslations(document);
    });

    window.addEventListener('languagechange', () => {
      languageSelect.value = getLanguage();
    });
  }

  const logoutBtn = rootEl.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await logout();
        window.location.href = '/login';
      } catch (e) {
        showErrorAlert(e?.message || t('messages.logoutFailed'));
      }
    });
  }

  void renderHeaderState(rootEl);
  onAuthStateChange(() => {
    void renderHeaderState(rootEl);
  });
}

