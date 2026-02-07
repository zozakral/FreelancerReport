import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        register: resolve(__dirname, 'pages/register.html'),
        login: resolve(__dirname, 'pages/login.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        companies: resolve(__dirname, 'pages/companies.html'),
        activities: resolve(__dirname, 'pages/activities.html'),
        workEntry: resolve(__dirname, 'pages/work-entry.html'),
        reports: resolve(__dirname, 'pages/reports.html'),
        admin: resolve(__dirname, 'pages/admin/dashboard.html'),
        adminUsers: resolve(__dirname, 'pages/admin/users.html'),
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
