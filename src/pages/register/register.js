import { bootstrapPage } from '../../core/bootstrapPage.js';
import { register, getCurrentUser } from '../../services/auth.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';

export async function initRegisterPage() {
	await bootstrapPage({ title: 'Register' });

	const existing = await getCurrentUser();
	if (existing) {
		window.location.href = '/dashboard';
		return;
	}

	const form = document.querySelector('#register-form');
	const nameEl = document.querySelector('#register-full-name');
	const emailEl = document.querySelector('#register-email');
	const passEl = document.querySelector('#register-password');
	if (!form || !nameEl || !emailEl || !passEl) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		try {
			await register(emailEl.value.trim(), passEl.value, nameEl.value.trim());
			showSuccessMessage('Account created');
			window.location.href = '/dashboard';
		} catch (err) {
			showErrorAlert(err?.message || 'Registration failed');
		}
	});
}

void initRegisterPage();
