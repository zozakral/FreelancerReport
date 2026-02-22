import { bootstrapPage } from '../../core/bootstrapPage.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies } from '../../services/companies.js';
import { listReportTemplates, getReportConfig, upsertReportConfig } from '../../services/reportConfigs.js';
import { generateReportData, saveGeneratedReport } from '../../services/reportGenerator.js';
import { generatePDF, downloadPDF, uploadPDFToStorage, generateFilePath } from '../../services/pdfGenerator.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { formatDate } from '../../utils/formatters.js';
import { getCurrentUser, redirectIfNotAuthenticated } from '../../services/auth.js';
import { getLocale, t } from '../../utils/i18n.js';

const DEFAULT_COMPANY_STORAGE_PREFIX = 'workEntry.defaultCompanyId';
const YEAR_RANGE_PAST = 5;
const YEAR_RANGE_FUTURE = 2;

function getMonthStartFromInput(monthValue) {
	const v = String(monthValue || '').trim();
	return v ? `${v}-01` : '';
}

export async function initReportsPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: t('title.reports') });

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
	const monthSelectEl = document.querySelector('#report-month-select');
	const yearSelectEl = document.querySelector('#report-year-select');
	const daySelectEl = document.querySelector('#report-day-select');
	const dateMonthSelectEl = document.querySelector('#report-date-month-select');
	const dateYearSelectEl = document.querySelector('#report-date-year-select');
	const downloadBtn = document.querySelector('#report-download');
	const saveDownloadBtn = document.querySelector('#report-save-download');
	if (!companyEl || !templateEl || !locationEl || !introEl || !outroEl || !configForm || !monthEl || !dateEl || !monthSelectEl || !yearSelectEl || !daySelectEl || !dateMonthSelectEl || !dateYearSelectEl || !downloadBtn || !saveDownloadBtn) return;

	const now = new Date();
	monthEl.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	dateEl.value = formatDate(now);

	function buildMonthOptions() {
		const formatter = new Intl.DateTimeFormat(getLocale(), { month: 'long' });
		return Array.from({ length: 12 }, (_, index) => {
			const monthNumber = index + 1;
			const label = formatter.format(new Date(2020, index, 1));
			return { value: String(monthNumber).padStart(2, '0'), label };
		});
	}

	function buildYearOptions() {
		const start = now.getFullYear() - YEAR_RANGE_PAST;
		const end = now.getFullYear() + YEAR_RANGE_FUTURE;
		const years = [];
		for (let year = start; year <= end; year += 1) {
			years.push(String(year));
		}
		return years;
	}

	function syncReportMonthValue() {
		const month = monthSelectEl.value;
		const year = yearSelectEl.value;
		if (!month || !year) return;
		monthEl.value = `${year}-${month}`;
	}

	function updateDayOptions() {
		const year = Number(dateYearSelectEl.value);
		const month = Number(dateMonthSelectEl.value);
		if (!year || !month) return;
		const currentDay = Number(daySelectEl.value || 1);
		const daysInMonth = new Date(year, month, 0).getDate();
		daySelectEl.innerHTML = Array.from({ length: daysInMonth }, (_, index) => {
			const dayValue = String(index + 1).padStart(2, '0');
			return `<option value="${dayValue}">${dayValue}</option>`;
		}).join('');
		const nextDay = String(Math.min(currentDay, daysInMonth)).padStart(2, '0');
		daySelectEl.value = nextDay;
	}

	function syncReportDateValue() {
		const day = daySelectEl.value;
		const month = dateMonthSelectEl.value;
		const year = dateYearSelectEl.value;
		if (!day || !month || !year) return;
		dateEl.value = `${year}-${month}-${day}`;
	}

	function renderMonthControls(selectedValue = '') {
		const selected = String(selectedValue || monthEl.value || '').trim();
		const [selectedYear, selectedMonth] = selected.split('-');
		const currentMonth = selectedMonth || String(now.getMonth() + 1).padStart(2, '0');
		const currentYear = selectedYear || String(now.getFullYear());

		monthSelectEl.innerHTML = buildMonthOptions()
			.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
			.join('');
		yearSelectEl.innerHTML = buildYearOptions()
			.map((year) => `<option value="${year}">${year}</option>`)
			.join('');

		monthSelectEl.value = currentMonth;
		yearSelectEl.value = currentYear;
		syncReportMonthValue();
	}

	function renderDateControls(selectedValue = '') {
		const selected = String(selectedValue || dateEl.value || '').trim();
		const [selectedYear, selectedMonth, selectedDay] = selected.split('-');
		const currentYear = selectedYear || String(now.getFullYear());
		const currentMonth = selectedMonth || String(now.getMonth() + 1).padStart(2, '0');
		const currentDay = selectedDay || String(now.getDate()).padStart(2, '0');

		dateMonthSelectEl.innerHTML = buildMonthOptions()
			.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
			.join('');
		dateYearSelectEl.innerHTML = buildYearOptions()
			.map((year) => `<option value="${year}">${year}</option>`)
			.join('');

		dateMonthSelectEl.value = currentMonth;
		dateYearSelectEl.value = currentYear;
		updateDayOptions();
		daySelectEl.value = currentDay;
		syncReportDateValue();
	}

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

			companyEl.innerHTML = `<option value="">${t('placeholders.selectCompany')}</option>` + companies
				.map((c) => `<option value="${c.id}">${c.name}</option>`)
				.join('');

			templateEl.innerHTML = `<option value="">${t('placeholders.selectTemplate')}</option>` + templates
				.map((t) => `<option value="${t.id}">${t.name}</option>`)
				.join('');

			companyEl.value = selectedCompanyId;
			storeDefaultCompanyId(selectedCompanyId);
		} catch (err) {
			showErrorAlert(err?.message || t('messages.reportsLoadLookupsFailed'));
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
			showErrorAlert(err?.message || t('messages.reportConfigLoadFailed'));
		}
	}

	async function saveConfig() {
		const companyId = companyEl.value;
		const templateId = templateEl.value;
		if (!companyId || !templateId) {
			showErrorAlert(t('messages.reportSelectCompanyTemplate'));
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
			showSuccessMessage(t('messages.reportConfigSaved'));
		} catch (err) {
			showErrorAlert(err?.message || t('messages.reportConfigSaveFailed'));
		}
	}

	async function generateAndDownload({ saveToStorage }) {
		const companyId = companyEl.value;
		const monthStart = getMonthStartFromInput(monthEl.value);
		const reportDate = String(dateEl.value || '').trim();
		if (!companyId || !monthStart || !reportDate) {
			showErrorAlert(t('messages.reportSelectCompanyMonthDate'));
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

				showSuccessMessage(t('messages.reportSaved'));
			}

			downloadPDF(blob, filename);
		} catch (err) {
			showErrorAlert(err?.message || t('messages.reportGenerateFailed'));
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

	monthSelectEl.addEventListener('change', () => {
		syncReportMonthValue();
	});
	yearSelectEl.addEventListener('change', () => {
		syncReportMonthValue();
	});
	dateMonthSelectEl.addEventListener('change', () => {
		updateDayOptions();
		syncReportDateValue();
	});
	dateYearSelectEl.addEventListener('change', () => {
		updateDayOptions();
		syncReportDateValue();
	});
	daySelectEl.addEventListener('change', () => {
		syncReportDateValue();
	});

	downloadBtn.addEventListener('click', () => void generateAndDownload({ saveToStorage: false }));
	saveDownloadBtn.addEventListener('click', () => void generateAndDownload({ saveToStorage: true }));

	await loadLookups();
	await loadConfigForSelectedCompany();
	renderMonthControls(monthEl.value);
	renderDateControls(dateEl.value);

	window.addEventListener('languagechange', () => {
		void loadLookups();
		void loadConfigForSelectedCompany();
		renderMonthControls(monthEl.value);
		renderDateControls(dateEl.value);
	});
}

void initReportsPage();
