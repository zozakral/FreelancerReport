import { loadComponent } from './componentLoader.js';

export async function initAppShell() {
  const headerContainer = document.querySelector('#header-container');
  const footerContainer = document.querySelector('#footer-container');

  if (headerContainer) {
    await loadComponent({
      name: 'header',
      mountEl: headerContainer,
      initExport: 'initHeader',
    });
  }

  if (footerContainer) {
    await loadComponent({
      name: 'footer',
      mountEl: footerContainer,
      initExport: 'initFooter',
    });
  }
}
