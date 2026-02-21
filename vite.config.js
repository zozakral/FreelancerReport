import { defineConfig } from 'vite';
import { resolve } from 'path';

function cleanUrlsDevPlugin() {
  const routeToHtml = {
    '/': '/index.html',
    '/login': '/login/index.html',
    '/register': '/register/index.html',
    '/dashboard': '/dashboard/index.html',
    '/profile': '/profile/index.html',
    '/companies': '/companies/index.html',
    '/activities': '/activities/index.html',
    '/work-entry': '/work-entry/index.html',
    '/reports': '/reports/index.html',
    '/admin-dashboard': '/admin-dashboard/index.html',
    '/admin-users': '/admin-users/index.html',
  };

  function normalizePathname(urlPath) {
    if (!urlPath) return '/';
    const pathname = urlPath.split('?')[0].split('#')[0];
    if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
    return pathname;
  }

  function shouldIgnore(pathname) {
    if (pathname === '/index.html') return true;
    if (pathname.startsWith('/@')) return true;
    if (pathname.startsWith('/src/')) return true;
    if (pathname.startsWith('/node_modules/')) return true;
    if (pathname.startsWith('/assets/')) return true;
    if (pathname.includes('.')) return true;
    return false;
  }

  return {
    name: 'clean-urls-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const originalUrl = req.url || '/';
        const pathname = normalizePathname(originalUrl);

        if (shouldIgnore(pathname)) return next();

        const target = routeToHtml[pathname];
        if (target) {
          const queryIndex = originalUrl.indexOf('?');
          const query = queryIndex >= 0 ? originalUrl.slice(queryIndex) : '';
          req.url = `${target}${query}`;
        }

        return next();
      });
    },
  };
}

export default defineConfig({
  root: '.',
  plugins: [cleanUrlsDevPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'register/index.html'),
        login: resolve(__dirname, 'login/index.html'),
        dashboard: resolve(__dirname, 'dashboard/index.html'),
        profile: resolve(__dirname, 'profile/index.html'),
        companies: resolve(__dirname, 'companies/index.html'),
        activities: resolve(__dirname, 'activities/index.html'),
        workEntry: resolve(__dirname, 'work-entry/index.html'),
        reports: resolve(__dirname, 'reports/index.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard/index.html'),
        adminUsers: resolve(__dirname, 'admin-users/index.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
