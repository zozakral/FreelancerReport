import { bootstrapPage } from '../../core/bootstrapPage.js';

export async function initWorkEntryPage() {
	await bootstrapPage({ title: 'Work Entry' });
}

void initWorkEntryPage();
