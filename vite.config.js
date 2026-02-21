import { defineConfig } from 'vite';
import { resolve } from 'path';

function cleanUrlsDevPlugin() {
  const routeToHtml = {
    '/': '/index.html',
    '/login': '/src/pages/login/login.html',
    '/register': '/src/pages/register/register.html',
    '/dashboard': '/src/pages/dashboard/dashboard.html',
    '/profile': '/src/pages/profile/profile.html',
    '/companies': '/src/pages/companies/companies.html',
    '/activities': '/src/pages/activities/activities.html',
    '/work-entry': '/src/pages/work-entry/work-entry.html',
    '/reports': '/src/pages/reports/reports.html',
    '/admin-dashboard': '/src/pages/admin-dashboard/admin-dashboard.html',
    '/admin-users': '/src/pages/admin-users/admin-users.html',
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
        register: resolve(__dirname, 'src/pages/register/register.html'),
        login: resolve(__dirname, 'src/pages/login/login.html'),
        dashboard: resolve(__dirname, 'src/pages/dashboard/dashboard.html'),
        profile: resolve(__dirname, 'src/pages/profile/profile.html'),
        companies: resolve(__dirname, 'src/pages/companies/companies.html'),
        activities: resolve(__dirname, 'src/pages/activities/activities.html'),
        workEntry: resolve(__dirname, 'src/pages/work-entry/work-entry.html'),
        reports: resolve(__dirname, 'src/pages/reports/reports.html'),
        adminDashboard: resolve(__dirname, 'src/pages/admin-dashboard/admin-dashboard.html'),
        adminUsers: resolve(__dirname, 'src/pages/admin-users/admin-users.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
