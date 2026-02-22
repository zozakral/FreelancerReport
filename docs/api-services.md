# API Services Documentation

## Overview

The service layer provides a clean abstraction between the UI and Supabase backend. All database operations, authentication, and business logic are encapsulated in service modules.

## Service Architecture

### Design Principles

1. **Single Responsibility** - Each service handles one domain (companies, activities, etc.)
2. **Consistent API** - All services follow the same patterns for CRUD operations
3. **Admin Support** - All functions support admin impersonation via `onBehalfOfUserId` parameter
4. **Error Handling** - Services throw descriptive errors; UI handles user display
5. **Async/Await** - All operations are asynchronous and return promises

### Common Pattern

```javascript
/**
 * Service function template
 * @param {Object} data - Data object for the operation
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Result data
 * @throws {Error} - On validation or database errors
 */
export async function operationName(data, onBehalfOfUserId = null) {
  // 1. Determine effective user ID
  const userId = onBehalfOfUserId || (await getCurrentUser()).id;
  
  // 2. Validate admin permission if impersonating
  if (onBehalfOfUserId && !(await isAdmin())) {
    throw new Error('Only admins can perform operations on behalf of users');
  }
  
  // 3. Validate input data
  if (!data.requiredField) {
    throw new Error('Required field is missing');
  }
  
  // 4. Perform database operation
  const { data: result, error } = await supabase
    .from('table_name')
    .insert({ ...data, user_id: userId })
    .select()
    .single();
  
  // 5. Handle errors
  if (error) throw new Error(error.message);
  
  // 6. Return result
  return result;
}
```

---

## Service Modules

### auth.js - Authentication Service

Handles user registration, login, logout, and session management.

#### Functions

**`register(email, password, fullName)`**
```javascript
/**
 * Register a new user with Freelancer role
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} - User object with session
 * @throws {Error} - On validation or registration errors
 */
```

**`login(email, password)`**
```javascript
/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object with session
 * @throws {Error} - On authentication errors
 */
```

**`logout()`**
```javascript
/**
 * Logout current user and clear session
 * @returns {Promise<void>}
 * @throws {Error} - On logout errors
 */
```

**`getCurrentUser()`**
```javascript
/**
 * Get currently authenticated user with profile data
 * @returns {Promise<Object|null>} - User object with role and profile, or null
 */
```

**`redirectIfNotAuthenticated(redirectUrl = '/pages/login.html')`**
```javascript
/**
 * Redirect to login if no authenticated user
 * @param {string} redirectUrl - URL to redirect to
 * @returns {Promise<void>}
 */
```

**`onAuthStateChange(callback)`**
```javascript
/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Called with (event, session)
 * @returns {Object} - Subscription object with unsubscribe method
 */
```

---

### users.js - User Management Service (Admin Only)

Handles user CRUD operations for admin users.

#### Functions

**`listUsers(searchQuery = null)`**
```javascript
/**
 * List all users (admin only)
 * @param {string|null} searchQuery - Optional search by name or email
 * @returns {Promise<Array>} - Array of user objects
 * @throws {Error} - If not admin or query fails
 */
```

**`createUser(email, password, fullName, role = 'freelancer')`**
```javascript
/**
 * Create new user (admin only)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @param {string} role - 'freelancer' or 'admin'
 * @returns {Promise<Object>} - Created user object
 * @throws {Error} - If not admin or creation fails
 */
```

**`updateUser(userId, updates)`**
```javascript
/**
 * Update user profile (admin only)
 * @param {string} userId - User ID to update
 * @param {Object} updates - Fields to update { full_name?, role? }
 * @returns {Promise<Object>} - Updated user object
 * @throws {Error} - If not admin or update fails
 */
```

**`deleteUser(userId)`**
```javascript
/**
 * Delete user (admin only)
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 * @throws {Error} - If not admin or deletion fails
 */
```

---

### companies.js - Company Management Service

Handles company CRUD operations with admin impersonation support.

#### Functions

**`listCompanies(onBehalfOfUserId = null)`**
```javascript
/**
 * List all companies for user
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of company objects
 * @throws {Error} - If permission denied or query fails
 */
```

