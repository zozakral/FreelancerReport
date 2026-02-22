import { bootstrapPage } from '../../core/bootstrapPage.js';
import { t } from '../../utils/i18n.js';

export async function initHomePage() {
	await bootstrapPage({ title: t('title.home') });
}

void initHomePage();
