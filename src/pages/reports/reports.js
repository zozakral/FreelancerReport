import { bootstrapPage } from '../../core/bootstrapPage.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies } from '../../services/companies.js';
import { listReportTemplates, getReportConfig, upsertReportConfig } from '../../services/reportConfigs.js';
import { generateReportData, saveGeneratedReport } from '../../services/reportGenerator.js';
import { generatePDF, downloadPDF, uploadPDFToStorage, generateFilePath } from '../../services/pdfGenerator.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { formatDate } from '../../utils/formatters.js';

function getMonthStartFromInput(monthValue) {
	const v = String(monthValue || '').trim();
	return v ? `${v}-01` : '';
}

export async function initReportsPage() {
	await bootstrapPage({ title: 'Reports' });

	const adminMount = document.querySelector('#admin-user-selector-mount');
	let onBehalfOfUserId = null;
	await initAdminUserSelector({
		mountEl: adminMount,
		onChange: async (userId) => {
			onBehalfOfUserId = userId;
			await loadLookups();
			await loadConfigForSelectedCompany();
		},
	});

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

	async function loadLookups() {
		try {
			const [companies, templates] = await Promise.all([
				listCompanies(onBehalfOfUserId),
				listReportTemplates(),
			]);

			companyEl.innerHTML = '<option value="">Select company...</option>' + companies
				.map((c) => `<option value="${c.id}">${c.name}</option>`)
				.join('');

			templateEl.innerHTML = '<option value="">Select template...</option>' + templates
				.map((t) => `<option value="${t.id}">${t.name}</option>`)
				.join('');

			if (!companyEl.value && companies.length > 0) companyEl.value = companies[0].id;
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

	companyEl.addEventListener('change', () => void loadConfigForSelectedCompany());
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
