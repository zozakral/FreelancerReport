import { getLocale } from '../../utils/i18n.js';

const YEAR_RANGE_PAST = 5;
const YEAR_RANGE_FUTURE = 2;

function buildMonthOptions(locale) {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const label = formatter.format(new Date(2020, index, 1));
    return { value: String(monthNumber).padStart(2, '0'), label };
  });
}

function buildYearOptions() {
  const now = new Date();
  const start = now.getFullYear() - YEAR_RANGE_PAST;
  const end = now.getFullYear() + YEAR_RANGE_FUTURE;
  const years = [];
  for (let year = start; year <= end; year += 1) {
    years.push(String(year));
  }
  return years;
}

function ensureControls(rootEl) {
  const monthSelect = rootEl.querySelector('#month-selector-month');
  const yearSelect = rootEl.querySelector('#month-selector-year');
  const input = rootEl.querySelector('#month-selector-input');
  if (!monthSelect || !yearSelect || !input) return null;

  if (!rootEl.dataset.monthSelectorReady) {
    monthSelect.addEventListener('change', () => syncHiddenValue(monthSelect, yearSelect, input));
    yearSelect.addEventListener('change', () => syncHiddenValue(monthSelect, yearSelect, input));
    window.addEventListener('languagechange', () => {
      ensureControls(rootEl);
      syncHiddenValue(monthSelect, yearSelect, input);
    });
    rootEl.dataset.monthSelectorReady = 'true';
  }

  const locale = getLocale();
  const selectedMonth = monthSelect.value;
  const selectedYear = yearSelect.value;

  monthSelect.innerHTML = buildMonthOptions(locale)
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join('');
  yearSelect.innerHTML = buildYearOptions()
    .map((year) => `<option value="${year}">${year}</option>`)
    .join('');

  if (selectedMonth) monthSelect.value = selectedMonth;
  if (selectedYear) yearSelect.value = selectedYear;

  return { monthSelect, yearSelect, input };
}

function syncHiddenValue(monthSelect, yearSelect, input) {
  const month = monthSelect.value;
  const year = yearSelect.value;
  if (!month || !year) return;
  input.value = `${year}-${month}`;
}

export function getSelectedMonth(rootEl) {
  const controls = ensureControls(rootEl);
  if (!controls) return '';
  const { input } = controls;
  return input.value || '';
}

export function setSelectedMonth(rootEl, value) {
  const controls = ensureControls(rootEl);
  if (!controls) return;

  const { monthSelect, yearSelect, input } = controls;
  const raw = String(value || '');
  if (!raw) {
    input.value = '';
    return;
  }

  const [year, month] = raw.split('-');
  if (year && month) {
    yearSelect.value = year;
    monthSelect.value = month;
    syncHiddenValue(monthSelect, yearSelect, input);
  }
}
