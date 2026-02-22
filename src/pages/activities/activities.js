import { bootstrapPage } from '../../core/bootstrapPage.js';
import { loadComponent } from '../../core/componentLoader.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listActivities, searchActivities, createActivity, updateActivity, deleteActivity } from '../../services/activities.js';
import { renderDataTable } from '../../components/dataTable/dataTable.js';
import { getActivityFormData, setActivityFormData } from '../../components/activityForm/activityForm.js';
import { confirmAction, showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { formatCurrency } from '../../utils/formatters.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';

export async function initActivitiesPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: 'Activities' });

	const adminMount = document.querySelector('#admin-user-selector-mount');
	let onBehalfOfUserId = null;

	await initAdminUserSelector({
		mountEl: adminMount,
		onChange: async (userId) => {
			onBehalfOfUserId = userId;
			await refreshList();
			startNew();
		},
	});

	const tableMount = document.querySelector('#activities-table-mount');
	const formMount = document.querySelector('#activity-form-mount');
	const modalEl = document.querySelector('#activity-form-modal');
	const modalTitleEl = document.querySelector('#activity-form-modal-title');
	if (!tableMount || !formMount || !modalEl) return;

	const activityModal = window.bootstrap?.Modal ? new window.bootstrap.Modal(modalEl) : null;

	await loadComponent({ name: 'dataTable', mountEl: tableMount });
	await loadComponent({ name: 'activityForm', mountEl: formMount });

	let editingActivityId = null;
	let activitiesCache = [];

	function startNew() {
		editingActivityId = null;
		setActivityFormData(formMount, { name: '', hourly_rate: '' });
		if (modalTitleEl) modalTitleEl.textContent = 'New activity';
	}

	function startEdit(activityId) {
		const activity = activitiesCache.find((a) => a.id === activityId);
		if (!activity) return false;
		editingActivityId = activity.id;
		setActivityFormData(formMount, activity);
		if (modalTitleEl) modalTitleEl.textContent = 'Edit activity';
		return true;
	}

	async function removeActivity(activityId) {
		const ok = confirmAction('Delete this activity?');
		if (!ok) return;
		try {
			await deleteActivity(activityId, onBehalfOfUserId);
			showSuccessMessage('Activity deleted');
			await refreshList();
			startNew();
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to delete activity');
		}
	}

	function renderActivities(activities) {
		renderDataTable(tableMount, {
			columns: [
				{ header: 'Name', key: 'name' },
				{
					header: 'Hourly rate',
					getValue: (row) => formatCurrency(Number(row.hourly_rate || 0)),
				},
				{
					header: 'Actions',
					headerClassName: 'text-end',
					className: 'text-end',
					render: (row) => {
						const wrap = document.createElement('div');
						wrap.className = 'd-inline-flex gap-2';

						const editBtn = document.createElement('button');
						editBtn.type = 'button';
						editBtn.className = 'btn btn-sm btn-outline-primary';
						editBtn.textContent = 'Edit';
						editBtn.addEventListener('click', () => {
							const started = startEdit(row.id);
							if (started) activityModal?.show();
						});

						const delBtn = document.createElement('button');
						delBtn.type = 'button';
						delBtn.className = 'btn btn-sm btn-outline-danger';
						delBtn.textContent = 'Delete';
						delBtn.addEventListener('click', () => void removeActivity(row.id));

						wrap.appendChild(editBtn);
						wrap.appendChild(delBtn);
						return wrap;
					}
				}
			],
			rows: activities,
			emptyText: 'No activities yet',
		});
	}

	async function refreshList(searchQuery = '') {
		try {
			const data = searchQuery
				? await searchActivities(searchQuery, onBehalfOfUserId)
				: await listActivities(onBehalfOfUserId);
			activitiesCache = data;
			renderActivities(data);
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load activities');
		}
	}

	const form = formMount.querySelector('#activity-form');
	if (form) {
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			try {
				const data = getActivityFormData(formMount);
				if (editingActivityId) {
					await updateActivity(editingActivityId, data, onBehalfOfUserId);
					showSuccessMessage('Activity updated');
				} else {
					await createActivity(data, onBehalfOfUserId);
					showSuccessMessage('Activity created');
				}

				await refreshList();
				activityModal?.hide();
				startNew();
			} catch (err) {
				showErrorAlert(err?.message || 'Failed to save activity');
			}
		});
	}

	const cancelBtn = formMount.querySelector('#activity-cancel-btn');
	cancelBtn?.addEventListener('click', () => {
		startNew();
		activityModal?.hide();
	});

	const newBtn = document.querySelector('#activity-new-btn');
	newBtn?.addEventListener('click', () => {
		startNew();
		activityModal?.show();
	});

	const searchEl = document.querySelector('#activity-search');
	const searchBtn = document.querySelector('#activity-search-btn');
	const clearBtn = document.querySelector('#activity-clear-btn');

	searchBtn?.addEventListener('click', async () => {
		await refreshList(String(searchEl?.value || '').trim());
	});
	clearBtn?.addEventListener('click', async () => {
		if (searchEl) searchEl.value = '';
		await refreshList('');
	});

	startNew();
	await refreshList();
}

void initActivitiesPage();
