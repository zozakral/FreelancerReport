import { bootstrapPage } from '../../core/bootstrapPage.js';
import { loadComponent } from '../../core/componentLoader.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies } from '../../services/companies.js';
import { listActivities } from '../../services/activities.js';
import { listWorkEntries, upsertWorkEntry, deleteWorkEntry } from '../../services/workEntries.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { formatCurrency, formatHours } from '../../utils/formatters.js';
import { getCurrentUser, redirectIfNotAuthenticated } from '../../services/auth.js';
import { getLocale, t } from '../../utils/i18n.js';

const DEFAULT_COMPANY_STORAGE_PREFIX = 'workEntry.defaultCompanyId';
const HOURS_PER_DAY = 8;
const YEAR_RANGE_PAST = 5;
const YEAR_RANGE_FUTURE = 2;

export async function initWorkEntryPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: t('title.workEntry') });

	const adminMount = document.querySelector('#admin-user-selector-mount');
	let onBehalfOfUserId = null;
	let currentUserId = null;
	const { selectedUserId } = await initAdminUserSelector({
		mountEl: adminMount,
		onChange: async (userId) => {
			onBehalfOfUserId = userId;
			await loadLookups();
			await refreshGrid();
		},
	});
	onBehalfOfUserId = selectedUserId || null;

	const currentUser = await getCurrentUser();
	currentUserId = currentUser?.id || null;

	const formMount = document.querySelector('#work-entry-form-mount');
	if (!formMount) return;

	await loadComponent({ name: 'workEntryForm', mountEl: formMount, initExport: 'initWorkEntryForm' });

	const companySelect = formMount.querySelector('#work-entry-company');
	const monthInput = formMount.querySelector('#work-entry-month');
	const monthSelect = formMount.querySelector('#work-entry-month-select');
	const yearSelect = formMount.querySelector('#work-entry-year-select');
	const rowsBody = formMount.querySelector('#work-entry-rows');
	const saveBtn = formMount.querySelector('#work-entry-save');
	const sortByNameBtn = formMount.querySelector('#work-entry-sort-name');
	const sortByRateBtn = formMount.querySelector('#work-entry-sort-rate');
	const totalHoursEl = formMount.querySelector('#work-entry-total-hours');
	const totalAmountEl = formMount.querySelector('#work-entry-total-amount');
	const totalDaysEl = formMount.querySelector('#work-entry-total-days');
	if (!companySelect || !monthInput || !monthSelect || !yearSelect || !rowsBody || !saveBtn || !sortByNameBtn || !sortByRateBtn || !totalHoursEl || !totalAmountEl || !totalDaysEl) return;

	let companies = [];
	let activities = [];
	let entriesByActivityId = new Map();
	let sortState = { key: 'hourly_rate', direction: 'asc' };

	function buildMonthOptions() {
		const formatter = new Intl.DateTimeFormat(getLocale(), { month: 'long' });
		return Array.from({ length: 12 }, (_, index) => {
			const monthNumber = index + 1;
			const label = formatter.format(new Date(2020, index, 1));
			return { value: String(monthNumber).padStart(2, '0'), label };
		});
	}

	function buildYearOptions() {
		const now = new Date();
		const start = now.getFullYear() - YEAR_RANGE_PAST;
		const end = now.getFullYear() + YEAR_RANGE_FUTURE;
		const years = [];
		for (let year = start; year <= end; year += 1) {
			years.push(String(year));
		}
		return years;
	}

	function syncMonthValue() {
		const month = monthSelect.value;
		const year = yearSelect.value;
		if (!month || !year) return;
		monthInput.value = `${year}-${month}`;
	}

	function renderMonthControls(selectedValue = '') {
		const selected = String(selectedValue || monthInput.value || '').trim();
		const [selectedYear, selectedMonth] = selected.split('-');
		const currentMonth = selectedMonth || String(new Date().getMonth() + 1).padStart(2, '0');
		const currentYear = selectedYear || String(new Date().getFullYear());

		monthSelect.innerHTML = buildMonthOptions()
			.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
			.join('');
		yearSelect.innerHTML = buildYearOptions()
			.map((year) => `<option value="${year}">${year}</option>`)
			.join('');

		monthSelect.value = currentMonth;
		yearSelect.value = currentYear;
		syncMonthValue();
	}

	function renderSortLabels() {
		sortByNameBtn.textContent = `${t('labels.activity')}${sortState.key === 'name' ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : ''}`;
		sortByRateBtn.textContent = `${t('labels.ratePerHour')}${sortState.key === 'hourly_rate' ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : ''}`;
	}

	function updateSort(key) {
		if (sortState.key === key) {
			sortState = {
				key,
				direction: sortState.direction === 'asc' ? 'desc' : 'asc',
			};
		} else {
			sortState = { key, direction: 'asc' };
		}

		renderSortLabels();
		void refreshGrid();
	}

	function getSortedActivities() {
		const sorted = [...activities];
		sorted.sort((left, right) => {
			if (sortState.key === 'name') {
				const leftName = String(left.name || '').toLocaleLowerCase();
				const rightName = String(right.name || '').toLocaleLowerCase();
				if (leftName < rightName) return sortState.direction === 'asc' ? -1 : 1;
				if (leftName > rightName) return sortState.direction === 'asc' ? 1 : -1;
				return 0;
			}

			const leftRate = Number(left.hourly_rate || 0);
			const rightRate = Number(right.hourly_rate || 0);
			if (leftRate < rightRate) return sortState.direction === 'asc' ? -1 : 1;
			if (leftRate > rightRate) return sortState.direction === 'asc' ? 1 : -1;
			return 0;
		});
		return sorted;
	}

	function getMonthStart() {
		const v = String(monthInput.value || '').trim();
		if (!v) return '';
		return `${v}-01`;
	}

	function updateTotals() {
		const inputs = Array.from(rowsBody.querySelectorAll('input[data-activity-id]'));
		let totalHours = 0;
		let totalAmount = 0;

		inputs.forEach((input) => {
			const hoursValue = String(input.value || '').trim();
			const parsedHours = hoursValue === '' ? 0 : Number(hoursValue);
			const hours = Number.isFinite(parsedHours) && parsedHours > 0 ? parsedHours : 0;
			const rateValue = Number(input.dataset.hourlyRate || 0);
			const rate = Number.isFinite(rateValue) && rateValue > 0 ? rateValue : 0;

			totalHours += hours;
			totalAmount += hours * rate;
		});

		totalHoursEl.textContent = formatHours(totalHours);
		totalAmountEl.textContent = formatCurrency(totalAmount);
		totalDaysEl.textContent = formatHours(totalHours / HOURS_PER_DAY);
	}

	function setDefaultMonth() {
		const now = new Date();
		const y = String(now.getFullYear());
		const m = String(now.getMonth() + 1).padStart(2, '0');
		monthInput.value = `${y}-${m}`;
		renderMonthControls(monthInput.value);
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
			companies = await listCompanies(onBehalfOfUserId);
			activities = await listActivities(onBehalfOfUserId);
			const defaultCompanyId = getStoredDefaultCompanyId();
			const hasDefaultCompany = defaultCompanyId && companies.some((c) => String(c.id) === defaultCompanyId);
			const selectedCompanyId = hasDefaultCompany
				? defaultCompanyId
				: (companies.length > 0 ? String(companies[0].id) : '');

			companySelect.innerHTML = `<option value="">${t('placeholders.selectCompany')}</option>` + companies
				.map((c) => `<option value="${c.id}">${c.name}</option>`)
				.join('');

			companySelect.value = selectedCompanyId;
			storeDefaultCompanyId(selectedCompanyId);
		} catch (err) {
			showErrorAlert(err?.message || t('messages.workEntriesLoadLookupsFailed'));
		}
	}

	async function refreshGrid() {
		const companyId = companySelect.value;
		const monthStart = getMonthStart();
		rowsBody.innerHTML = '';
		entriesByActivityId = new Map();

		if (!companyId || !monthStart) {
			updateTotals();
			return;
		}

		try {
			const existing = await listWorkEntries(companyId, monthStart, onBehalfOfUserId);
			existing.forEach((e) => entriesByActivityId.set(e.activity_id, e));

			getSortedActivities().forEach((activity) => {
				const existingEntry = entriesByActivityId.get(activity.id);

				const tr = document.createElement('tr');

				const tdName = document.createElement('td');
				tdName.textContent = activity.name;

				const tdRate = document.createElement('td');
				tdRate.className = 'text-end';
				tdRate.textContent = formatCurrency(Number(activity.hourly_rate || 0));

				const tdHours = document.createElement('td');
				tdHours.className = 'text-end';

				const input = document.createElement('input');
				input.type = 'number';
				input.step = '0.01';
				input.min = '0';
				input.className = 'form-control form-control-sm text-end';
				input.value = existingEntry ? String(existingEntry.hours) : '';
				input.dataset.activityId = activity.id;
				input.dataset.hourlyRate = String(Number(activity.hourly_rate || 0));
				if (existingEntry?.id) input.dataset.entryId = existingEntry.id;
				input.addEventListener('input', updateTotals);

				tdHours.appendChild(input);

				tr.appendChild(tdName);
				tr.appendChild(tdRate);
				tr.appendChild(tdHours);
				rowsBody.appendChild(tr);
			});

			updateTotals();
		} catch (err) {
			showErrorAlert(err?.message || t('messages.workEntriesLoadFailed'));
		}
	}

	async function saveAll() {
		const companyId = companySelect.value;
		const monthStart = getMonthStart();
		if (!companyId || !monthStart) {
			showErrorAlert(t('messages.workEntriesSelectCompanyMonth'));
			return;
		}

		const inputs = Array.from(rowsBody.querySelectorAll('input[data-activity-id]'));
		try {
			for (const input of inputs) {
				const activityId = input.dataset.activityId;
				const entryId = input.dataset.entryId || null;
				const hoursRaw = String(input.value || '').trim();
				const hours = hoursRaw === '' ? 0 : Number(hoursRaw);

				if (hours > 0) {
					await upsertWorkEntry({ activity_id: activityId, company_id: companyId, month: monthStart, hours }, onBehalfOfUserId);
				} else if (entryId) {
					await deleteWorkEntry(entryId, onBehalfOfUserId);
				}
			}

			showSuccessMessage(t('messages.workEntriesSaved'));
			await refreshGrid();
		} catch (err) {
			showErrorAlert(err?.message || t('messages.workEntriesSaveFailed'));
		}
	}

	companySelect.addEventListener('change', () => {
		storeDefaultCompanyId(companySelect.value);
		void refreshGrid();
	});
	monthSelect.addEventListener('change', () => {
		syncMonthValue();
		void refreshGrid();
	});
	yearSelect.addEventListener('change', () => {
		syncMonthValue();
		void refreshGrid();
	});
	sortByNameBtn.addEventListener('click', () => updateSort('name'));
	sortByRateBtn.addEventListener('click', () => updateSort('hourly_rate'));
	saveBtn.addEventListener('click', () => void saveAll());

	setDefaultMonth();
	renderSortLabels();
	await loadLookups();
	await refreshGrid();

	window.addEventListener('languagechange', () => {
		renderMonthControls(monthInput.value);
		renderSortLabels();
		void loadLookups();
		void refreshGrid();
	});
}

void initWorkEntryPage();
