import { bootstrapPage } from '../../core/bootstrapPage.js';
import { loadComponent } from '../../core/componentLoader.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies } from '../../services/companies.js';
import { listActivities } from '../../services/activities.js';
import { listWorkEntries, upsertWorkEntry, deleteWorkEntry } from '../../services/workEntries.js';
import { showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { formatCurrency } from '../../utils/formatters.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';

export async function initWorkEntryPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: 'Work Entry' });

	const adminMount = document.querySelector('#admin-user-selector-mount');
	let onBehalfOfUserId = null;
	const { selectedUserId } = await initAdminUserSelector({
		mountEl: adminMount,
		onChange: async (userId) => {
			onBehalfOfUserId = userId;
			await loadLookups();
			await refreshGrid();
		},
	});
	onBehalfOfUserId = selectedUserId || null;

	const formMount = document.querySelector('#work-entry-form-mount');
	if (!formMount) return;

	await loadComponent({ name: 'workEntryForm', mountEl: formMount, initExport: 'initWorkEntryForm' });

	const companySelect = formMount.querySelector('#work-entry-company');
	const monthInput = formMount.querySelector('#work-entry-month');
	const rowsBody = formMount.querySelector('#work-entry-rows');
	const saveBtn = formMount.querySelector('#work-entry-save');
	const sortByNameBtn = formMount.querySelector('#work-entry-sort-name');
	const sortByRateBtn = formMount.querySelector('#work-entry-sort-rate');
	if (!companySelect || !monthInput || !rowsBody || !saveBtn || !sortByNameBtn || !sortByRateBtn) return;

	let companies = [];
	let activities = [];
	let entriesByActivityId = new Map();
	let sortState = { key: 'hourly_rate', direction: 'asc' };

	function renderSortLabels() {
		sortByNameBtn.textContent = `Activity${sortState.key === 'name' ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : ''}`;
		sortByRateBtn.textContent = `Rate/Hour${sortState.key === 'hourly_rate' ? (sortState.direction === 'asc' ? ' ↑' : ' ↓') : ''}`;
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

	function setDefaultMonth() {
		const now = new Date();
		const y = String(now.getFullYear());
		const m = String(now.getMonth() + 1).padStart(2, '0');
		monthInput.value = `${y}-${m}`;
	}

	async function loadLookups() {
		try {
			companies = await listCompanies(onBehalfOfUserId);
			activities = await listActivities(onBehalfOfUserId);

			companySelect.innerHTML = '<option value="">Select company...</option>' + companies
				.map((c) => `<option value="${c.id}">${c.name}</option>`)
				.join('');

			if (!companySelect.value && companies.length > 0) {
				companySelect.value = companies[0].id;
			}
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load companies/activities');
		}
	}

	async function refreshGrid() {
		const companyId = companySelect.value;
		const monthStart = getMonthStart();
		rowsBody.innerHTML = '';
		entriesByActivityId = new Map();

		if (!companyId || !monthStart) return;

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
				if (existingEntry?.id) input.dataset.entryId = existingEntry.id;

				tdHours.appendChild(input);

				tr.appendChild(tdName);
				tr.appendChild(tdRate);
				tr.appendChild(tdHours);
				rowsBody.appendChild(tr);
			});
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load work entries');
		}
	}

	async function saveAll() {
		const companyId = companySelect.value;
		const monthStart = getMonthStart();
		if (!companyId || !monthStart) {
			showErrorAlert('Select company and month');
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

			showSuccessMessage('Work entries saved');
			await refreshGrid();
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to save work entries');
		}
	}

	companySelect.addEventListener('change', () => void refreshGrid());
	monthInput.addEventListener('change', () => void refreshGrid());
	sortByNameBtn.addEventListener('click', () => updateSort('name'));
	sortByRateBtn.addEventListener('click', () => updateSort('hourly_rate'));
	saveBtn.addEventListener('click', () => void saveAll());

	setDefaultMonth();
	renderSortLabels();
	await loadLookups();
	await refreshGrid();
}

void initWorkEntryPage();
