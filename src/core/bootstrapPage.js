import { loadComponent } from './componentLoader.js';
import { initAppShell } from './appShell.js';

export async function bootstrapPage({
  title,
  appSelector = '#app',
  templateSelector = '#page-content-template',
  contentSelector = '#page-content',
} = {}) {
  if (title) document.title = title;

  const appEl = document.querySelector(appSelector);
  if (!appEl) throw new Error(`Missing app mount element: ${appSelector}`);

  await loadComponent({
    name: 'pageShell',
    mountEl: appEl,
    initExport: null,
  });

  await initAppShell();

  const templateEl = document.querySelector(templateSelector);
  const contentEl = document.querySelector(contentSelector);
  if (!contentEl) throw new Error(`Missing content element: ${contentSelector}`);

  if (templateEl) {
    contentEl.innerHTML = templateEl.innerHTML;
  }
}
