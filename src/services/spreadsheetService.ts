import * as XLSX from 'xlsx';
import { ApplicantRecord, SpreadsheetColumnMap } from '../types';
import { SAMPLE_APPLICANTS } from './sampleData';

/**
 * Normalizes string for fuzzy header matching
 */
function normalizeHeader(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Standard mapping dictionary from common spreadsheet headers to ApplicantRecord keys
 */
const HEADER_SYNONYMS: Record<keyof ApplicantRecord, string[]> = {
  id: ['id', 'appnumber', 'applicantid', 'srno', 'sno', 'recordid'],
  branchName: ['branch', 'branchname', 'homebranch', 'bankbranch'],
  branchCode: ['branchcode', 'code', 'sol', 'solid'],
  applicationDate: ['date', 'applicationdate', 'appliedon', 'createdat'],
  applicationType: ['apptype', 'applicationtype', 'neworupdate'],
  customerId: ['customerid', 'cif', 'custid', 'existingcif'],
  accountNo: ['accountno', 'accno', 'accountnumber', 'acno'],
  ckycNo: ['ckyc', 'ckycno', 'ckycnumber'],
  customerType: ['customertype', 'custtype', 'categorytype'],
  accountType: ['accounttype', 'acctype', 'schemetype'],

  namePrefix: ['prefix', 'title', 'salutation'],
  firstName: ['firstname', 'first', 'givenname', 'fname'],
  middleName: ['middlename', 'middle', 'mname'],
  lastName: ['lastname', 'last', 'surname', 'lname'],
  maidenName: ['maidenname', 'maiden'],
  dob: ['dob', 'dateofbirth', 'birthdate', 'birth'],
  gender: ['gender', 'sex'],
  maritalStatus: ['maritalstatus', 'marital', 'marriedstatus'],
  relationshipType: ['relationtype', 'relationshiptype', 'guardianrelation'],
  relativePrefix: ['relativeprefix', 'fatherprefix'],
  relativeFirstName: ['relativefirstname', 'fathername', 'fatherfirstname', 'spousename'],
  relativeMiddleName: ['relativemiddlename', 'fathermiddlename'],
  relativeLastName: ['relativelastname', 'fatherlastname'],
  guardianName: ['guardianname', 'guardian'],
  nationality: ['nationality', 'citizenshipstatus'],
  nationalityOtherCountry: ['othercountry', 'nationalitycountry'],
  occupationType: ['occupation', 'occupationtype', 'profession', 'jobtype'],
  annualIncome: ['annualincome', 'income', 'salary', 'yearlyincome'],
  religion: ['religion', 'faith'],
  category: ['category', 'caste', 'socialcategory'],
  disability: ['disability', 'handicapped', 'speciallyabled'],
  education: ['education', 'qualification', 'educationalqualification'],
  politicallyExposed: ['pep', 'politicallyexposed', 'politicalexposure'],
  placeOfBirth: ['placeofbirth', 'birthplace', 'cityofbirth'],
  countryCodeOfBirth: ['birthcountrycode', 'countrycodeofbirth'],
  citizenship: ['citizenship'],
  residentialStatus: ['residentialstatus', 'residence'],
  taxResidenceIndiaOnly: ['taxindiaonly', 'indiantaxresident'],
  panNumber: ['pan', 'pannumber', 'panno', 'taxid'],

  mobileNumber: ['mobile', 'mobilenumber', 'phonenumber', 'phone', 'contact', 'cell'],
  email: ['email', 'emailid', 'mail', 'emailaddress'],
  alternateMobile: ['altmobile', 'alternatemobile', 'alternatephone'],

  idProofType: ['idproof', 'idprooftype', 'poi', 'identitydocument'],
  idProofNumber: ['idnumber', 'idproofnumber', 'aadhaar', 'aadhaarno', 'passportno'],
  addressType: ['addresstype', 'addrtype'],
  localAddressLine1: ['address', 'address1', 'addressline1', 'localaddress', 'street'],
  localAddressLine2: ['address2', 'addressline2', 'locality', 'landmark'],
  localCity: ['city', 'localcity', 'town', 'village'],
  localDistrict: ['district', 'localdistrict'],
  localState: ['state', 'localstate', 'province'],
  localCountryCode: ['countrycode', 'isocountry'],
  localPin: ['pin', 'pincode', 'postalcode', 'zip', 'zipcode'],

  permanentSameAsLocal: ['sameaslocal', 'permanentsameaslocal'],
  permanentAddressLine1: ['permanentaddress', 'permaddress', 'permanentaddressline1'],
  permanentCity: ['permanentcity', 'permcity'],
  permanentDistrict: ['permanentdistrict', 'permdistrict'],
  permanentState: ['permanentstate', 'permstate'],
  permanentPin: ['permanentpin', 'permpin'],

  accountTypePart2: ['accountproduct', 'accountsubtype', 'part2acctype'],
  modeOfOperation: ['modeofoperation', 'operationmode'],
  atmCardRequired: ['debitcard', 'atmcard', 'atmrequired'],
  atmCardName: ['cardname', 'nameoncard', 'debitcardname'],
  cardType: ['cardtype', 'debitcardtype'],
  chequeBookRequired: ['chequebook', 'chequerequired', 'chequebookrequired'],
  internetBankingRequired: ['netbanking', 'internetbanking', 'inbrequired'],
  aepsRequired: ['aeps', 'aepsrequired'],

  nomineeName: ['nominee', 'nomineename'],
  nomineeRelationship: ['nomineerelation', 'nomineerelationship'],
  nomineeAge: ['nomineeage', 'ageofnominee'],
  nomineeAddress: ['nomineeaddress', 'nomineeaddr'],
  nomineeMobile: ['nomineemobile', 'nomineephone'],
  nomineeProportion: ['nomineeproportion', 'nomineeshare'],

  photoUrl: ['photo', 'photourl', 'image', 'picture'],
  signatureName: ['signature', 'signaturename', 'signname'],
  declarationPlace: ['place', 'declarationplace', 'signplace'],
  declarationDate: ['declarationdate', 'signdate'],
};

/**
 * Automatically creates column mapping predictions
 */
export function autoMapColumns(headers: string[]): SpreadsheetColumnMap[] {
  const result: SpreadsheetColumnMap[] = [];

  for (const header of headers) {
    const norm = normalizeHeader(header);
    let bestMatchKey: keyof ApplicantRecord | null = null;
    let bestConfidence = 0;

    for (const [key, synonyms] of Object.entries(HEADER_SYNONYMS)) {
      const typedKey = key as keyof ApplicantRecord;
      if (norm === normalizeHeader(typedKey)) {
        bestMatchKey = typedKey;
        bestConfidence = 1.0;
        break;
      }
      for (const syn of synonyms) {
        if (norm === syn) {
          bestMatchKey = typedKey;
          bestConfidence = 0.95;
          break;
        } else if (norm.includes(syn) || syn.includes(norm)) {
          if (0.75 > bestConfidence) {
            bestMatchKey = typedKey;
            bestConfidence = 0.75;
          }
        }
      }
      if (bestConfidence === 1.0) break;
    }

    if (bestMatchKey && bestConfidence >= 0.5) {
      result.push({
        spreadsheetColumn: header,
        targetFieldKey: bestMatchKey,
        confidence: bestConfidence,
      });
    }
  }

  return result;
}

/**
 * Converts raw table rows (objects) into standardized ApplicantRecord objects
 */
export function convertRowsToApplicants(
  rows: Record<string, any>[],
  columnMappings?: SpreadsheetColumnMap[]
): ApplicantRecord[] {
  if (!rows || rows.length === 0) return [];

  const headers = Object.keys(rows[0] || {});
  const mappings = columnMappings && columnMappings.length > 0
    ? columnMappings
    : autoMapColumns(headers);

  const mapLookup: Record<string, keyof ApplicantRecord> = {};
  for (const m of mappings) {
    mapLookup[m.spreadsheetColumn] = m.targetFieldKey;
  }

  return rows.map((row, index) => {
    // Start with a safe default matching sample structure
    const base: ApplicantRecord = {
      id: `APP-IMPORT-${String(index + 1).padStart(3, '0')}`,
      branchName: 'MAIN BRANCH',
      branchCode: '0001',
      applicationDate: new Date().toLocaleDateString('en-GB'),
      applicationType: 'New',
      customerType: 'Salaried',
      accountType: 'Normal',

      namePrefix: 'MR',
      firstName: '',
      middleName: '',
      lastName: '',
      dob: '01/01/1990',
      gender: 'Male',
      maritalStatus: 'Single',
      relationshipType: 'Father',
      relativePrefix: 'MR',
      relativeFirstName: '',
      relativeMiddleName: '',
      relativeLastName: '',
      nationality: 'In-Indian',
      occupationType: 'Salaried-Private',
      annualIncome: '500000',
      religion: 'Hindu',
      category: 'General',
      disability: 'No',
      education: 'Graduate',
      politicallyExposed: 'None',
      placeOfBirth: 'INDIA',
      countryCodeOfBirth: 'IN',
      citizenship: 'INDIAN',
      residentialStatus: 'Resident Individual',
      taxResidenceIndiaOnly: true,
      panNumber: '',

      mobileNumber: '',
      email: '',

      idProofType: 'Aadhaar',
      idProofNumber: '',
      addressType: 'Residential',
      localAddressLine1: '',
      localAddressLine2: '',
      localCity: '',
      localDistrict: '',
      localState: '',
      localCountryCode: 'IN',
      localPin: '',

      permanentSameAsLocal: true,

      accountTypePart2: 'Savings Bank Account',
      modeOfOperation: 'Self/Either or Survivor',
      atmCardRequired: 'Yes',
      atmCardName: '',
      cardType: 'Rupay Platinum',
      chequeBookRequired: 'Yes',
      internetBankingRequired: 'Yes',
      aepsRequired: 'Yes',

      nomineeName: '',
      nomineeRelationship: '',
      nomineeAge: '',
      nomineeAddress: '',
      nomineeMobile: '',
      nomineeProportion: '100%',

      declarationPlace: '',
      declarationDate: new Date().toLocaleDateString('en-GB'),
    };

    // Overlay mapped row properties
    for (const [colName, val] of Object.entries(row)) {
      if (val === undefined || val === null) continue;
      const strVal = String(val).trim();
      if (!strVal) continue;

      const targetKey = mapLookup[colName];
      if (targetKey) {
        // Handle special combined fields like full name
        if (targetKey === 'firstName' && !row['LastName'] && !row['lastName'] && strVal.includes(' ')) {
          const parts = strVal.split(/\s+/);
          if (parts.length === 2) {
            base.firstName = parts[0].toUpperCase();
            base.lastName = parts[1].toUpperCase();
          } else if (parts.length >= 3) {
            base.firstName = parts[0].toUpperCase();
            base.middleName = parts[1].toUpperCase();
            base.lastName = parts.slice(2).join(' ').toUpperCase();
          } else {
            base.firstName = strVal.toUpperCase();
          }
        } else if (typeof (base as any)[targetKey] === 'boolean') {
          (base as any)[targetKey] = ['true', 'yes', '1', 'y'].includes(strVal.toLowerCase());
        } else {
          (base as any)[targetKey] = strVal;
        }
      }
    }

    // Default card name from applicant name if missing
    if (!base.atmCardName && base.firstName) {
      base.atmCardName = `${base.firstName} ${base.lastName}`.trim().toUpperCase();
    }
    if (!base.signatureName && base.firstName) {
      base.signatureName = `${base.firstName} ${base.lastName}`.trim();
    }
    if (!base.declarationPlace && base.localCity) {
      base.declarationPlace = base.localCity.toUpperCase();
    }

    return base;
  });
}

/**
 * Parses binary buffer or ArrayBuffer (XLSX, XLS, CSV) into ApplicantRecords
 */
export function parseSpreadsheetBuffer(buffer: ArrayBuffer | Uint8Array): {
  applicants: ApplicantRecord[];
  rawRows: Record<string, any>[];
  headers: string[];
} {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const applicants = convertRowsToApplicants(rawRows);

  return { applicants, rawRows, headers };
}

/**
 * Converts a Google Sheets URL into a direct CSV export endpoint
 */
export function convertGoogleSheetsUrlToCsvExport(url: string): string {
  const trimmed = url.trim();
  // Extract spreadsheet ID: docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch && idMatch[1]) {
    const sheetId = idMatch[1];
    // Check if a specific gid is specified (gid=0 or gid=123456)
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${gid}`;
  }
  return trimmed;
}

/**
 * Fetches and parses a connected Google Sheet
 */
export async function fetchGoogleSheetData(sheetUrl: string): Promise<{
  applicants: ApplicantRecord[];
  rawRows: Record<string, any>[];
  headers: string[];
}> {
  const exportUrl = convertGoogleSheetsUrlToCsvExport(sheetUrl);

  // First try direct fetch
  let csvText = '';
  try {
    const res = await fetch(exportUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    csvText = await res.text();
  } catch (err: any) {
    // If standard CORS fails on direct link, try gviz tq endpoint
    const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch && idMatch[1]) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?tqx=out:csv`;
      const res = await fetch(gvizUrl);
      if (!res.ok) {
        throw new Error(`Failed to load Google Sheet: ${err.message}. Ensure the sheet has "Anyone with the link can view" permissions.`);
      }
      csvText = await res.text();
    } else {
      throw new Error(`Invalid Google Sheet URL. Please ensure it follows the format: https://docs.google.com/spreadsheets/d/{id}/edit`);
    }
  }

  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
  const applicants = convertRowsToApplicants(rawRows);

  return { applicants, rawRows, headers };
}

