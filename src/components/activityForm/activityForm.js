export function getActivityFormData(rootEl) {
  const form = rootEl.querySelector('#activity-form');
  if (!form) throw new Error('ActivityForm: missing form');
  const formData = new FormData(form);
  const raw = Object.fromEntries(formData.entries());
  return {
    ...raw,
    hourly_rate: raw.hourly_rate === '' ? null : Number(raw.hourly_rate),
  };
}

export function setActivityFormData(rootEl, data = {}) {
  const form = rootEl.querySelector('#activity-form');
  if (!form) throw new Error('ActivityForm: missing form');

  const nameEl = form.querySelector('[name="name"]');
  const rateEl = form.querySelector('[name="hourly_rate"]');

  if (nameEl) nameEl.value = data.name ?? '';
  if (rateEl) rateEl.value = data.hourly_rate ?? '';
}
