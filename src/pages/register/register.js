import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initRegisterPage() {
	await bootstrapPage({ title: 'Register' });
}

void initRegisterPage();
