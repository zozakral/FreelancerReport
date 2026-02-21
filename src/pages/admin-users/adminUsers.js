import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initAdminUsersPage() {
	await bootstrapPage({ title: 'Admin Users' });
}

void initAdminUsersPage();
