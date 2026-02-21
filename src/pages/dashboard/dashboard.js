import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initDashboardPage() {
	await bootstrapPage({ title: 'Dashboard' });
}

void initDashboardPage();
