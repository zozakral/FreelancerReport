import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initLoginPage() {
	await bootstrapPage({ title: 'Login' });
}

void initLoginPage();
