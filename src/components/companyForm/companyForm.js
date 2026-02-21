export function getCompanyFormData(rootEl) {
  const form = rootEl.querySelector('#company-form');
  if (!form) throw new Error('CompanyForm: missing form');
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

export function setCompanyFormData(rootEl, data = {}) {
  const form = rootEl.querySelector('#company-form');
  if (!form) throw new Error('CompanyForm: missing form');

  const nameEl = form.querySelector('[name="name"]');
  const taxEl = form.querySelector('[name="tax_number"]');
  const cityEl = form.querySelector('[name="city"]');

  if (nameEl) nameEl.value = data.name ?? '';
  if (taxEl) taxEl.value = data.tax_number ?? '';
  if (cityEl) cityEl.value = data.city ?? '';
}