**`getCompany(companyId)`**
```javascript
/**
 * Get single company by ID (respects RLS)
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} - Company object
 * @throws {Error} - If not found or access denied
 */
```

**`createCompany(data, onBehalfOfUserId = null)`**
```javascript
/**
 * Create new company
 * @param {Object} data - { name, tax_number?, city? }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Created company object
 * @throws {Error} - If validation fails or creation fails
 */
```

**`updateCompany(companyId, updates, onBehalfOfUserId = null)`**
```javascript
/**
 * Update company
 * @param {string} companyId - Company ID
 * @param {Object} updates - Fields to update
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Updated company object
 * @throws {Error} - If access denied or update fails
 */
```

**`deleteCompany(companyId, onBehalfOfUserId = null)`**
```javascript
/**
 * Delete company (cascades to related data)
 * @param {string} companyId - Company ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 * @throws {Error} - If access denied or deletion fails
 */
```

**`searchCompanies(searchQuery, onBehalfOfUserId = null)`**
```javascript
/**
 * Search companies by name
 * @param {string} searchQuery - Search term
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Matching company objects
 */
```

---

### activities.js - Activity Management Service

Handles activity CRUD operations with admin impersonation support.

#### Functions

**`listActivities(onBehalfOfUserId = null)`**
```javascript
/**
 * List all activities for user
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of activity objects
 * @throws {Error} - If permission denied or query fails
 */
```

**`getActivity(activityId)`**
```javascript
/**
 * Get single activity by ID (respects RLS)
 * @param {string} activityId - Activity ID
 * @returns {Promise<Object>} - Activity object
 * @throws {Error} - If not found or access denied
 */
```

**`createActivity(data, onBehalfOfUserId = null)`**
```javascript
/**
 * Create new activity
 * @param {Object} data - { name, hourly_rate }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Created activity object
 * @throws {Error} - If validation fails (rate > 0) or creation fails
 */
```

**`updateActivity(activityId, updates, onBehalfOfUserId = null)`**
```javascript
/**
 * Update activity
 * @param {string} activityId - Activity ID
 * @param {Object} updates - Fields to update
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Updated activity object
 * @throws {Error} - If access denied or update fails
 */
```

**`deleteActivity(activityId, onBehalfOfUserId = null)`**
```javascript
/**
 * Delete activity (cascades to work entries)
 * @param {string} activityId - Activity ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 * @throws {Error} - If access denied or deletion fails
 */
```

---

### workEntries.js - Work Entry Management Service

Handles work entry CRUD with unique constraint (one entry per activity per company per month).

#### Functions

**`listWorkEntries(companyId, month, onBehalfOfUserId = null)`**
```javascript
/**
 * List work entries for company and month
 * @param {string} companyId - Company ID
 * @param {string} month - Month as 'YYYY-MM-01'
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of work entry objects with activity details
 * @throws {Error} - If permission denied or query fails
 */
```

**`upsertWorkEntry(data, onBehalfOfUserId = null)`**
```javascript
/**
 * Create or update work entry (upsert based on unique constraint)
 * @param {Object} data - { activity_id, company_id, month, hours }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Work entry object
 * @throws {Error} - If validation fails (hours > 0) or operation fails
 */
```

**`deleteWorkEntry(workEntryId, onBehalfOfUserId = null)`**
```javascript
/**
 * Delete work entry
 * @param {string} workEntryId - Work entry ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<void>}
 * @throws {Error} - If access denied or deletion fails
 */
```

**`getMonthlyTotal(companyId, month, onBehalfOfUserId = null)`**
```javascript
/**
 * Calculate total hours and amount for month
 * @param {string} companyId - Company ID
 * @param {string} month - Month as 'YYYY-MM-01'
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - { totalHours, totalAmount, entries }
 */
```

---

### reportConfigs.js - Report Configuration Service

Handles report configuration CRUD (one config per company per user).

#### Functions

**`getReportConfig(companyId, onBehalfOfUserId = null)`**
```javascript
/**
 * Get report config for company
 * @param {string} companyId - Company ID
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object|null>} - Report config or null if not exists
 */
```

