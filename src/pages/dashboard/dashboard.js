import { bootstrapPage } from '../../core/bootstrapPage.js';
import { getCurrentUser } from '../../services/auth.js';

export async function initDashboardPage() {
	await bootstrapPage({ title: 'Dashboard' });

	const user = await getCurrentUser();
	const greetingEl = document.querySelector('#dashboard-greeting');
	if (greetingEl) {
		greetingEl.textContent = user
			? `Welcome, ${user.full_name || user.email}`
			: 'Welcome';
	}
}

void initDashboardPage();
