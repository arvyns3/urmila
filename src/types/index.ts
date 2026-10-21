export interface ApplicantRecord {
  id: string;
  // Header / Application metadata
  branchName: string;
  branchCode: string;
  applicationDate: string; // DD/MM/YYYY
  applicationType: 'New' | 'Update';
  customerId?: string;
  accountNo?: string;
  ckycNo?: string;
  customerType: 'General' | 'Pensioner' | 'Senior Citizen' | 'Salaried' | 'Minor' | 'Staff' | 'Ex Staff';
  accountType: 'Normal' | 'BSBDA' | 'BSBDA-Small';

  // Section 01: Personal Details
  namePrefix: 'MR' | 'MS' | 'MRS' | 'DR' | 'OTHER';
  firstName: string;
  middleName: string;
  lastName: string;
  maidenName?: string;
  dob: string; // DD/MM/YYYY
  gender: 'Male' | 'Female' | 'Transgender';
  maritalStatus: 'Married' | 'Unmarried' | 'Single' | 'Divorced';
  relationshipType: 'Father' | 'Mother' | 'Spouse';
  relativePrefix: string;
  relativeFirstName: string;
  relativeMiddleName: string;
  relativeLastName: string;
  guardianName?: string;
  nationality: 'In-Indian' | 'Others';
  nationalityOtherCountry?: string;
  occupationType:
    | 'Salaried-Private'
    | 'Salaried-Public'
    | 'Salaried-Govt'
    | 'Professional'
    | 'Self employed'
    | 'Retired'
    | 'House Wife'
    | 'Student'
    | 'Business'
    | 'Others';
  annualIncome: string;
  religion: 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Others';
  category: 'General' | 'OBC' | 'SC' | 'ST';
  disability: 'No' | 'Yes';
  education:
    | 'Graduate'
    | 'Post Graduate'
    | 'Professional'
    | 'HSC'
    | 'SSC'
    | 'Below SSC'
    | 'Illiterate'
    | 'Others';
  politicallyExposed: 'None' | 'Politically exposed Person' | 'Related to politically Exposed Person';
  placeOfBirth: string;
  countryCodeOfBirth: string; // IN
  citizenship: string; // INDIAN
  residentialStatus: 'Resident Individual' | 'Non Resident Indian' | 'Foreign National' | 'Person of Indian Origin';
  taxResidenceIndiaOnly: boolean;
  panNumber: string; // 10 chars

  // Section 02: Contact Details
  mobileNumber: string; // 10 digits
  email: string;
  alternateMobile?: string;

  // Section 03 & 04: Proof of Identity / Address & Local Address
  idProofType: 'Aadhaar' | 'Passport' | 'Voter ID' | 'Driving Licence' | 'NREGA' | 'Other';
  idProofNumber: string;
  addressType: 'Residential' | 'Residential/Business' | 'Business' | 'Registered Office';
  localAddressLine1: string;
  localAddressLine2: string;
  localCity: string;
  localDistrict: string;
  localState: string;
  localCountryCode: string; // IN
  localPin: string; // 6 digits

  // Section 05: Permanent Address
  permanentSameAsLocal: boolean;
  permanentAddressLine1?: string;
  permanentCity?: string;
  permanentDistrict?: string;
  permanentState?: string;
  permanentPin?: string;

  // Page 3: Part-II Account & Services
  accountTypePart2: 'Savings Bank Account' | 'BSBDA' | 'Current Account' | 'Term Deposit';
  modeOfOperation: 'Self/Either or Survivor' | 'Jointly Operated' | 'Any one or Survivor' | 'Former or Survivor';
  atmCardRequired: 'Yes' | 'No';
  atmCardName: string;
  cardType: 'Rupay Platinum' | 'Visa' | 'Rupay Select' | 'Rupay classic';
  chequeBookRequired: 'Yes' | 'No';
  internetBankingRequired: 'Yes' | 'No';
  aepsRequired: 'Yes' | 'No';

  // Page 5: Form DA-1 Nomination
  nomineeName: string;
  nomineeRelationship: string;
  nomineeAge: string;
  nomineeAddress: string;
  nomineeMobile?: string;
  nomineeProportion?: string;

  // Photos & Attestation
  photoUrl?: string; // Optional base64 or URL
  signatureName?: string;
  declarationPlace: string;
  declarationDate: string;
}

export interface FieldCoordinate {
  id: string;
  key: keyof ApplicantRecord | string;
  label: string;
  page: number; // 1-indexed (1 to 13)
  type: 'text' | 'letter-boxes' | 'checkbox' | 'date-boxes' | 'image' | 'signature';
  x: number; // pt from left
  y: number; // pt from bottom
  charSpacing?: number; // pt between character cells
  fontSize?: number;
  boxWidth?: number;
  boxHeight?: number;
  checkValue?: string; // for checkboxes: value that triggers 'X'
}

export interface SpreadsheetColumnMap {
  spreadsheetColumn: string;
  targetFieldKey: keyof ApplicantRecord;
  confidence: number; // 0-1
}

export interface SpreadsheetConnectionState {
  sourceType: 'sample' | 'google-sheets' | 'file-upload' | 'manual';
  sourceName: string;
  sheetUrl?: string;
  lastSyncedAt?: string;
  rowCount: number;
  isLoading: boolean;
  error?: string | null;
}
