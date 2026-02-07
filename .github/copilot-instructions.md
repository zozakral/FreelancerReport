# Agent Instructions - Freelancer Report Application

This document provides architectural guidelines and coding conventions for the Work Reporting Web Application.

## Project Overview

A multi-page web application for freelancers to track work and generate monthly reports. Built with vanilla JavaScript (no frameworks), Vite, Bootstrap, and Supabase backend.

## Architecture Decisions

### Multi-Page Application (MPA)
- Each page is a separate HTML file in the `pages/` directory
- No single-page app (SPA) patterns - avoid popups and modal-heavy workflows
- Each page has its own JavaScript module loaded as `type="module"`
- Pages share common services but maintain independent UI state

### Modular Service Layer
All backend interactions go through service modules in `src/services/`:
- **auth.js** - Authentication (login, register, logout, session)
- **users.js** - User management (admin only)
- **companies.js** - Company CRUD
- **activities.js** - Activity CRUD
- **workEntries.js** - Work entry CRUD
- **reportConfigs.js** - Report configuration CRUD
- **reportGenerator.js** - Report data aggregation and generation
- **pdfGenerator.js** - PDF creation using pdfmake

**Service Pattern:**
```javascript
// Every service function follows this pattern
export async function createCompany(data, onBehalfOfUserId = null) {
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;
  
  // Check permissions
  if (onBehalfOfUserId && !await isAdmin()) {
    throw new Error('Only admins can create on behalf of users');
  }
  
  // Perform operation
  const { data: result, error } = await supabase
    .from('companies')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
    
  if (error) throw error;
  return result;
}
```

### Admin Impersonation Pattern
**Global User Selector Approach:**
- Admin pages include a user selector dropdown at the top
- Selected user ID is stored in component state or session storage
- All service calls from admin pages pass `on_behalf_of_user_id` parameter
- Service functions validate admin role before accepting `on_behalf_of_user_id`

**Implementation:**
```javascript
// In admin pages
import { UserSelector } from '../components/userSelector.js';

const userSelector = new UserSelector('#user-selector-container');
const selectedUserId = userSelector.getSelectedUserId();

// Pass to all service calls
await createCompany(companyData, selectedUserId);
await listActivities(selectedUserId);
```

### Client-Side PDF Generation (Hybrid Storage)
**Library:** pdfmake (pure JavaScript, works in browser)

**Generation Flow:**
1. User clicks "Generate Report" button
2. User chooses: "Download" or "Save & Download"
3. Fetch data from Supabase (work entries, activities, company, report config)
4. Merge data with template from `report_templates` table (JSON definition)
5. Generate PDF using pdfmake
6. If "Save & Download": Upload blob to Supabase Storage, save metadata
7. Trigger browser download

**Template Structure:**
- Templates stored in `report_templates` table as JSONB (pdfmake document definitions)
- Dynamic placeholders replaced during generation: `{{companyName}}`, `{{activitiesTable}}`, etc.
- Predefined templates seeded during setup (formal, modern, minimal styles)

### Work Entry Data Model
**One Row Per Activity Per Company Per Month:**
```sql
work_entries (
  id, 
  activity_id, 
  company_id, 
  month (date), 
  hours (decimal),
  user_id,
  UNIQUE(activity_id, company_id, month, user_id)
)
```

**Benefits:**
- Simple monthly aggregation for reports
- Easy to edit individual activity hours
- Clear data structure with no complex JSON storage
- Performant queries for report generation

### Database Access with RLS
**Row Level Security Policies:**
- Freelancers: `user_id = auth.uid()` on all user-scoped tables
- Admins: `is_admin()` helper function returns true if current user has 'admin' role in profiles table
- All policies: Allow if `user_id = auth.uid() OR is_admin()`

**Example Policy:**
```sql
CREATE POLICY "Users can view own companies or admin can view all"
ON companies FOR SELECT
USING (user_id = auth.uid() OR is_admin());
```

## Coding Conventions

### JavaScript Style
- **ES6 Modules:** Always use `import/export` syntax
- **Async/Await:** Prefer over promises for readability
- **Error Handling:** Use try/catch blocks, throw descriptive errors
- **No TypeScript:** Pure JavaScript only (per requirements)
- **Naming:**
  - Functions: camelCase (`createCompany`, `generateReport`)
  - Files: camelCase for JS (`auth.js`), kebab-case for HTML (`work-entry.html`)
  - Constants: UPPER_SNAKE_CASE (`ADMIN_ROLE`, `MAX_FILE_SIZE`)

