import { bootstrapPage } from '../../core/bootstrapPage.js';
import { loadComponent } from '../../core/componentLoader.js';
import { initAdminUserSelector } from '../../core/adminImpersonation.js';
import { listCompanies, searchCompanies, createCompany, updateCompany, deleteCompany } from '../../services/companies.js';
import { renderDataTable } from '../../components/dataTable/dataTable.js';
import { getCompanyFormData, setCompanyFormData } from '../../components/companyForm/companyForm.js';
import { confirmAction, showErrorAlert, showSuccessMessage } from '../../utils/ui.js';
import { redirectIfNotAuthenticated } from '../../services/auth.js';
import { t } from '../../utils/i18n.js';

export async function initCompaniesPage() {
	if (await redirectIfNotAuthenticated()) return;
	await bootstrapPage({ title: t('title.companies') });

	const adminMount = document.querySelector('#admin-user-selector-mount');
	let onBehalfOfUserId = null;

	const { selectedUserId } = await initAdminUserSelector({
		mountEl: adminMount,
		onChange: async (userId) => {
			onBehalfOfUserId = userId;
			await refreshList();
			startNew();
		},
	});
	onBehalfOfUserId = selectedUserId || null;

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

	function updateModalTitle() {
		if (!modalTitleEl) return;
		modalTitleEl.textContent = editingCompanyId
			? t('companies.modal.editTitle')
			: t('companies.modal.newTitle');
	}

	function startNew() {
		editingCompanyId = null;
		setCompanyFormData(formMount, { name: '', tax_number: '', city: '' });
		updateModalTitle();
	}

	function startEdit(companyId) {
		const company = companiesCache.find((c) => c.id === companyId);
		if (!company) return false;
		editingCompanyId = company.id;
		setCompanyFormData(formMount, company);
		updateModalTitle();
		return true;
	}

	async function removeCompany(companyId) {
		const ok = confirmAction(t('confirm.deleteCompany'));
		if (!ok) return;
		try {
			await deleteCompany(companyId, onBehalfOfUserId);
			showSuccessMessage(t('messages.companyDeleted'));
			await refreshList();
			startNew();
		} catch (err) {
			showErrorAlert(err?.message || t('messages.companyDeleteFailed'));
		}
	}

	function renderCompanies(companies) {
		renderDataTable(tableMount, {
			columns: [
				{ header: t('table.name'), key: 'name' },
				{ header: t('table.taxNumber'), key: 'tax_number' },
				{ header: t('table.city'), key: 'city' },
				{
					header: t('table.actions'),
					headerClassName: 'text-end',
					className: 'text-end',
					render: (row) => {
						const wrap = document.createElement('div');
						wrap.className = 'd-inline-flex gap-2';

						const editBtn = document.createElement('button');
						editBtn.type = 'button';
						editBtn.className = 'btn btn-sm btn-outline-primary';
						editBtn.textContent = t('actions.edit');
						editBtn.addEventListener('click', () => {
							const started = startEdit(row.id);
							if (started) companyModal?.show();
						});

						const delBtn = document.createElement('button');
						delBtn.type = 'button';
						delBtn.className = 'btn btn-sm btn-outline-danger';
						delBtn.textContent = t('actions.delete');
						delBtn.addEventListener('click', () => void removeCompany(row.id));

						wrap.appendChild(editBtn);
						wrap.appendChild(delBtn);
						return wrap;
					}
				}
			],
			rows: companies,
			emptyText: t('table.noCompanies'),
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
			showErrorAlert(err?.message || t('messages.companyLoadFailed'));
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
					showSuccessMessage(t('messages.companyUpdated'));
				} else {
					await createCompany(data, onBehalfOfUserId);
					showSuccessMessage(t('messages.companyCreated'));
				}

				await refreshList();
				companyModal?.hide();
				startNew();
			} catch (err) {
				showErrorAlert(err?.message || t('messages.companySaveFailed'));
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

	window.addEventListener('languagechange', () => {
		renderCompanies(companiesCache);
		updateModalTitle();
	});
}

void initCompaniesPage();
