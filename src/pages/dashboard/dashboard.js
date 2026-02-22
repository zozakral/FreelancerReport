import { bootstrapPage } from '../../core/bootstrapPage.js';
import { getCurrentUser } from '../../services/auth.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';
import { t } from '../../utils/i18n.js';

export async function initDashboardPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: t('title.dashboard') });

	const user = await getCurrentUser();
	const greetingEl = document.querySelector('#dashboard-greeting');
	const updateGreeting = () => {
		if (!greetingEl) return;
		greetingEl.textContent = user
			? t('dashboard.welcomeUser', { name: user.full_name || user.email })
			: t('dashboard.welcome');
	};

	updateGreeting();
	window.addEventListener('languagechange', updateGreeting);
}

void initDashboardPage();
