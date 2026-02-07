# Database Schema Documentation

## Overview

The database schema supports a multi-tenant work reporting system with role-based access control. Each freelancer manages their own companies, activities, and work entries. Admins can access and manage all data.

## Tables

### profiles

Extended user profile information linked to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'freelancer' CHECK (role IN ('freelancer', 'admin')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `id` - References auth.users.id (Supabase Auth)
- `role` - User role: 'freelancer' (default) or 'admin'
- `full_name` - User's full name for display and reports
- `created_at` - Account creation timestamp
- `updated_at` - Last profile update timestamp

**Relationships:**
- One-to-one with `auth.users`
- One-to-many with `companies`, `activities`, `work_entries`, `report_configs`, `generated_reports`

**Indexes:**
- Primary key on `id`
- Index on `role` for admin queries

---

### companies

Companies that freelancers work for.

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tax_number TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique company identifier
- `user_id` - Owner (freelancer) of this company record
- `name` - Company name (required for reports)
- `tax_number` - Tax identification number
- `city` - Company city/location
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**
- Many-to-one with `profiles` (via user_id)
- One-to-many with `work_entries`, `report_configs`, `generated_reports`

**Indexes:**
- Primary key on `id`
- Index on `user_id` for user queries
- Index on `name` for search functionality

**Constraints:**
- `user_id` NOT NULL (every company belongs to a user)
- `name` NOT NULL

---

### activities

Work activities with hourly rates defined by freelancers.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique activity identifier
- `user_id` - Owner (freelancer) of this activity
- `name` - Activity name/description
- `hourly_rate` - Rate per hour (must be positive)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**
- Many-to-one with `profiles` (via user_id)
- One-to-many with `work_entries`

**Indexes:**
- Primary key on `id`
- Index on `user_id` for user queries
- Index on `name` for search functionality

**Constraints:**
- `user_id` NOT NULL
- `name` NOT NULL
- `hourly_rate` > 0 (positive values only)

---

### report_templates

Predefined PDF report templates using pdfmake document definitions.

```sql
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  template_definition JSONB NOT NULL,
  styles JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique template identifier
- `name` - Template name (e.g., "Formal", "Modern", "Minimal")
- `description` - Template description for users
- `template_definition` - pdfmake document definition as JSON with placeholders
- `styles` - pdfmake styles definition as JSON
- `created_at` - Template creation timestamp

**Relationships:**
- One-to-many with `report_configs`

**Indexes:**
- Primary key on `id`
- Unique constraint on `name`

**Notes:**
- Global templates (not user-specific)
- Seeded with predefined templates
- Contains placeholders like `{{companyName}}`, `{{activitiesTable}}`, etc.

---

### report_configs

User-specific report configurations linking companies and templates.

```sql
CREATE TABLE report_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE RESTRICT,
  intro_text TEXT,
  outro_text TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);
```

**Columns:**
- `id` - Unique configuration identifier
- `user_id` - Owner (freelancer) of this configuration
- `company_id` - Company this config applies to
- `template_id` - Selected report template
- `intro_text` - Custom introductory text for reports
- `outro_text` - Custom concluding text for reports
- `location` - Report location (e.g., "Sofia, Bulgaria")
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**
- Many-to-one with `profiles` (via user_id)
- Many-to-one with `companies` (via company_id)
- Many-to-one with `report_templates` (via template_id)

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `company_id`
- Unique constraint on `(user_id, company_id)` - one config per user per company

**Constraints:**
- ON DELETE RESTRICT for template_id (prevent deleting used templates)

---

### work_entries

Individual work entries tracking hours worked per activity per company per month.

```sql
CREATE TABLE work_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  hours DECIMAL(10, 2) NOT NULL CHECK (hours > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, activity_id, company_id, month)
);
```

**Columns:**
- `id` - Unique work entry identifier
- `user_id` - Owner (freelancer) who performed the work
- `activity_id` - Activity performed
- `company_id` - Company work was performed for
- `month` - Month of work (stored as first day of month, e.g., '2026-01-01')
- `hours` - Hours worked (must be positive)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Relationships:**
- Many-to-one with `profiles` (via user_id)
- Many-to-one with `activities` (via activity_id)
- Many-to-one with `companies` (via company_id)

**Indexes:**
- Primary key on `id`
- Index on `user_id`
- Index on `company_id, month` (for report generation queries)
- Unique constraint on `(user_id, activity_id, company_id, month)`

**Constraints:**
- `hours` > 0 (positive values only)
- Unique combination ensures one entry per activity per company per month

**Usage Pattern:**
- Upsert operations when user updates hours for existing month/activity/company
- Queries grouped by `company_id` and `month` for report generation

---

### generated_reports

Metadata for generated PDF reports (optional storage).

```sql
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  report_period DATE NOT NULL,
  report_date DATE NOT NULL,
  file_path TEXT,
  save_to_storage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique report identifier
