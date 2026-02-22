import { applyTranslations } from '../utils/i18n.js';

const LOADED_CSS_HREFS = new Set();

function ensureStylesheet(href) {
  if (!href) return;
  if (LOADED_CSS_HREFS.has(href)) return;

  const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
  if (existing) {
    LOADED_CSS_HREFS.add(href);
    return;
  }

  const linkEl = document.createElement('link');
  linkEl.rel = 'stylesheet';
  linkEl.href = href;
  document.head.appendChild(linkEl);
  LOADED_CSS_HREFS.add(href);
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'Accept': 'text/html' } });
  if (!res.ok) {
    throw new Error(`Failed to load fragment: ${url} (${res.status})`);
  }
  return await res.text();
}

/**
 * Loads a UI component (HTML fragment + optional CSS + optional JS init) into a mount element.
 */
export async function loadComponent({
  name,
  mountEl,
  htmlUrl = `/src/components/${name}/${name}.html`,
  cssUrl = `/src/components/${name}/${name}.css`,
  jsUrl = `/src/components/${name}/${name}.js`,
  initExport,
  initArgs = [],
} = {}) {
  if (!name) throw new Error('Component name is required');
  if (!mountEl) throw new Error(`Mount element is required for component: ${name}`);

  ensureStylesheet(cssUrl);

  const html = await fetchText(htmlUrl);
  mountEl.innerHTML = html;
  applyTranslations(mountEl);

  if (initExport) {
    const mod = await import(/* @vite-ignore */ jsUrl);
    const initFn = mod?.[initExport];
    if (typeof initFn === 'function') {
      await initFn(mountEl, ...initArgs);
    }
  }
}
