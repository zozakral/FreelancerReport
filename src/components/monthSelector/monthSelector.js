export function getSelectedMonth(rootEl) {
  const input = rootEl.querySelector('#month-selector-input');
  return input?.value || '';
}

export function setSelectedMonth(rootEl, value) {
  const input = rootEl.querySelector('#month-selector-input');
  if (input) input.value = value || '';
}
