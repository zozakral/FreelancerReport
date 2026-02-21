import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initHomePage() {
	await bootstrapPage({ title: 'Home' });
}

void initHomePage();
