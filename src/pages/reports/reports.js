import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initReportsPage() {
	await bootstrapPage({ title: 'Reports' });
}

void initReportsPage();
