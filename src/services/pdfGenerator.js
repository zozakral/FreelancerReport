import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { formatCurrency } from '../utils/formatters.js';

let pdfMakeReadyPromise = null;

async function getPdfMake() {
  if (!pdfMakeReadyPromise) {
    pdfMakeReadyPromise = (async () => {
      const [{ default: pdfMake }, { default: pdfFonts }] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);

      // Access vfs directly from pdfFonts (not pdfFonts.pdfMake.vfs)
      pdfMake.vfs = pdfFonts.vfs || pdfFonts.pdfMake?.vfs || pdfFonts;
      return pdfMake;
    })();
  }

  return pdfMakeReadyPromise;
}

/**
 * Replace placeholders in template with actual data
 * @param {Object} templateDef - pdfmake template definition with placeholders
 * @param {Object} reportData - Report data object
 * @returns {Object} - Complete pdfmake document definition
 */
export function mergePDFTemplate(templateDef, reportData) {
  const template = JSON.parse(JSON.stringify(templateDef)); // Deep clone

  // Create activities table for insertion
  const activitiesTableBody = [
    // Header row
    ['#', 'Activity', 'Rate/Hour (EUR)', 'Hours', 'Total (EUR)']
  ];

  // Data rows
  reportData.activities.forEach(activity => {
    activitiesTableBody.push([
      activity.seq.toString(),
      activity.name,
      formatCurrency(activity.hourly_rate),
      activity.hours.toFixed(2),
      formatCurrency(activity.total)
    ]);
  });

  // Total row
  activitiesTableBody.push([
    { text: 'TOTAL', colSpan: 4, alignment: 'right', bold: true },
    {},
    {},
    {},
    { text: formatCurrency(reportData.totalAmount), bold: true }
  ]);

  // Placeholders mapping
  const placeholders = {
    '{{reportDate}}': reportData.reportDate,
    '{{location}}': reportData.location,
    '{{companyName}}': reportData.company.name,
    '{{taxNumber}}': reportData.company.tax_number,
    '{{city}}': reportData.company.city,
    '{{workerName}}': reportData.worker.full_name,
    '{{introText}}': reportData.introText,
    '{{outroText}}': reportData.outroText,
    '{{totalAmount}}': formatCurrency(reportData.totalAmount),
    '{{activitiesTable}}': {
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        body: activitiesTableBody
      },
      layout: 'lightHorizontalLines'
    }
  };

  // Recursively replace placeholders in template
  function replacePlaceholders(obj) {
    if (typeof obj === 'string') {
      // Replace string placeholders
      Object.keys(placeholders).forEach(placeholder => {
        if (typeof placeholders[placeholder] === 'string') {
          obj = obj.replace(new RegExp(placeholder, 'g'), placeholders[placeholder]);
        }
      });
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map(item => {
        // Special handling for table placeholder
        if (typeof item === 'string' && item === '{{activitiesTable}}') {
          return placeholders['{{activitiesTable}}'];
        }
        return replacePlaceholders(item);
      });
    } else if (obj !== null && typeof obj === 'object') {
      const newObj = {};
      Object.keys(obj).forEach(key => {
        newObj[key] = replacePlaceholders(obj[key]);
      });
      return newObj;
    }
    return obj;
  }

  const mergedTemplate = replacePlaceholders(template);
  return mergedTemplate;
}

/**
 * Generate PDF from report data and template
 * @param {Object} reportData - Structured report data from reportGenerator
 * @param {Object} template - Template definition from report_templates table
 * @returns {Promise<Blob>} - PDF blob for download or storage
 * @throws {Error} - If generation fails
 */
export async function generatePDF(reportData) {
  try {
    const pdfMake = await getPdfMake();

    // Merge template with data
    const docDefinition = mergePDFTemplate(reportData.template.template_definition, reportData);

    // Add styles if provided in template
    if (reportData.template.styles) {
      docDefinition.styles = {
        ...docDefinition.styles,
        ...reportData.template.styles
      };
    }

    // Create PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    // Return as blob
    return new Promise((resolve, reject) => {
      pdfDocGenerator.getBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PDF blob'));
        }
      });
    });
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * Trigger browser download of PDF blob
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filename - Filename for download
 * @returns {void}
 */
export function downloadPDF(pdfBlob, filename) {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload PDF to Supabase Storage
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filePath - Path in storage bucket (work-reports/{user_id}/{company_id}/{period}.pdf)
 * @returns {Promise<string>} - Public or signed URL
 * @throws {Error} - If upload fails
 */
export async function uploadPDFToStorage(pdfBlob, filePath) {
  const { data, error } = await supabaseClient
    .storage
    .from('work-reports')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // Get public URL
  const { data: urlData } = supabaseClient
    .storage
    .from('work-reports')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Generate file path for storage
 * @param {string} companyId - Company ID
 * @param {string} period - Period as YYYY-MM
 * @returns {Promise<string>} - File path
 */
export async function generateFilePath(companyId, period, userIdOverride = null) {
  const user = userIdOverride ? { id: userIdOverride } : await getCurrentUser();
  return `${user.id}/${companyId}/${period}.pdf`;
}