**`upsertReportConfig(data, onBehalfOfUserId = null)`**
```javascript
/**
 * Create or update report config
 * @param {Object} data - { company_id, template_id, intro_text?, outro_text?, location? }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Report config object
 * @throws {Error} - If validation or operation fails
 */
```

**`listReportTemplates()`**
```javascript
/**
 * List all available report templates (global, no user filter)
 * @returns {Promise<Array>} - Array of template objects
 */
```

---

### reportGenerator.js - Report Generation Service

Aggregates data and generates structured report data for PDF generation.

#### Functions

**`generateReportData(companyId, month, reportDate, onBehalfOfUserId = null)`**
```javascript
/**
 * Generate structured report data for PDF
 * @param {string} companyId - Company ID
 * @param {string} month - Month as 'YYYY-MM-01'
 * @param {string} reportDate - Date to display on report
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Structured report data
 * @throws {Error} - If data missing or generation fails
 * 
 * Returns: {
 *   reportDate: string,
 *   location: string,
 *   company: { name, tax_number, city },
 *   worker: { full_name },
 *   introText: string,
 *   outroText: string,
 *   activities: [{ seq, name, hourly_rate, hours, total }],
 *   totalAmount: number
 * }
 */
```

**`saveGeneratedReport(reportData, onBehalfOfUserId = null)`**
```javascript
/**
 * Save report metadata to database
 * @param {Object} reportData - { company_id, report_period, report_date, file_path?, save_to_storage }
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Object>} - Generated report record
 */
```

**`listGeneratedReports(companyId = null, onBehalfOfUserId = null)`**
```javascript
/**
 * List user's generated reports, optionally filtered by company
 * @param {string|null} companyId - Optional company filter
 * @param {string|null} onBehalfOfUserId - User ID for admin impersonation
 * @returns {Promise<Array>} - Array of generated report objects
 */
```

---

### pdfGenerator.js - PDF Generation Service

Handles PDF creation using pdfmake library.

#### Functions

**`generatePDF(reportData, template)`**
```javascript
/**
 * Generate PDF from report data and template
 * @param {Object} reportData - Structured report data from reportGenerator
 * @param {Object} template - Template definition from report_templates table
 * @returns {Promise<Blob>} - PDF blob for download or storage
 * @throws {Error} - If generation fails
 */
```

**`downloadPDF(pdfBlob, filename)`**
```javascript
/**
 * Trigger browser download of PDF blob
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filename - Filename for download
 * @returns {void}
 */
```

**`uploadPDFToStorage(pdfBlob, filePath)`**
```javascript
/**
 * Upload PDF to Supabase Storage
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filePath - Path in storage bucket (work-reports/{user_id}/{company_id}/{period}.pdf)
 * @returns {Promise<string>} - Public or signed URL
 * @throws {Error} - If upload fails
 */
```

**`mergePDFTemplate(templateDef, reportData)`**
```javascript
/**
 * Replace placeholders in template with actual data
 * @param {Object} templateDef - pdfmake template definition with placeholders
 * @param {Object} reportData - Report data object
 * @returns {Object} - Complete pdfmake document definition
 * 
 * Placeholders:
 *   {{reportDate}}, {{location}}, {{companyName}}, {{taxNumber}}, {{city}},
 *   {{workerName}}, {{introText}}, {{outroText}}, {{activitiesTable}}, {{totalAmount}}
 */
```

---

## Usage Examples

### Example 1: Freelancer Creates Company

```javascript
import { createCompany } from './services/companies.js';

try {
  const company = await createCompany({
    name: 'Acme Corp',
    tax_number: '123456789',
    city: 'Sofia'
  });
  
  console.log('Company created:', company.id);
  // Redirect to companies list
  window.location.href = '/pages/companies.html';
} catch (error) {
  showErrorAlert(error.message);
}
```

### Example 2: Admin Creates Company for User

