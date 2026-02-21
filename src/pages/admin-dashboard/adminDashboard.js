import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initAdminDashboardPage() {
	await bootstrapPage({ title: 'Admin Dashboard' });
}

void initAdminDashboardPage();
