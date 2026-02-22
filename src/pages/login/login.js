import { bootstrapPage } from '../../core/bootstrapPage.js';
import { login, getCurrentUser } from '../../services/auth.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { t } from '../../utils/i18n.js';

export async function initLoginPage() {
	await bootstrapPage({ title: t('title.login') });

	const existing = await getCurrentUser();
	if (existing) {
		window.location.href = '/dashboard';
		return;
	}

	const form = document.querySelector('#login-form');
	const emailEl = document.querySelector('#login-email');
	const passEl = document.querySelector('#login-password');
	if (!form || !emailEl || !passEl) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			await login(emailEl.value.trim(), passEl.value);
			showSuccessMessage(t('messages.loggedIn'));
			window.location.href = '/dashboard';
		} catch (err) {
			showErrorAlert(err?.message || t('messages.loginFailed'));
		}
	});
}

void initLoginPage();
