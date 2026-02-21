import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initProfilePage() {
	await bootstrapPage({ title: 'Profile' });
}

void initProfilePage();
