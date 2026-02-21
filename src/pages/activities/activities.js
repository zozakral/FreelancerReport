import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initActivitiesPage() {
	await bootstrapPage({ title: 'Activities' });
}

void initActivitiesPage();
