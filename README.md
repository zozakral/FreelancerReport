# Work Reporting Web Application

A web application that helps freelancers track completed work and generate monthly work reports.

## Overview

This application enables freelancers to:
- Define companies they work for
- Define work activities with hourly rates
- Log worked hours by company and month
- Generate structured monthly work reports based on predefined templates
- Export reports as PDF documents

## Tech Stack

### Frontend
- **HTML, CSS, JavaScript** - Vanilla JavaScript (no frameworks)
- **Vite** - Build tool and development server
- **Bootstrap 5** - UI framework for responsive design

### Backend
- **Supabase Database** - PostgreSQL database with all application data
- **Supabase Auth** - Authentication (registration, login, logout)
- **Supabase Storage** - File storage for generated PDF reports
- **Supabase RLS** - Row Level Security for data access control

### PDF Generation
- **pdfmake** - Client-side PDF generation library

## Project Structure

```
FreelancerReport/
├── .github/
│   └── copilot-instructions.md    # AI agent guidelines
├── docs/
│   ├── database-schema.md         # Database design documentation
│   └── api-services.md            # Service layer documentation
├── src/
│   ├── config/
│   │   └── supabase.js            # Supabase client configuration
│   ├── services/
│   │   ├── auth.js                # Authentication service
│   │   ├── users.js               # User management (admin)
│   │   ├── companies.js           # Company CRUD operations
│   │   ├── activities.js          # Activity CRUD operations
│   │   ├── workEntries.js         # Work entry CRUD operations
│   │   ├── reportConfigs.js       # Report configuration operations
│   │   ├── reportGenerator.js     # Report generation logic
│   │   └── pdfGenerator.js        # PDF generation with pdfmake
│   ├── utils/
│   │   └── permissions.js         # Role checking utilities
│   ├── components/
│   │   └── userSelector.js        # Admin user selector dropdown
│   └── styles/
│       └── main.css               # Global styles
├── supabase/
│   ├── migrations/                # Database migration scripts
│   └── seed/
│       └── templates.sql          # Predefined report templates
├── pages/
│   ├── register.html              # User registration
│   ├── login.html                 # User login
│   ├── dashboard.html             # Freelancer dashboard
│   ├── profile.html               # User profile page
│   ├── companies.html             # Companies management
│   ├── activities.html            # Activities management
│   ├── work-entry.html            # Work entry page
│   ├── reports.html               # Report generation page
│   └── admin/
│       ├── dashboard.html         # Admin dashboard
│       └── users.html             # User management
├── index.html                     # Landing page
├── package.json                   # Dependencies
├── vite.config.js                 # Vite configuration
└── .env.example                   # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env`
3. Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run Database Migrations

```bash
# If using Supabase CLI locally
supabase start
supabase db reset

# Or run migrations directly in Supabase Studio SQL editor
```

Execute migration scripts from `supabase/migrations/` in order.

### 4. Seed Report Templates

Run the seed script from `supabase/seed/templates.sql` in Supabase Studio SQL editor.

### 5. Start Development Server

```bash
npm run dev
```

The application will open at http://localhost:3000

## User Roles

### Freelancer (Default)
- Manage own companies, activities, and work entries
- Generate and download work reports
- View and edit profile

### Admin
- All Freelancer capabilities
- Manage all users (create, edit, delete)
- Access all data across all users
- Operate on behalf of any freelancer using user selector dropdown

## Key Features

### Admin Impersonation
Admin users can select any freelancer from a dropdown at the top of admin pages. All operations will be performed on behalf of the selected user.

### PDF Report Generation
Reports can be:
- **Downloaded immediately** - Generate and download without saving
- **Saved to storage** - Upload to Supabase Storage for later access

### Work Entry Management
- One work entry per activity per company per month
- Automatic calculation of totals based on hours × hourly rate
- Easy editing and updating of monthly work data

## Architecture Decisions

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed architecture and coding conventions.

## Database Schema

See [docs/database-schema.md](docs/database-schema.md) for complete database design and relationships.

## API Services

See [docs/api-services.md](docs/api-services.md) for service layer architecture and patterns.

## License

MIT
