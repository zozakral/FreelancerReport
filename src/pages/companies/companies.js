import { bootstrapPage } from '../../core/bootstrapPage.js';
import { loadComponent } from '../../core/componentLoader.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies, searchCompanies, createCompany, updateCompany, deleteCompany } from '../../services/companies.js';
import { renderDataTable } from '../../components/dataTable/dataTable.js';
import { getCompanyFormData, setCompanyFormData } from '../../components/companyForm/companyForm.js';
import { confirmAction, showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';

export async function initCompaniesPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: 'Companies' });

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

	const tableMount = document.querySelector('#companies-table-mount');
	const formMount = document.querySelector('#company-form-mount');
	const modalEl = document.querySelector('#company-form-modal');
	const modalTitleEl = document.querySelector('#company-form-modal-title');
	if (!tableMount || !formMount || !modalEl) return;

	const companyModal = window.bootstrap?.Modal ? new window.bootstrap.Modal(modalEl) : null;

	await loadComponent({ name: 'dataTable', mountEl: tableMount });
	await loadComponent({ name: 'companyForm', mountEl: formMount });

	let editingCompanyId = null;
	let companiesCache = [];

	function startNew() {
		editingCompanyId = null;
		setCompanyFormData(formMount, { name: '', tax_number: '', city: '' });
		if (modalTitleEl) modalTitleEl.textContent = 'New company';
	}

	function startEdit(companyId) {
		const company = companiesCache.find((c) => c.id === companyId);
		if (!company) return false;
		editingCompanyId = company.id;
		setCompanyFormData(formMount, company);
		if (modalTitleEl) modalTitleEl.textContent = 'Edit company';
		return true;
	}

	async function removeCompany(companyId) {
		const ok = confirmAction('Delete this company?');
		if (!ok) return;
		try {
			await deleteCompany(companyId, onBehalfOfUserId);
			showSuccessMessage('Company deleted');
			await refreshList();
			startNew();
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to delete company');
		}
	}

	function renderCompanies(companies) {
		renderDataTable(tableMount, {
			columns: [
				{ header: 'Name', key: 'name' },
				{ header: 'Tax #', key: 'tax_number' },
				{ header: 'City', key: 'city' },
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
							if (started) companyModal?.show();
						});

						const delBtn = document.createElement('button');
						delBtn.type = 'button';
						delBtn.className = 'btn btn-sm btn-outline-danger';
						delBtn.textContent = 'Delete';
						delBtn.addEventListener('click', () => void removeCompany(row.id));

						wrap.appendChild(editBtn);
						wrap.appendChild(delBtn);
						return wrap;
					}
				}
			],
			rows: companies,
			emptyText: 'No companies yet',
		});
	}

	async function refreshList(searchQuery = '') {
		try {
			const data = searchQuery
				? await searchCompanies(searchQuery, onBehalfOfUserId)
				: await listCompanies(onBehalfOfUserId);
			companiesCache = data;
			renderCompanies(data);
		} catch (err) {
			showErrorAlert(err?.message || 'Failed to load companies');
		}
	}

	const form = formMount.querySelector('#company-form');
	if (form) {
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			try {
				const data = getCompanyFormData(formMount);
				if (editingCompanyId) {
					await updateCompany(editingCompanyId, data, onBehalfOfUserId);
					showSuccessMessage('Company updated');
				} else {
					await createCompany(data, onBehalfOfUserId);
					showSuccessMessage('Company created');
				}

				await refreshList();
				companyModal?.hide();
				startNew();
			} catch (err) {
				showErrorAlert(err?.message || 'Failed to save company');
			}
		});
	}

	const cancelBtn = formMount.querySelector('#company-cancel-btn');
	cancelBtn?.addEventListener('click', () => {
		startNew();
		companyModal?.hide();
	});

	const newBtn = document.querySelector('#company-new-btn');
	newBtn?.addEventListener('click', () => {
		startNew();
		companyModal?.show();
	});

	const searchEl = document.querySelector('#company-search');
	const searchBtn = document.querySelector('#company-search-btn');
	const clearBtn = document.querySelector('#company-clear-btn');

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

void initCompaniesPage();
