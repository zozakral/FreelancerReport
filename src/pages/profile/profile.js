import { bootstrapPage } from '../../core/bootstrapPage.js';
import { getMyProfile, updateMyProfile } from '../../services/profiles.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';
import { t } from '../../utils/i18n.js';

export async function initProfilePage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: t('title.profile') });

	try {
		const profile = await getMyProfile();

		const emailEl = document.querySelector('#profile-email');
		const roleEl = document.querySelector('#profile-role');
		const nameEl = document.querySelector('#profile-full-name');
		if (emailEl) emailEl.value = profile.email || '';
		if (roleEl) roleEl.value = profile.role || '';
		if (nameEl) nameEl.value = profile.full_name || '';

		const form = document.querySelector('#profile-form');
		if (form && nameEl) {
			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				try {
					await updateMyProfile({ full_name: nameEl.value });
					showSuccessMessage(t('messages.profileUpdated'));
				} catch (err) {
					showErrorAlert(err?.message || t('messages.profileUpdateFailed'));
				}
			});
		}
	} catch (err) {
		showErrorAlert(err?.message || t('messages.profileLoadFailed'));
	}
}

void initProfilePage();
