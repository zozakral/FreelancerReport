import { t } from '../../utils/i18n.js';

export function renderDataTable(rootEl, { columns = [], rows = [], emptyText = t('table.noData') } = {}) {
  const headRow = rootEl.querySelector('#data-table-head-row');
  const bodyEl = rootEl.querySelector('#data-table-body');
  const emptyEl = rootEl.querySelector('#data-table-empty');

  if (!headRow || !bodyEl || !emptyEl) {
    throw new Error('DataTable: missing required elements');
  }

  headRow.innerHTML = '';
  columns.forEach((c) => {
    const th = document.createElement('th');
    th.scope = 'col';
    if (c.headerClassName) th.className = c.headerClassName;

    if (c.sortable && typeof c.onHeaderClick === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-link p-0 border-0 text-decoration-none text-reset fw-semibold';

      const directionIndicator = c.sortDirection === 'asc'
        ? ' ↑'
        : c.sortDirection === 'desc'
          ? ' ↓'
          : '';

      btn.textContent = `${c.header || ''}${directionIndicator}`;
      btn.addEventListener('click', () => c.onHeaderClick());
      th.appendChild(btn);
    } else {
      th.textContent = c.header || '';
    }

    headRow.appendChild(th);
  });

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
