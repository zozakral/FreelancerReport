import { bootstrapPage } from '../../core/bootstrapPage.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';
import { requireAdmin } from '../../utils/permissions.js';
import { t } from '../../utils/i18n.js';

export async function initAdminDashboardPage() {
	if (await redirectIfNotAuthenticated()) return;
	if (await requireAdmin()) return;
	await bootstrapPage({ title: t('title.adminDashboard') });
}

void initAdminDashboardPage();