- `user_id` - Freelancer who generated the report
- `company_id` - Company the report is for
- `report_period` - Month of the report (e.g., '2026-01-01')
- `report_date` - Date shown on the report document
- `file_path` - Path in Supabase Storage (if saved)
- `save_to_storage` - Whether PDF was saved to storage or just downloaded
- `created_at` - Report generation timestamp

**Relationships:**
- Many-to-one with `profiles` (via user_id)
- Many-to-one with `companies` (via company_id)

**Indexes:**
- Primary key on `id`
- Index on `user_id, created_at DESC` (for user's report history)
- Index on `company_id, report_period` (for finding existing reports)

**Notes:**
- Only populated when user chooses to save report
- Provides audit trail and re-download capability
- File path format: `work-reports/{user_id}/{company_id}/{period}.pdf`

---

## Row Level Security (RLS) Policies

All user-scoped tables have RLS enabled with the following pattern:

### Helper Function

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Policy Pattern (Example: companies table)

```sql
-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see own data, admins see all
CREATE POLICY "Users can view own companies or admin can view all"
ON companies FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- INSERT: Users create own data, admins can create for anyone
CREATE POLICY "Users can insert own companies or admin can insert for anyone"
ON companies FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- UPDATE: Users update own data, admins can update anyone's
CREATE POLICY "Users can update own companies or admin can update any"
ON companies FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- DELETE: Users delete own data, admins can delete anyone's
CREATE POLICY "Users can delete own companies or admin can delete any"
ON companies FOR DELETE
USING (user_id = auth.uid() OR is_admin());
```

**Same pattern applies to:**
- `activities`
- `work_entries`
- `report_configs`
- `generated_reports`

### Profiles Table Policies

```sql
-- SELECT: Users see own profile, admins see all
CREATE POLICY "Users can view own profile or admin can view all"
ON profiles FOR SELECT
USING (id = auth.uid() OR is_admin());

-- UPDATE: Users update own profile, admins can update any
CREATE POLICY "Users can update own profile or admin can update any"
ON profiles FOR UPDATE
USING (id = auth.uid() OR is_admin());

-- DELETE: Only admins can delete profiles (or via CASCADE from auth.users)
CREATE POLICY "Only admins can delete profiles"
ON profiles FOR DELETE
USING (is_admin());
```

### Report Templates (Global, No RLS)

```sql
-- Templates are global and read-only for users
CREATE POLICY "Anyone can view report templates"
ON report_templates FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage templates
CREATE POLICY "Only admins can manage templates"
ON report_templates FOR ALL
USING (is_admin());
```

---

## Relationships Diagram

```
auth.users (Supabase Auth)
    ↓ 1:1
profiles (id, role, full_name)
    ↓ 1:N
    ├── companies (id, name, tax_number, city, user_id)
    │       ↓ 1:N
    │       ├── work_entries (id, company_id, activity_id, month, hours, user_id)
    │       ├── report_configs (id, company_id, template_id, intro_text, outro_text, user_id)
    │       └── generated_reports (id, company_id, report_period, file_path, user_id)
    │
    ├── activities (id, name, hourly_rate, user_id)
    │       ↓ 1:N
    │       └── work_entries (id, activity_id, company_id, month, hours, user_id)
    │
    ├── work_entries (id, user_id, activity_id, company_id, month, hours)
    ├── report_configs (id, user_id, company_id, template_id, intro_text, outro_text)
    └── generated_reports (id, user_id, company_id, report_period, file_path)

report_templates (global, id, name, template_definition)
    ↓ 1:N
report_configs (id, template_id, ...)
```

---

## Migration Order

Migrations should be created and executed in this order:

1. **001_create_profiles.sql** - Profiles table and trigger for new user creation
2. **002_create_companies.sql** - Companies table with RLS
3. **003_create_activities.sql** - Activities table with RLS
4. **004_create_report_templates.sql** - Templates table (global)
5. **005_create_report_configs.sql** - Report configs table with RLS
6. **006_create_work_entries.sql** - Work entries table with RLS
7. **007_create_generated_reports.sql** - Generated reports metadata table with RLS
8. **008_create_indexes.sql** - Additional performance indexes
9. **009_create_helper_functions.sql** - is_admin() and other helper functions

---

## Data Validation

### Database-Level Constraints
- `CHECK (hourly_rate > 0)` on activities
- `CHECK (hours > 0)` on work_entries
- `CHECK (role IN ('freelancer', 'admin'))` on profiles
- UNIQUE constraints prevent duplicate entries
- NOT NULL constraints on required fields
- Foreign key constraints ensure referential integrity

### Application-Level Validation
Service functions should additionally validate:
- Email format on registration
- Password strength on registration
- Required fields before insert
- User permissions before operations
- Data types and ranges

---

## Backup and Maintenance

- Supabase handles automatic backups
- Consider periodic exports for large datasets
- Monitor table sizes and index usage
- Archive old generated_reports periodically if storage grows large

---

## Future Considerations

Potential schema enhancements:
- `company_contacts` table for multiple contacts per company
- `activity_categories` for grouping activities
- `report_history` for tracking report versions
- `user_settings` for user preferences
- `notifications` for activity reminders
