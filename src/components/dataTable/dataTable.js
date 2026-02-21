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

  headRow.innerHTML = columns
    .map((c) => {
      const cls = c.headerClassName ? ` class="${escapeHtml(c.headerClassName)}"` : '';
      return `<th scope="col"${cls}>${escapeHtml(c.header || '')}</th>`;
    })
    .join('');

  bodyEl.innerHTML = '';
  rows.forEach((row) => {
    const tr = document.createElement('tr');

    columns.forEach((c) => {
      const td = document.createElement('td');
      if (c.className) td.className = c.className;

      if (typeof c.render === 'function') {
        const rendered = c.render(row);
        if (rendered instanceof Node) {
          td.appendChild(rendered);
        } else if (rendered !== undefined && rendered !== null) {
          td.textContent = String(rendered);
        }
      } else if (typeof c.renderHtml === 'function') {
        td.innerHTML = c.renderHtml(row);
      } else {
        const value = typeof c.getValue === 'function' ? c.getValue(row) : row?.[c.key];
        td.textContent = value ?? '';
      }

      tr.appendChild(td);
    });

    bodyEl.appendChild(tr);
  });

  const isEmpty = rows.length === 0;
  emptyEl.textContent = emptyText;
  emptyEl.classList.toggle('d-none', !isEmpty);
}