### File Organization
```
src/
├── config/          # Configuration (Supabase client setup)
├── services/        # Business logic and API calls
├── utils/           # Helper functions (permissions, formatting, validation)
├── components/      # Reusable UI components
└── styles/          # CSS files
```

### Service Layer Rules
1. **Single Responsibility:** Each service handles one domain (companies, activities, etc.)
2. **Consistent API:** All CRUD functions follow same pattern (create, read, update, delete, list)
3. **Admin Support:** All functions accept optional `onBehalfOfUserId` parameter
4. **Error Handling:** Throw errors with clear messages, let UI handle display
5. **Return Data:** Always return the data or result, not just success/failure

### UI Pages
- Each HTML page includes Bootstrap CSS and custom styles
- Page-specific JavaScript in `<script type="module">` tag or separate file
- Common navigation bar included via JavaScript or template
- Mobile-responsive design with Bootstrap grid system
- Form validation using HTML5 + custom JavaScript

### State Management
- **Session Storage:** For admin user selection (persists across page navigations)
- **Local Storage:** For user preferences (theme, language)
- **No Global State:** Each page manages its own state
- **Supabase Auth:** Single source of truth for authentication state

### Security Practices
- **Never expose service role key** on client side
- **Always use RLS policies** for data access control
- **Validate input** on both client and server (Supabase functions)
- **Sanitize data** before inserting into database
- **Use parameterized queries** (Supabase client handles this)

## Development Workflow

### Adding a New Feature
1. **Update database schema** if needed (create migration in `supabase/migrations/`)
2. **Create/update service** in `src/services/`
3. **Add UI page** in `pages/` if needed
4. **Update navigation** to include new page
5. **Test with both roles** (freelancer and admin)
6. **Update documentation** if architecture changes

### Database Migrations
- **File naming:** `YYYYMMDDHHMMSS_description.sql` (timestamp + description)
- **Always reversible:** Include both UP and DOWN migrations if possible
- **Test locally:** Use `supabase db reset` to test fresh installation
- **Version control:** Commit migrations to git immediately

### Testing Approach
1. **Manual testing** with both freelancer and admin accounts
2. **Test RLS policies** by trying to access other users' data
3. **Test admin impersonation** with user selector
4. **Test PDF generation** with various data sizes
5. **Test responsive design** on mobile and desktop

## Common Patterns

### Loading States
```javascript
async function loadData() {
  showLoadingSpinner();
  try {
    const data = await fetchDataFromService();
    renderData(data);
  } catch (error) {
    showErrorMessage(error.message);
  } finally {
    hideLoadingSpinner();
  }
}
```

### Form Submission
```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    await createService(data);
    showSuccessMessage('Created successfully');
    form.reset();
    redirectToListPage();
  } catch (error) {
    showErrorAlert(error.message);
  }
});
```

### Authentication Check
```javascript
import { getCurrentUser, redirectIfNotAuthenticated } from './services/auth.js';

// At page load
await redirectIfNotAuthenticated();
const user = await getCurrentUser();

// Check admin role
import { isAdmin } from './utils/permissions.js';
if (!await isAdmin()) {
  window.location.href = '/pages/dashboard.html';
}
```

## Key Dependencies

- **@supabase/supabase-js** (^2.39.3) - Supabase client library
- **bootstrap** (^5.3.2) - CSS framework
- **pdfmake** (^0.2.9) - PDF generation
- **vite** (^5.0.12) - Build tool and dev server

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Access in code:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

## Performance Considerations

1. **Lazy load pdfmake** - Only import when generating reports
2. **Index database tables** - Add indexes on foreign keys and frequently queried columns
3. **Limit query results** - Use pagination for large lists
4. **Cache static data** - Report templates can be cached in memory
5. **Optimize PDF size** - Compress images, use web fonts efficiently

## Accessibility

- Use semantic HTML elements
- Include ARIA labels for interactive elements
- Ensure keyboard navigation works
- Provide clear error messages
- Use sufficient color contrast (Bootstrap handles most of this)

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features required
- No IE11 support needed

## Questions to Ask Before Implementing

1. Does this feature require a new database table or column?
2. Should this data be user-scoped or global?
3. Do admins need access to this data?
4. Is this a common operation that needs a service function?
5. Does this page need authentication?
6. Should this be a separate page or part of an existing page?

---

**Remember:** Keep it simple, modular, and maintainable. Each file should have a clear purpose. Avoid over-engineering.
