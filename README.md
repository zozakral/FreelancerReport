# Work Reporting Web Application

Multi-page web application for freelancers to manage monthly work data and generate PDF reports.

## Overview

The app supports:
- Company management
- Activity management with hourly rates
- Monthly work entry by company/activity
- Report configuration and PDF generation
- Optional PDF upload to Supabase Storage
- Role-based access (freelancer/admin)
- UI localization (Bulgarian default, English available)

## Implemented Frontend (Current)

### Routes and pages

| Route | Purpose | Main module |
| --- | --- | --- |
| `/` | Public landing page | `src/pages/home/home.js` |
| `/login` | Sign in form | `src/pages/login/login.js` |
| `/register` | Sign up form | `src/pages/register/register.js` |
| `/dashboard` | Authenticated landing page | `src/pages/dashboard/dashboard.js` |
| `/profile` | View/update current user profile | `src/pages/profile/profile.js` |
| `/companies` | Company CRUD + search (admin impersonation supported) | `src/pages/companies/companies.js` |
| `/activities` | Activity CRUD + search + sorting (admin impersonation supported) | `src/pages/activities/activities.js` |
| `/work-entry` | Monthly hours grid, totals (hours/days/amount), upsert/delete entries | `src/pages/work-entry/workEntry.js` |
| `/reports` | Report config, template selection, generate/download/save PDF | `src/pages/reports/reports.js` |
| `/admin-dashboard` | Admin-only page shell entry | `src/pages/admin-dashboard/adminDashboard.js` |
| `/admin-users` | Admin-only user list/search/edit/delete | `src/pages/admin-users/adminUsers.js` |

### Frontend behavior

- Multi-page architecture (top-level route folders with `index.html`)
- Shared shell/bootstrap (`bootstrapPage`) and reusable components
- Admin impersonation via global user selector on supported pages
- Form-first CRUD UX with Bootstrap modals for edit/create where applicable
- Month/year controls on work-entry and reports pages
- Client-side PDF generation (`pdfmake`) with optional storage upload

## Tech Stack

### Frontend
- HTML, CSS, JavaScript (Vanilla, ES modules)
- Vite 5
- Bootstrap 5

### Backend (Supabase)
- Postgres database
- Supabase Auth
- Supabase Storage (`work-reports` bucket)
- Row Level Security (RLS)

### PDF
- pdfmake

## Project Structure

```
FreelancerReport/
├── docs/
│   ├── api-services.md
│   └── database-schema.md
├── src/
│   ├── components/
│   ├── config/
│   ├── core/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── supabase/
│   ├── migrations/
│   └── seed/
├── activities/index.html
├── admin-dashboard/index.html
├── admin-users/index.html
├── companies/index.html
├── dashboard/index.html
├── login/index.html
├── profile/index.html
├── register/index.html
├── reports/index.html
├── work-entry/index.html
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3) Apply database migrations

```bash
supabase start
supabase db reset
```

Or execute SQL migration files from `supabase/migrations/` in order inside Supabase SQL Editor.

### 4) Seed report templates

Execute `supabase/seed/templates.sql` (or Bulgarian template seed files, if needed).

### 5) Run app

```bash
npm run dev
```

Dev server: `http://localhost:3000`

## Database Schema (Implemented)

### Entity relationships

```text
auth.users (Supabase)
   1 ─── 1 profiles
profiles
   1 ─── * companies
   1 ─── * activities
   1 ─── * work_entries
   1 ─── * report_configs
   1 ─── * generated_reports

companies
   1 ─── * work_entries
   1 ─── * generated_reports
   1 ─── 1 report_configs (per user+company)

report_templates
   1 ─── * report_configs

activities
   1 ─── * work_entries
```

### Tables

#### `profiles`
- PK: `id` (FK to `auth.users.id`)
- Columns: `role` (`freelancer|admin`), `full_name`, timestamps
- Purpose: role + display identity for app users

#### `companies`
- PK: `id`
- FK: `user_id -> profiles.id`
- Columns: `name`, `tax_number`, `city`, timestamps
- Purpose: user-scoped client/company catalog

#### `activities`
- PK: `id`
- FK: `user_id -> profiles.id`
- Columns: `name`, `hourly_rate > 0`, timestamps
- Purpose: user-scoped activity catalog and pricing

#### `report_templates`
- PK: `id`
- Columns: `name` (unique), `description`, `template_definition` (JSONB), `styles` (JSONB), `created_at`
- Purpose: global PDF template definitions

#### `report_configs`
- PK: `id`
- FK: `user_id -> profiles.id`, `company_id -> companies.id`, `template_id -> report_templates.id`
- Columns: `intro_text`, `outro_text`, `location`, timestamps
- Constraint: `UNIQUE(user_id, company_id)`
- Purpose: one report configuration per user/company

#### `work_entries`
- PK: `id`
- FK: `user_id -> profiles.id`, `activity_id -> activities.id`, `company_id -> companies.id`
- Columns: `month` (DATE, month start), `hours > 0`, timestamps
- Constraint: `UNIQUE(user_id, activity_id, company_id, month)`
- Purpose: monthly tracked hours per activity and company

#### `generated_reports`
- PK: `id`
- FK: `user_id -> profiles.id`, `company_id -> companies.id`
- Columns: `report_period`, `report_date`, `file_path`, `save_to_storage`, `created_at`
- Purpose: metadata/audit for generated reports

### Security model

- RLS enabled on all application tables
- Access pattern: owner rows (`user_id = auth.uid()`) or admin (`is_admin()`)
- `report_templates`: authenticated users can `SELECT`; only admins can mutate
- Storage bucket: `work-reports` (private) with policies by first folder segment (`{user_id}/...`) or admin override

## Service Layer

- Service modules are in `src/services/` (`auth`, `users`, `profiles`, `companies`, `activities`, `workEntries`, `reportConfigs`, `reportGenerator`, `pdfGenerator`)
- All page modules consume services; pages do not query Supabase directly

See detailed docs:
- [API services](docs/api-services.md)
- [Database schema](docs/database-schema.md)

## License

MIT
