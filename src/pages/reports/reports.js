import { bootstrapPage } from '../../core/bootstrapPage.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies } from '../../services/companies.js';
import { listReportTemplates, getReportConfig, upsertReportConfig } from '../../services/reportConfigs.js';
import { generateReportData, saveGeneratedReport } from '../../services/reportGenerator.js';
import { generatePDF, downloadPDF, uploadPDFToStorage, generateFilePath } from '../../services/pdfGenerator.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { formatDate } from '../../utils/formatters.js';
import { getCurrentUser, redirectIfNotAuthenticated } from '../../services/auth.js';

const DEFAULT_COMPANY_STORAGE_PREFIX = 'workEntry.defaultCompanyId';

function getMonthStartFromInput(monthValue) {
	const v = String(monthValue || '').trim();
	return v ? `${v}-01` : '';
}

export async function initReportsPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: 'Reports' });

	const adminMount = document.querySelector('#admin-user-selector-mount');
	let onBehalfOfUserId = null;
	let currentUserId = null;
	const { selectedUserId } = await initAdminUserSelector({
		mountEl: adminMount,
		onChange: async (userId) => {
			onBehalfOfUserId = userId;
			await loadLookups();
			await loadConfigForSelectedCompany();
		},
	});
	onBehalfOfUserId = selectedUserId || null;

	const currentUser = await getCurrentUser();
	currentUserId = currentUser?.id || null;

	const companyEl = document.querySelector('#report-company');
	const templateEl = document.querySelector('#report-template');
	const locationEl = document.querySelector('#report-location');
	const introEl = document.querySelector('#report-intro');
	const outroEl = document.querySelector('#report-outro');
	const configForm = document.querySelector('#report-config-form');
	const monthEl = document.querySelector('#report-month');
	const dateEl = document.querySelector('#report-date');
	const downloadBtn = document.querySelector('#report-download');
	const saveDownloadBtn = document.querySelector('#report-save-download');
	if (!companyEl || !templateEl || !locationEl || !introEl || !outroEl || !configForm || !monthEl || !dateEl || !downloadBtn || !saveDownloadBtn) return;

	const now = new Date();
	monthEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	dateEl.value = formatDate(now);

	function getStorageKey() {
		const effectiveUserId = onBehalfOfUserId || currentUserId;
		if (!effectiveUserId) return null;
		return `${DEFAULT_COMPANY_STORAGE_PREFIX}:${effectiveUserId}`;
	}

	function getStoredDefaultCompanyId() {
		const key = getStorageKey();
		if (!key) return '';
		return String(localStorage.getItem(key) || '');
	}

	function storeDefaultCompanyId(companyId) {
		const key = getStorageKey();
		if (!key) return;

		if (!companyId) {
			localStorage.removeItem(key);
			return;
		}

		localStorage.setItem(key, String(companyId));
	}

	async function loadLookups() {
		try {
			const [companies, templates] = await Promise.all([
				listCompanies(onBehalfOfUserId),
				listReportTemplates(),
			]);
			const defaultCompanyId = getStoredDefaultCompanyId();
			const hasDefaultCompany = defaultCompanyId && companies.some((c) => String(c.id) === defaultCompanyId);
			const selectedCompanyId = hasDefaultCompany
				? defaultCompanyId
				: (companies.length > 0 ? String(companies[0].id) : '');

			companyEl.innerHTML = '<option value="">Select company...</option>' + companies
				.map((c) => `<option value="${c.id}">${c.name}</option>`)
				.join('');

			templateEl.innerHTML = '<option value="">Select template...</option>' + templates
				.map((t) => `<option value="${t.id}">${t.name}</option>`)
				.join('');

			companyEl.value = selectedCompanyId;
			storeDefaultCompanyId(selectedCompanyId);
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load companies/templates');
		}
	}

	async function loadConfigForSelectedCompany() {
		const companyId = companyEl.value;
		if (!companyId) return;

		try {
			const cfg = await getReportConfig(companyId, onBehalfOfUserId);
			if (cfg) {
				templateEl.value = cfg.template_id;
				locationEl.value = cfg.location || '';
				introEl.value = cfg.intro_text || '';
				outroEl.value = cfg.outro_text || '';
			} else {
				templateEl.value = '';
				locationEl.value = '';
				introEl.value = '';
				outroEl.value = '';
			}
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load report config');
		}
	}

	async function saveConfig() {
		const companyId = companyEl.value;
		const templateId = templateEl.value;
		if (!companyId || !templateId) {
			showErrorAlert('Select company and template');
			return;
		}

		try {
			await upsertReportConfig({
				company_id: companyId,
				template_id: templateId,
				location: locationEl.value,
				intro_text: introEl.value,
				outro_text: outroEl.value,
			}, onBehalfOfUserId);
			showSuccessMessage('Report configuration saved');
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to save configuration');
		}
	}

	async function generateAndDownload({ saveToStorage }) {
		const companyId = companyEl.value;
		const monthStart = getMonthStartFromInput(monthEl.value);
		const reportDate = String(dateEl.value || '').trim();
		if (!companyId || !monthStart || !reportDate) {
			showErrorAlert('Select company, month, and report date');
			return;
		}

		try {
			const reportData = await generateReportData(companyId, monthStart, reportDate, onBehalfOfUserId);
			const blob = await generatePDF(reportData);

			const period = monthEl.value;
			const filename = `work-report-${period}.pdf`;

			if (saveToStorage) {
				const filePath = await generateFilePath(companyId, period, onBehalfOfUserId);
				await uploadPDFToStorage(blob, filePath);
				await saveGeneratedReport({
					company_id: companyId,
					report_period: monthStart,
					report_date: reportDate,
					file_path: filePath,
					save_to_storage: true,
				}, onBehalfOfUserId);

				showSuccessMessage('Report saved');
			}

			downloadPDF(blob, filename);
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to generate report');
		}
	}

	companyEl.addEventListener('change', () => {
		storeDefaultCompanyId(companyEl.value);
		void loadConfigForSelectedCompany();
	});
	configForm.addEventListener('submit', (e) => {
		e.preventDefault();
		void saveConfig();
	});

	downloadBtn.addEventListener('click', () => void generateAndDownload({ saveToStorage: false }));
	saveDownloadBtn.addEventListener('click', () => void generateAndDownload({ saveToStorage: true }));

	await loadLookups();
	await loadConfigForSelectedCompany();
}

void initReportsPage();
