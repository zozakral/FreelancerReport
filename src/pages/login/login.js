import { bootstrapPage } from '../../core/bootstrapPage.js';
import { login, getCurrentUser } from '../../services/auth.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';

export async function initLoginPage() {
	await bootstrapPage({ title: 'Login' });

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
			showSuccessMessage('Logged in');
			window.location.href = '/dashboard';
		} catch (err) {
			showErrorAlert(err?.message || 'Login failed');
		}
	});
}

void initLoginPage();
