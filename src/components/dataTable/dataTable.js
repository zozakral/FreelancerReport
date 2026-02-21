function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderDataTable(rootEl, { columns = [], rows = [], emptyText = 'No data' } = {}) {
  const headRow = rootEl.querySelector('#data-table-head-row');
  const bodyEl = rootEl.querySelector('#data-table-body');
  const emptyEl = rootEl.querySelector('#data-table-empty');

  if (!headRow || !bodyEl || !emptyEl) {
    throw new Error('DataTable: missing required elements');
  }

  headRow.innerHTML = columns.map((c) => `<th scope="col">${escapeHtml(c.header || '')}</th>`).join('');
  bodyEl.innerHTML = rows
    .map((row) => {
      const tds = columns
        .map((c) => {
          const value = typeof c.getValue === 'function' ? c.getValue(row) : row?.[c.key];
          return `<td>${escapeHtml(value ?? '')}</td>`;
        })
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  const isEmpty = rows.length === 0;
  emptyEl.textContent = emptyText;
  emptyEl.classList.toggle('d-none', !isEmpty);
}
