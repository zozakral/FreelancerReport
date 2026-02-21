import { bootstrapPage } from '../../core/bootstrapPage.js';
import { loadComponent } from '../../core/componentLoader.js';
import { listUsers, searchUsers, updateUser, deleteUser } from '../../services/users.js';
import { renderDataTable } from '../../components/dataTable/dataTable.js';
import { confirmAction, showErrorAlert, showSuccessMessage } from '../../utils/ui.js';

export async function initAdminUsersPage() {
	await bootstrapPage({ title: 'Admin Users' });

	const tableMount = document.querySelector('#users-table-mount');
	if (!tableMount) return;

	await loadComponent({ name: 'dataTable', mountEl: tableMount });

	const searchEl = document.querySelector('#users-search');
	const searchBtn = document.querySelector('#users-search-btn');
	const clearBtn = document.querySelector('#users-clear-btn');

	const form = document.querySelector('#user-edit-form');
	const idEl = document.querySelector('#user-edit-id');
	const nameEl = document.querySelector('#user-edit-name');
	const roleEl = document.querySelector('#user-edit-role');
	const cancelBtn = document.querySelector('#user-edit-cancel');

	let usersCache = [];
	let editingUserId = null;

	function clearEditor() {
		editingUserId = null;
		if (idEl) idEl.value = '';
		if (nameEl) nameEl.value = '';
		if (roleEl) roleEl.value = 'freelancer';
	}

	function startEdit(userId) {
		const user = usersCache.find((u) => u.id === userId);
		if (!user) return;
		editingUserId = user.id;
		if (idEl) idEl.value = user.id;
		if (nameEl) nameEl.value = user.full_name || '';
		if (roleEl) roleEl.value = user.role || 'freelancer';
	}

	async function removeUser(userId) {
		const ok = confirmAction('Delete this profile? (Auth user will remain)');
		if (!ok) return;
		try {
			await deleteUser(userId);
			showSuccessMessage('User profile deleted');
			await refreshList('');
			clearEditor();
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to delete user');
		}
	}

	function renderUsers(users) {
		renderDataTable(tableMount, {
			columns: [
				{ header: 'Full name', key: 'full_name' },
				{ header: 'Role', key: 'role' },
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
						editBtn.addEventListener('click', () => startEdit(row.id));

						const delBtn = document.createElement('button');
						delBtn.type = 'button';
						delBtn.className = 'btn btn-sm btn-outline-danger';
						delBtn.textContent = 'Delete';
						delBtn.addEventListener('click', () => void removeUser(row.id));

						wrap.appendChild(editBtn);
						wrap.appendChild(delBtn);
						return wrap;
					}
				}
			],
			rows: users,
			emptyText: 'No users',
		});
	}

	async function refreshList(searchQuery = '') {
		try {
			const data = searchQuery ? await searchUsers(searchQuery) : await listUsers();
			usersCache = data;
			renderUsers(data);
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load users');
		}
	}

	searchBtn?.addEventListener('click', async () => {
		await refreshList(String(searchEl?.value || '').trim());
	});
	clearBtn?.addEventListener('click', async () => {
		if (searchEl) searchEl.value = '';
		await refreshList('');
	});

	cancelBtn?.addEventListener('click', () => clearEditor());

	form?.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!editingUserId) {
			showErrorAlert('Select a user to edit');
			return;
		}

		try {
			await updateUser(editingUserId, {
				full_name: String(nameEl?.value || '').trim(),
				role: String(roleEl?.value || 'freelancer'),
			});
			showSuccessMessage('User updated');
			await refreshList(String(searchEl?.value || '').trim());
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to update user');
		}
	});

	clearEditor();
	await refreshList('');
}

void initAdminUsersPage();