/**
 * Exports current applicant records into a downloadable XLSX or CSV file
 */
export function exportApplicantsToSpreadsheet(applicants: ApplicantRecord[], format: 'xlsx' | 'csv' = 'xlsx'): Uint8Array {
  const flattened = applicants.map((app) => ({
    'Application ID': app.id,
    'Branch Name': app.branchName,
    'Branch Code': app.branchCode,
    'Date': app.applicationDate,
    'Customer Type': app.customerType,
    'Title': app.namePrefix,
    'First Name': app.firstName,
    'Middle Name': app.middleName,
    'Last Name': app.lastName,
    'Date of Birth': app.dob,
    'Gender': app.gender,
    'Marital Status': app.maritalStatus,
    'Father/Spouse Name': `${app.relativeFirstName} ${app.relativeLastName}`.trim(),
    'PAN Number': app.panNumber,
    'Mobile Number': app.mobileNumber,
    'Email Address': app.email,
    'ID Proof Type': app.idProofType,
    'ID Proof Number': app.idProofNumber,
    'Address Line 1': app.localAddressLine1,
    'Address Line 2': app.localAddressLine2,
    'City': app.localCity,
    'District': app.localDistrict,
    'State': app.localState,
    'PIN Code': app.localPin,
    'Account Scheme': app.accountTypePart2,
    'Debit Card Required': app.atmCardRequired,
    'Name on Card': app.atmCardName,
    'Card Type': app.cardType,
    'Cheque Book': app.chequeBookRequired,
    'Internet Banking': app.internetBankingRequired,
    'Nominee Name': app.nomineeName,
    'Nominee Relation': app.nomineeRelationship,
    'Nominee Age': app.nomineeAge,
    'Nominee Mobile': app.nomineeMobile,
  }));

  const worksheet = XLSX.utils.json_to_sheet(flattened);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Applicants');

  return XLSX.write(workbook, {
    bookType: format,
    type: 'array',
  });
}
