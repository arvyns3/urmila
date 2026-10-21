import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import JSZip from 'jszip';
import { ApplicantRecord } from '../types';

export const DEFAULT_TEMPLATE_PATH = '/assets/aistudio/bom_account_opening_form_c38c522e.pdf';

let cachedTemplateBytes: Uint8Array | null = null;

/**
 * Loads and caches original PDF template bytes from the public directory or uploaded buffer
 */
export async function loadOriginalTemplate(customBuffer?: ArrayBuffer): Promise<Uint8Array> {
  if (customBuffer) {
    return new Uint8Array(customBuffer);
  }
  if (cachedTemplateBytes) {
    return cachedTemplateBytes;
  }

  if (typeof window === 'undefined') {
    const fs = await import('fs');
    const path = await import('path');
    const localPath = path.join(process.cwd(), 'public', DEFAULT_TEMPLATE_PATH);
    const buf = fs.readFileSync(localPath);
    cachedTemplateBytes = new Uint8Array(buf);
    return cachedTemplateBytes;
  }

  const response = await fetch(DEFAULT_TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error(`Failed to load default template at ${DEFAULT_TEMPLATE_PATH}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  cachedTemplateBytes = new Uint8Array(arrayBuffer);
  return cachedTemplateBytes;
}

/**
 * Helper to clean dates to 8 digits DDMMYYYY
 */
function cleanDate(dateStr?: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/[^0-9]/g, '').padEnd(8, ' ').slice(0, 8);
}

/**
 * Draws a single character horizontally centered inside a box
 */
function drawCharInBox(
  page: PDFPage,
  char: string,
  boxCenterX: number,
  baselineY: number,
  font: PDFFont,
  fontSize: number = 7.5,
  color = rgb(0.05, 0.08, 0.15)
) {
  if (!char || char === ' ') return;
  const charWidth = font.widthOfTextAtSize(char, fontSize);
  page.drawText(char, {
    x: boxCenterX - charWidth / 2,
    y: baselineY,
    size: fontSize,
    font,
    color,
  });
}

/**
 * Draws characters along an array of exact box center coordinates
 */
function drawStringInBoxes(
  page: PDFPage,
  text: string | undefined,
  boxCenters: number[],
  baselineY: number,
  font: PDFFont,
  fontSize: number = 7.5,
  color = rgb(0.05, 0.08, 0.15)
) {
  if (!text) return;
  const clean = text.toUpperCase();
  for (let i = 0; i < Math.min(clean.length, boxCenters.length); i++) {
    const char = clean[i];
    if (char && char !== ' ') {
      drawCharInBox(page, char, boxCenters[i], baselineY, font, fontSize, color);
    }
  }
}

/**
 * Draws an 'X' centered inside a checkbox box
 */
function drawCheckbox(
  page: PDFPage,
  boxCenterX: number,
  boxCenterY: number,
  checked: boolean,
  font: PDFFont,
  mark = 'X',
  fontSize: number = 8.0,
  color = rgb(0.05, 0.08, 0.15)
) {
  if (!checked) return;
  const markWidth = font.widthOfTextAtSize(mark, fontSize);
  // Center mark horizontally and vertically (approximate cap-height is ~0.7 * fontSize)
  page.drawText(mark, {
    x: boxCenterX - markWidth / 2,
    y: boxCenterY - (fontSize * 0.7) / 2,
    size: fontSize,
    font,
    color,
  });
}

/**
 * Draws standard single-line text
 */
function drawTextSimple(
  page: PDFPage,
  text: string | undefined,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number = 8,
  color = rgb(0.05, 0.08, 0.15)
) {
  if (!text) return;
  page.drawText(text, {
    x,
    y,
    size: fontSize,
    font,
    color,
  });
}

/**
 * Generates an in-memory filled PDF document from an applicant record
 */
export async function generateFilledPdf(
  applicant: ApplicantRecord,
  customTemplate?: Uint8Array | ArrayBuffer
): Promise<Uint8Array> {
  const templateBytes = customTemplate
    ? new Uint8Array(customTemplate)
    : await loadOriginalTemplate();

  // Load PDFDocument preserving all 13 pages and vector graphics
  const doc = await PDFDocument.load(templateBytes);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regFont = await doc.embedFont(StandardFonts.Helvetica);

  const totalPages = doc.getPageCount();

  // ----------------------------------------------------
  // PAGE 1: CIF & Personal Details
  // ----------------------------------------------------
  if (totalPages >= 1) {
    const p1 = doc.getPage(0);

    // 1. Date (top right): DDMMYYYY in 8 boxes
    const p1DateX = [467.5, 477.5, 492.0, 505.0, 518.0, 532.0, 544.0, 556.0];
    const appDateClean = cleanDate(applicant.applicationDate || '24102026');
    drawStringInBoxes(p1, appDateClean, p1DateX, 762.5, boldFont, 7.5);

    // 2. Branch Name (18 boxes)
    const branchNameCenters = [
      120.0, 131.9, 143.8, 155.7, 167.6, 179.5, 191.4, 203.3, 215.2,
      227.1, 239.0, 250.9, 262.8, 274.7, 286.6, 298.5, 310.4, 322.3,
    ];
    drawStringInBoxes(p1, applicant.branchName || 'PURNA', branchNameCenters, 733.5, boldFont, 7.5);

    // 3. Branch Code (4 to 6 boxes)
    const branchCodeCenters = [383.0, 395.0, 407.0, 419.0, 431.0, 443.0];
    drawStringInBoxes(p1, applicant.branchCode || '0124', branchCodeCenters, 733.5, boldFont, 7.5);

    // 4. Application Type: New / Update
    drawCheckbox(p1, 383.5, 703.5, applicant.applicationType === 'New' || !applicant.applicationType, boldFont, 'X', 8);
    drawCheckbox(p1, 421.0, 703.5, applicant.applicationType === 'Update', boldFont, 'X', 8);

    // Customer ID, Account No., CKYC No., and Existing Customer ID are intentionally left blank (for bank office use)

    // 5. Customer Type
    drawCheckbox(p1, 118.0, 665.0, applicant.customerType === 'General', boldFont);
    drawCheckbox(p1, 161.5, 665.0, applicant.customerType === 'Pensioner', boldFont);
    drawCheckbox(p1, 213.0, 665.0, applicant.customerType === 'Senior Citizen', boldFont);
    drawCheckbox(p1, 275.5, 665.0, applicant.customerType === 'Salaried' || !applicant.customerType, boldFont);
    drawCheckbox(p1, 319.5, 665.0, applicant.customerType === 'Minor', boldFont);
    drawCheckbox(p1, 356.5, 665.0, applicant.customerType === 'Staff', boldFont);
    drawCheckbox(p1, 393.0, 665.0, applicant.customerType === 'Ex Staff', boldFont);

    // 6. Account Type
    drawCheckbox(p1, 118.5, 646.0, applicant.accountType === 'Normal' || !applicant.accountType, boldFont);
    drawCheckbox(p1, 160.0, 646.0, applicant.accountType === 'BSBDA', boldFont);
    drawCheckbox(p1, 200.5, 646.0, applicant.accountType === 'BSBDA-Small', boldFont);

    // 7. Section 01: Personal Details
    // Name Prefix
    drawTextSimple(p1, applicant.namePrefix || 'MR', 118.0, 584.5, boldFont, 7.5);

    // First Name boxes (10 boxes: centers 179.0 to 287.0, pitch 12.0)
    const firstNameCenters = [179.0, 191.0, 203.0, 215.0, 227.0, 239.0, 251.0, 263.0, 275.0, 287.0];
    drawStringInBoxes(p1, applicant.firstName || '', firstNameCenters, 584.5, boldFont, 7.5);

    // Middle Name boxes (10 boxes: centers 300.0 to 408.0)
    const middleNameCenters = [300.0, 312.0, 324.0, 336.0, 348.0, 360.0, 372.0, 384.0, 396.0, 408.0];
    drawStringInBoxes(p1, applicant.middleName || '', middleNameCenters, 584.5, boldFont, 7.5);

    // Last Name boxes (10 boxes: centers 444.0 to 552.0)
    const lastNameCenters = [444.0, 456.0, 468.0, 480.0, 492.0, 504.0, 516.0, 528.0, 540.0, 552.0];
    drawStringInBoxes(p1, applicant.lastName || '', lastNameCenters, 584.5, boldFont, 7.5);

    // Maiden Name
    if (applicant.maidenName) {
      drawStringInBoxes(p1, applicant.maidenName, firstNameCenters, 566.5, boldFont, 7.5);
    }

    // Date of Birth (DDMMYYYY)
    const dobCenters = [121.5, 133.0, 145.0, 157.0, 168.0, 182.0, 193.5, 205.0];
    const dobClean = cleanDate(applicant.dob || '15081992');
    drawStringInBoxes(p1, dobClean, dobCenters, 549.0, boldFont, 7.5);

    // Gender
    drawCheckbox(p1, 252.5, 554.0, applicant.gender === 'Male' || !applicant.gender, boldFont);
    drawCheckbox(p1, 288.5, 554.0, applicant.gender === 'Female', boldFont);
    drawCheckbox(p1, 324.5, 554.0, applicant.gender === 'Transgender', boldFont);

    // Marital Status
    drawCheckbox(p1, 118.5, 537.0, applicant.maritalStatus === 'Married', boldFont);
    drawCheckbox(p1, 166.0, 537.0, applicant.maritalStatus === 'Unmarried', boldFont);
    drawCheckbox(p1, 216.0, 537.0, applicant.maritalStatus === 'Single' || !applicant.maritalStatus, boldFont);
    drawCheckbox(p1, 254.0, 537.0, applicant.maritalStatus === 'Divorced', boldFont);
    drawCheckbox(p1, 300.0, 537.0, false, boldFont); // Living Apart

    // Relative Type (Father / Mother / Spouse)
    drawCheckbox(p1, 121.0, 518.5, applicant.relationshipType === 'Father' || !applicant.relationshipType, boldFont);
    drawCheckbox(p1, 169.0, 518.5, applicant.relationshipType === 'Mother', boldFont);
    drawCheckbox(p1, 217.0, 518.5, applicant.relationshipType === 'Spouse', boldFont);

    // Relative Name letter boxes
    drawTextSimple(p1, applicant.relativePrefix || 'MR', 118.0, 496.0, boldFont, 7.5);
    drawStringInBoxes(p1, applicant.relativeFirstName || '', firstNameCenters, 496.0, boldFont, 7.5);
    drawStringInBoxes(p1, applicant.relativeMiddleName || '', middleNameCenters, 496.0, boldFont, 7.5);
    drawStringInBoxes(p1, applicant.relativeLastName || '', lastNameCenters, 496.0, boldFont, 7.5);

    // Nationality
    drawCheckbox(p1, 111.5, 457.0, applicant.nationality !== 'Others', boldFont);
    drawCheckbox(p1, 159.0, 457.0, applicant.nationality === 'Others', boldFont);
    if (applicant.nationalityOtherCountry) {
      drawTextSimple(p1, applicant.nationalityOtherCountry, 265.0, 455.6, regFont, 8);
    }

    // Occupation Type
    const occ = applicant.occupationType || 'Salaried-Private';
    if (occ.startsWith('Salaried')) {
      drawCheckbox(p1, 111.5, 437.0, true, boldFont); // S-Service
      if (occ === 'Salaried-Private') drawCheckbox(p1, 159.5, 437.0, true, boldFont);
      if (occ === 'Salaried-Public') drawCheckbox(p1, 220.5, 437.0, true, boldFont);
      if (occ === 'Salaried-Govt') drawCheckbox(p1, 281.0, 437.0, true, boldFont);
    } else {
      drawCheckbox(p1, 111.5, 419.5, occ === 'Others', boldFont);
      drawCheckbox(p1, 160.0, 419.5, occ === 'Professional', boldFont);
      drawCheckbox(p1, 220.5, 419.5, occ === 'Self employed', boldFont);
      drawCheckbox(p1, 281.5, 419.5, occ === 'Retired', boldFont);
      drawCheckbox(p1, 328.5, 419.5, occ === 'House Wife', boldFont);
      drawCheckbox(p1, 380.0, 419.5, occ === 'Student', boldFont);
      drawCheckbox(p1, 431.0, 419.5, occ === 'Business', boldFont);
    }

    // Annual Income
    drawTextSimple(p1, applicant.annualIncome ? `${applicant.annualIncome}/-` : '', 140.0, 363.9, boldFont, 8.5);

    // Religion
    drawCheckbox(p1, 113.0, 348.5, applicant.religion === 'Hindu' || !applicant.religion, boldFont);
    drawCheckbox(p1, 149.0, 348.5, applicant.religion === 'Muslim', boldFont);
    drawCheckbox(p1, 197.5, 348.5, applicant.religion === 'Christian', boldFont);
    drawCheckbox(p1, 247.5, 348.5, applicant.religion === 'Sikh', boldFont);
    drawCheckbox(p1, 283.5, 348.5, applicant.religion === 'Others', boldFont);

    // Category
    drawCheckbox(p1, 114.0, 331.0, applicant.category === 'General' || !applicant.category, boldFont);
    drawCheckbox(p1, 172.0, 331.0, applicant.category === 'OBC', boldFont);
    drawCheckbox(p1, 219.0, 331.0, applicant.category === 'SC', boldFont);
    drawCheckbox(p1, 258.0, 331.0, applicant.category === 'ST', boldFont);

    // Disability
    drawCheckbox(p1, 113.5, 314.0, applicant.disability === 'Yes', boldFont);
    drawCheckbox(p1, 149.5, 314.0, applicant.disability !== 'Yes', boldFont);

    // Educational Qualification
    drawCheckbox(p1, 113.5, 280.0, applicant.education === 'Illiterate', boldFont);
    drawCheckbox(p1, 167.5, 280.0, applicant.education === 'Below SSC', boldFont);
    drawCheckbox(p1, 221.0, 280.0, applicant.education === 'SSC', boldFont);
    drawCheckbox(p1, 254.5, 280.0, applicant.education === 'HSC', boldFont);
    drawCheckbox(p1, 288.5, 280.0, applicant.education === 'Graduate' || !applicant.education, boldFont);
    drawCheckbox(p1, 338.0, 280.0, applicant.education === 'Post Graduate', boldFont);
    drawCheckbox(p1, 403.0, 280.0, applicant.education === 'Professional', boldFont);
    drawCheckbox(p1, 461.5, 280.0, applicant.education === 'Others', boldFont);

    // Place of Birth (11 boxes, pitch 12.0)
    const placeOfBirthCenters = [117.5, 129.5, 141.5, 154.0, 166.0, 178.0, 190.0, 202.0, 214.0, 226.0, 238.0];
    drawStringInBoxes(p1, (applicant.placeOfBirth || 'PURNA').toUpperCase(), placeOfBirthCenters, 220.5, boldFont, 7.5);
    // Citizenship on dotted line
    drawTextSimple(p1, (applicant.citizenship || 'INDIAN').toUpperCase(), 435.0, 221.0, boldFont, 8);

    // Residential Status
    drawCheckbox(p1, 101.5, 206.5, applicant.residentialStatus === 'Resident Individual' || !applicant.residentialStatus, boldFont);
    drawCheckbox(p1, 191.0, 206.5, applicant.residentialStatus === 'Non Resident Indian', boldFont);
    drawCheckbox(p1, 285.5, 206.5, applicant.residentialStatus === 'Foreign National', boldFont);

    // Tax Residence in India only
    drawCheckbox(p1, 337.0, 190.5, applicant.taxResidenceIndiaOnly !== false, boldFont);

    // PAN Number (10 boxes)
    const panCenters = [267.0, 280.0, 293.0, 306.0, 319.0, 332.0, 345.0, 358.0, 371.0, 384.0];
    if (applicant.panNumber) {
      drawStringInBoxes(p1, applicant.panNumber, panCenters, 169.0, boldFont, 8.5);
    }

    // Contact Details
    // Mobile Number (10 boxes)
    const mobCenters = [163.5, 177.8, 192.1, 206.4, 220.7, 235.0, 249.3, 263.6, 277.9, 292.2];
    if (applicant.mobileNumber) {
      drawStringInBoxes(p1, applicant.mobileNumber.replace(/[^0-9]/g, ''), mobCenters, 118.0, boldFont, 8.5);
    }
    drawTextSimple(p1, applicant.email || '', 355.0, 118.0, regFont, 8);

    // Alternate Mobile (10 boxes)
    if (applicant.alternateMobile) {
      drawStringInBoxes(p1, applicant.alternateMobile.replace(/[^0-9]/g, ''), mobCenters, 98.0, boldFont, 8.5);
    }
  }

  // ----------------------------------------------------
  // PAGE 2: POI / POA & Local/Permanent Address & Attestation
  // ----------------------------------------------------
  if (totalPages >= 2) {
    const p2 = doc.getPage(1);

    // Proof of Identity checkboxes
    drawCheckbox(p2, 40.5, 798.0, applicant.idProofType === 'Passport', boldFont);
    drawCheckbox(p2, 130.5, 798.0, applicant.idProofType === 'Voter ID', boldFont);
    drawCheckbox(p2, 245.0, 798.0, applicant.idProofType === 'Driving Licence', boldFont);
    drawCheckbox(p2, 337.0, 798.0, applicant.idProofType === 'Aadhaar' || !applicant.idProofType, boldFont);
    drawCheckbox(p2, 425.0, 798.0, applicant.idProofType === 'Other', boldFont);
    drawCheckbox(p2, 41.5, 781.5, applicant.idProofType === 'NREGA', boldFont);

    // Document No / ID boxes (pitch 12.8 pt starting at 165.0)
    const idBoxes: number[] = [];
    for (let i = 0; i < 24; i++) idBoxes.push(171.3 + i * 12.8);
    if (applicant.idProofNumber) {
      drawStringInBoxes(p2, applicant.idProofNumber.replace(/[^a-zA-Z0-9]/g, ''), idBoxes, 735.0, boldFont, 8);
    }

    // Local Address Type
    drawCheckbox(p2, 115.0, 706.5, applicant.addressType === 'Residential/Business', boldFont);
    drawCheckbox(p2, 209.0, 706.5, applicant.addressType === 'Residential' || !applicant.addressType, boldFont);
    drawCheckbox(p2, 272.5, 706.5, applicant.addressType === 'Business', boldFont);
    drawCheckbox(p2, 328.0, 706.5, applicant.addressType === 'Registered Office', boldFont);

    // Local Address Line 1 (28 boxes, pitch 15.5)
    const locAddrBoxes: number[] = [];
    for (let i = 0; i < 28; i++) locAddrBoxes.push(122.7 + i * 15.5);
    drawStringInBoxes(p2, applicant.localAddressLine1 || '', locAddrBoxes, 686.0, boldFont, 8);

    // Local City (11 boxes, pitch 12.8)
    const locCityBoxes: number[] = [];
    for (let i = 0; i < 11; i++) locCityBoxes.push(121.4 + i * 12.8);
    drawStringInBoxes(p2, applicant.localCity || '', locCityBoxes, 667.0, boldFont, 8);

    // Local District (16 boxes, pitch 12.8)
    const locDistBoxes: number[] = [];
    for (let i = 0; i < 16; i++) locDistBoxes.push(326.4 + i * 12.8);
    drawStringInBoxes(p2, applicant.localDistrict || '', locDistBoxes, 667.0, boldFont, 8);

    // Local State (16 boxes, pitch 12.8)
    const locStateBoxes: number[] = [];
    for (let i = 0; i < 16; i++) locStateBoxes.push(121.4 + i * 12.8);
    drawStringInBoxes(p2, applicant.localState || '', locStateBoxes, 648.5, boldFont, 8);

    // Local Country Code (2 boxes: 415.5, 428.0)
    drawStringInBoxes(p2, applicant.localCountryCode || 'IN', [415.5, 428.0], 648.5, boldFont, 8);

    // Local Pin (6 boxes, pitch 12.8)
    const locPinBoxes = [492.4, 505.2, 518.0, 530.8, 543.6, 556.4];
    if (applicant.localPin) {
      drawStringInBoxes(p2, applicant.localPin.replace(/[^0-9]/g, ''), locPinBoxes, 648.5, boldFont, 8.5);
    }

    // Permanent Address Details
    drawCheckbox(p2, 213.0, 616.5, true, boldFont); // Residential

    const permLine1 = applicant.permanentSameAsLocal
      ? applicant.localAddressLine1
      : applicant.permanentAddressLine1 || applicant.localAddressLine1;
    const permCity = applicant.permanentSameAsLocal
      ? applicant.localCity
      : applicant.permanentCity || applicant.localCity;
    const permDist = applicant.permanentSameAsLocal
      ? applicant.localDistrict
      : applicant.permanentDistrict || applicant.localDistrict;
    const permState = applicant.permanentSameAsLocal
      ? applicant.localState
      : applicant.permanentState || applicant.localState;
    const permPin = applicant.permanentSameAsLocal
      ? applicant.localPin
      : applicant.permanentPin || applicant.localPin;

    // Perm Address Line (boxes pitch 12.7)
    const permAddrBoxes: number[] = [];
    for (let i = 0; i < 35; i++) permAddrBoxes.push(123.3 + i * 12.7);
    drawStringInBoxes(p2, permLine1 || '', permAddrBoxes, 594.0, boldFont, 8);

    // Perm City (15 boxes, pitch 12.7)
    const permCityBoxes: number[] = [];
    for (let i = 0; i < 15; i++) permCityBoxes.push(123.3 + i * 12.7);
    drawStringInBoxes(p2, permCity || '', permCityBoxes, 576.0, boldFont, 8);

    // Perm Dist (18 boxes, pitch 12.7)
    const permDistBoxes: number[] = [];
    for (let i = 0; i < 18; i++) permDistBoxes.push(327.3 + i * 12.7);
    drawStringInBoxes(p2, permDist || '', permDistBoxes, 576.0, boldFont, 8);

    // Perm State
    drawStringInBoxes(p2, permState || '', permCityBoxes, 557.0, boldFont, 8);
    // Perm Country Code
    drawStringInBoxes(p2, 'IN', [418.3, 431.0], 557.0, boldFont, 8);
    // Perm Pin
    const permPinBoxes = [495.3, 508.0, 520.7, 533.4, 546.1, 558.8];
    if (permPin) {
      drawStringInBoxes(p2, permPin.replace(/[^0-9]/g, ''), permPinBoxes, 557.0, boldFont, 8.5);
    }

    // Passport Photo Box (x = 46.0 to 112.4, y = 224.5 to 303.4)
    if (applicant.photoUrl && applicant.photoUrl.startsWith('data:image')) {
      try {
        const imageBytes = Uint8Array.from(atob(applicant.photoUrl.split(',')[1]), (c) => c.charCodeAt(0));
        const image = applicant.photoUrl.includes('png')
          ? await doc.embedPng(imageBytes)
          : await doc.embedJpg(imageBytes);
        p2.drawImage(image, {
          x: 48.0,
          y: 226.5,
          width: 62.0,
          height: 74.0,
        });
      } catch {
        // Fallback silently if base64 decoding fails
      }
    }

    // Place & Date
    const placeBoxes: number[] = [];
    for (let i = 0; i < 18; i++) placeBoxes.push(80.7 + i * 12.5);
    drawStringInBoxes(p2, (applicant.declarationPlace || applicant.localCity || 'PURNA').toUpperCase(), placeBoxes, 205.5, boldFont, 8);

    const declDateBoxes = [348.5, 361.0, 373.5, 386.0, 400.5, 413.0, 425.0, 437.0];
    const declDate = cleanDate(applicant.declarationDate || applicant.applicationDate || '24102026');
    drawStringInBoxes(p2, declDate, declDateBoxes, 205.5, boldFont, 8);

    // Signature inside the applicant signature box (large box x: 130 to 360, y: 225 to 300)
    const sign = applicant.signatureName || `${applicant.firstName} ${applicant.lastName}`;
    const signWidth = boldFont.widthOfTextAtSize(sign, 10);
    const signX = 245.0 - signWidth / 2;
    p2.drawText(sign, {
      x: signX,
      y: 260.0,
      size: 10,
      font: boldFont,
      color: rgb(0.05, 0.1, 0.35),
    });
  }

  // ----------------------------------------------------
  // PAGE 3: Part-II Account & Services
  // ----------------------------------------------------
  if (totalPages >= 3) {
    const p3 = doc.getPage(2);

    // Type of Account (y = 658.0)
    drawCheckbox(p3, 43.5, 658.0, applicant.accountTypePart2 === 'Savings Bank Account' || !applicant.accountTypePart2, boldFont);
    drawCheckbox(p3, 176.0, 658.0, applicant.accountTypePart2 === 'BSBDA', boldFont);
    drawCheckbox(p3, 351.0, 658.0, applicant.accountTypePart2 === 'Current Account', boldFont);
    drawCheckbox(p3, 453.0, 658.0, applicant.accountTypePart2 === 'Term Deposit', boldFont);

    // Mode of Operation (y = 606.5)
    drawCheckbox(p3, 23.5, 606.5, applicant.modeOfOperation !== 'Jointly Operated', boldFont);
    drawCheckbox(p3, 303.0, 606.5, applicant.modeOfOperation === 'Jointly Operated', boldFont);

    // Services Required
    // 1. ATM / Debit Card (y = 557.5)
    drawCheckbox(p3, 113.5, 557.5, applicant.atmCardRequired !== 'No', boldFont); // Yes
    drawCheckbox(p3, 155.5, 557.5, applicant.atmCardRequired === 'No', boldFont); // No

    const cardName = applicant.atmCardName || `${applicant.firstName} ${applicant.lastName}`.trim();
    drawTextSimple(p3, cardName.toUpperCase(), 195.0, 557.5, boldFont, 8);

    // Card Type
    drawCheckbox(p3, 433.0, 557.5, applicant.cardType === 'Rupay classic', boldFont);
    drawCheckbox(p3, 433.0, 543.0, applicant.cardType === 'Visa', boldFont);
    drawCheckbox(p3, 433.0, 531.5, applicant.cardType === 'Rupay Platinum' || !applicant.cardType, boldFont);
    drawCheckbox(p3, 433.0, 520.0, applicant.cardType === 'Rupay Select', boldFont);

    // 2. AEPS (y = 519.5)
    drawCheckbox(p3, 113.5, 519.5, applicant.aepsRequired !== 'No', boldFont); // Yes
    drawCheckbox(p3, 155.5, 519.5, applicant.aepsRequired === 'No', boldFont); // No

    // 3. Cheque Book (y = 498.0)
    drawCheckbox(p3, 113.5, 498.0, applicant.chequeBookRequired !== 'No', boldFont); // Yes
    drawCheckbox(p3, 155.5, 498.0, applicant.chequeBookRequired === 'No', boldFont); // No

    // 4. Internet Banking (y = 459.5)
    drawCheckbox(p3, 113.5, 459.5, applicant.internetBankingRequired !== 'No', boldFont); // Yes
    drawCheckbox(p3, 155.5, 459.5, applicant.internetBankingRequired === 'No', boldFont); // No
  }

  // ----------------------------------------------------
  // PAGE 5: Form DA-1 Nomination Form
  // ----------------------------------------------------
  if (totalPages >= 5) {
    const p5 = doc.getPage(4);

    drawTextSimple(p5, (applicant.branchName || 'PURNA').toUpperCase(), 280.0, 721.4, boldFont, 8);
    // Note: Customer ID / Account No are left blank for office use

    // Nominee Row 1 (y = 419.1)
    if (applicant.nomineeName) {
      drawTextSimple(p5, applicant.nomineeName.toUpperCase(), 75.0, 419.1, boldFont, 7.5);
      drawTextSimple(p5, (applicant.nomineeAddress || applicant.localCity || '').toUpperCase().slice(0, 32), 145.0, 419.1, regFont, 7);
      drawTextSimple(p5, applicant.nomineeMobile || applicant.mobileNumber || '', 230.0, 419.1, regFont, 7);
      drawTextSimple(p5, (applicant.nomineeRelationship || 'SPOUSE').toUpperCase(), 295.0, 419.1, boldFont, 7.5);
      drawTextSimple(p5, applicant.nomineeAge || '30', 340.0, 419.1, boldFont, 7.5);
      drawTextSimple(p5, applicant.nomineeProportion || '100%', 415.0, 419.1, boldFont, 7.5);
    }
  }

  // ----------------------------------------------------
  // PAGE 6: Nomination Signature & Witness
  // ----------------------------------------------------
  if (totalPages >= 6) {
    const p6 = doc.getPage(5);
    const sign = applicant.signatureName || `${applicant.firstName} ${applicant.lastName}`;
    drawTextSimple(p6, sign, 70.0, 640.0, boldFont, 9, rgb(0.05, 0.1, 0.35));
    drawTextSimple(p6, (applicant.declarationPlace || 'PURNA').toUpperCase(), 215.0, 440.0, boldFont, 8);
    drawTextSimple(p6, applicant.declarationDate || applicant.applicationDate || '24/10/2026', 70.0, 440.0, boldFont, 8);
  }

  // Save the modified PDF with full vector resolution preserved
  return await doc.save();
}

/**
 * Batch generates PDFs for all applicants and packages them into a clean ZIP file
 */
export async function generateBatchZip(
  applicants: ApplicantRecord[],
  customTemplate?: Uint8Array | ArrayBuffer,
  onProgress?: (completed: number, total: number, currentName: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('BOM_Account_Opening_Forms') || zip;
  const templateBytes = customTemplate
    ? new Uint8Array(customTemplate)
    : await loadOriginalTemplate();

  for (let i = 0; i < applicants.length; i++) {
    const app = applicants[i];
    const namePart = `${app.firstName || 'Applicant'}_${app.lastName || ''}`.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `BOM_AOF_${namePart}_${app.id}.pdf`;

    if (onProgress) {
      onProgress(i, applicants.length, `${app.firstName} ${app.lastName}`);
    }

    const pdfBytes = await generateFilledPdf(app, templateBytes);
    folder.file(fileName, pdfBytes);
  }

  if (onProgress) {
    onProgress(applicants.length, applicants.length, 'Finalizing ZIP package...');
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
