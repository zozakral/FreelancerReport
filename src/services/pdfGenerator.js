import { supabaseClient } from '../config/supabase.js';
import { getCurrentUser } from './auth.js';
import { formatCurrency } from '../utils/formatters.js';
// import ibmPlexSansRegularUrl from '../assets/fonts/pdf/IBMPlexSans-Regular.woff2?url';
// import ibmPlexSansBoldUrl from '../assets/fonts/pdf/IBMPlexSans-Bold.woff2?url';
// import ibmPlexSansItalicUrl from '../assets/fonts/pdf/IBMPlexSans-Italic.woff2?url';
// import ibmPlexSansBoldItalicUrl from '../assets/fonts/pdf/IBMPlexSans-BoldItalic.woff2?url';

let pdfMakeReadyPromise = null;
let customFontRegistrationAttempted = false;
const HOURS_PER_WORKDAY = 8;

// function arrayBufferToBase64(arrayBuffer) {
//   const bytes = new Uint8Array(arrayBuffer);
//   let binary = '';
//   const chunkSize = 0x8000;

//   for (let index = 0; index < bytes.length; index += chunkSize) {
//     const chunk = bytes.subarray(index, index + chunkSize);
//     binary += String.fromCharCode(...chunk);
//   }

//   return btoa(binary);
// }

// async function registerCustomFonts(pdfMake) {
//   if (customFontRegistrationAttempted) {
//     return Boolean(pdfMake.fonts?.IBMPlexSans);
//   }

//   customFontRegistrationAttempted = true;

//   try {
//     const fontFiles = [
//       ['IBMPlexSans-Regular.woff2', ibmPlexSansRegularUrl],
//       ['IBMPlexSans-Bold.woff2', ibmPlexSansBoldUrl],
//       ['IBMPlexSans-Italic.woff2', ibmPlexSansItalicUrl],
//       ['IBMPlexSans-BoldItalic.woff2', ibmPlexSansBoldItalicUrl]
//     ];

//     const entries = await Promise.all(fontFiles.map(async ([fileName, fileUrl]) => {
//       const response = await fetch(fileUrl);
//       if (!response.ok) {
//         throw new Error(`Unable to load font file: ${fileName}`);
//       }

//       const base64Content = arrayBufferToBase64(await response.arrayBuffer());
//       return [fileName, base64Content];
//     }));

//     entries.forEach(([fileName, base64Content]) => {
//       pdfMake.vfs[fileName] = base64Content;
//     });

//     pdfMake.fonts = {
//       ...(pdfMake.fonts || {}),
//       IBMPlexSans: {
//         normal: 'IBMPlexSans-Regular.woff2',
//         bold: 'IBMPlexSans-Bold.woff2',
//         italics: 'IBMPlexSans-Italic.woff2',
//         bolditalics: 'IBMPlexSans-BoldItalic.woff2'
//       }
//     };

//     return true;
//   } catch (error) {
//     console.warn('Custom PDF fonts could not be registered. Falling back to Roboto.', error);
//     return false;
//   }
// }

// function replaceFontFamily(node, sourceFont, targetFont) {
//   if (Array.isArray(node)) {
//     return node.map(item => replaceFontFamily(item, sourceFont, targetFont));
//   }

//   if (node && typeof node === 'object') {
//     const replacedNode = {};
//     Object.entries(node).forEach(([key, value]) => {
//       if (key === 'font' && value === sourceFont) {
//         replacedNode[key] = targetFont;
//       } else {
//         replacedNode[key] = replaceFontFamily(value, sourceFont, targetFont);
//       }
//     });
//     return replacedNode;
//   }

//   return node;
// }

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
  const isBulgarianTemplate = String(reportData?.template?.name || '').toLowerCase().includes('bulgarian');
  const activities = Array.isArray(reportData?.activities) ? reportData.activities : [];
  const totalWorkedHours = activities.reduce((sum, activity) => sum + Number(activity?.hours || 0), 0);
  const equivalentDays = totalWorkedHours / HOURS_PER_WORKDAY;

  // Create activities table for insertion
  const activitiesTableBody = [
    // Header row
    isBulgarianTemplate
      ? ['№', 'Дейност', 'Ставка/час (EUR)', 'Часове', 'Общо (EUR)']
      : ['#', 'Activity', 'Rate/Hour (EUR)', 'Hours', 'Total (EUR)']
  ];

  // Data rows
  activities.forEach(activity => {
    activitiesTableBody.push([
      String(activity?.seq ?? ''),
      activity?.name || '',
      formatCurrency(Number(activity?.hourly_rate || 0)),
      Number(activity?.hours || 0).toFixed(2),
      formatCurrency(Number(activity?.total || 0))
    ]);
  });

  // Total row
  activitiesTableBody.push([
    { text: isBulgarianTemplate ? 'Общо' : 'TOTAL', colSpan: 4, alignment: 'right', bold: true },
    {},
    {},
    {},
    { text: formatCurrency(Number(reportData?.totalAmount || 0)), bold: true }
  ]);

  if (isBulgarianTemplate) {
    activitiesTableBody.push([
      { text: 'Общо часове', colSpan: 4, alignment: 'right', bold: true },
      {},
      {},
      {},
      { text: `${totalWorkedHours.toFixed(2)} ч.`, bold: true }
    ]);

    activitiesTableBody.push([
      { text: `Еквивалентни дни (${HOURS_PER_WORKDAY} ч/ден)`, colSpan: 4, alignment: 'right', bold: true },
      {},
      {},
      {},
      { text: `${equivalentDays.toFixed(2)} дни`, bold: true }
    ]);
  }

  // Placeholders mapping
  const placeholders = {
    '{{reportDate}}': reportData.reportDate,
    '{{monthNameBg}}': reportData.monthNameBg || '',
    '{{location}}': reportData.location,
    '{{companyName}}': reportData.company.name,
    '{{taxNumber}}': reportData.company.tax_number,
    '{{city}}': reportData.company.city,
    '{{workerName}}': reportData.worker.full_name,
    '{{introText}}': reportData.introText,
    '{{outroText}}': reportData.outroText,
    '{{totalAmount}}': formatCurrency(Number(reportData.totalAmount || 0)),
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

    // const customFontLoaded = await registerCustomFonts(pdfMake);

    // Merge template with data
    let docDefinition = mergePDFTemplate(reportData.template.template_definition, reportData);

    // if (!customFontLoaded) {
    //   docDefinition = replaceFontFamily(docDefinition, 'IBMPlexSans', 'Roboto');
    // }

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
 * Delete PDF from Supabase Storage
 * @param {string} filePath - Path in storage bucket
 * @returns {Promise<void>}
 * @throws {Error} - If deletion fails
 */
export async function deletePDFfromStorage(filePath) {
  const { error } = await supabaseClient
    .storage
    .from('work-reports')
    .remove([filePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
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

