import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initCompaniesPage() {
	await bootstrapPage({ title: 'Companies' });
}

void initCompaniesPage();