```javascript
import { createCompany } from './services/companies.js';
import { UserSelector } from '../components/userSelector.js';

const userSelector = new UserSelector('#user-selector');
const selectedUserId = userSelector.getSelectedUserId();

try {
  const company = await createCompany({
    name: 'Acme Corp',
    tax_number: '123456789',
    city: 'Sofia'
  }, selectedUserId); // Admin impersonation
  
  console.log('Company created for user:', selectedUserId);
} catch (error) {
  showErrorAlert(error.message);
}
```

### Example 3: Generate and Download Report

```javascript
import { generateReportData } from './services/reportGenerator.js';
import { generatePDF, downloadPDF } from './services/pdfGenerator.js';
import { getReportConfig } from './services/reportConfigs.js';

try {
  // Get report config with template
  const config = await getReportConfig(companyId);
  
  // Generate report data
  const reportData = await generateReportData(
    companyId, 
    '2026-01-01', 
    '2026-02-07'
  );
  
  // Generate PDF
  const pdfBlob = await generatePDF(reportData, config.template);
  
  // Download immediately
  downloadPDF(pdfBlob, `report_${companyId}_2026-01.pdf`);
  
} catch (error) {
  showErrorAlert(error.message);
}
```

### Example 4: Generate and Save Report

```javascript
import { generateReportData, saveGeneratedReport } from './services/reportGenerator.js';
import { generatePDF, uploadPDFToStorage } from './services/pdfGenerator.js';
import { getCurrentUser } from './services/auth.js';

try {
  const user = await getCurrentUser();
  
  // Generate data and PDF
  const reportData = await generateReportData(companyId, '2026-01-01', '2026-02-07');
  const pdfBlob = await generatePDF(reportData, template);
  
  // Upload to storage
  const filePath = `work-reports/${user.id}/${companyId}/2026-01.pdf`;
  const fileUrl = await uploadPDFToStorage(pdfBlob, filePath);
  
  // Save metadata
  await saveGeneratedReport({
    company_id: companyId,
    report_period: '2026-01-01',
    report_date: '2026-02-07',
    file_path: filePath,
    save_to_storage: true
  });
  
  // Also trigger download
  downloadPDF(pdfBlob, `report_${companyId}_2026-01.pdf`);
  
  showSuccessMessage('Report saved and downloaded');
} catch (error) {
  showErrorAlert(error.message);
}
```

---

## Error Handling Strategy

### Service Layer
- Services throw `Error` objects with descriptive messages
- No UI-specific code in services (no alerts, no DOM manipulation)
- Validation errors have clear field-specific messages
- Database errors are wrapped with user-friendly messages

### UI Layer
```javascript
// Standard error handling pattern in pages
try {
  await serviceFunction();
  showSuccessMessage('Operation completed');
} catch (error) {
  console.error('Operation failed:', error);
  showErrorAlert(error.message);
}
```

### Error Types
- **Validation Errors**: "Field X is required", "Hours must be positive"
- **Permission Errors**: "Only admins can perform this operation"
- **Not Found Errors**: "Company not found"
- **Database Errors**: User-friendly wrappers, avoid exposing internal errors

---

## Performance Considerations

1. **Batch Operations**: Use Supabase batch inserts when creating multiple entries
2. **Query Optimization**: Use `.select()` to fetch only needed columns
3. **Caching**: Cache report templates in memory (they rarely change)
4. **Pagination**: Implement pagination for large lists (companies, activities)
5. **Debouncing**: Debounce search inputs to reduce query frequency

---

## Testing Approach

### Manual Testing Checklist
- Test each CRUD operation as freelancer
- Test each CRUD operation as admin (with impersonation)
- Test RLS: Try to access another user's data directly
- Test validation: Submit forms with missing/invalid data
- Test error handling: Disconnect network, test error messages
- Test edge cases: Empty lists, large datasets, special characters

### Sample Test Data
Create test users:
- `freelancer@test.com` (role: freelancer)
- `admin@test.com` (role: admin)

Create sample companies, activities, and work entries for testing report generation.

---

## Future Enhancements

Potential service extensions:
- Bulk import/export (CSV, Excel)
- Email report delivery
- Report scheduling/automation
- Enhanced EUR-specific tax and invoicing rules
- Tax calculation services
- Invoice generation
- Time tracking integration
