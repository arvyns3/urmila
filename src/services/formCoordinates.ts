import { FieldCoordinate } from '../types';

export const BOM_FIELD_COORDINATES: FieldCoordinate[] = [
  // Page 1
  { id: 'p1_app_date', key: 'applicationDate', label: 'Application Date (DDMMYYYY)', page: 1, type: 'date-boxes', x: 467.5, y: 762.5, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_branch_name', key: 'branchName', label: 'Branch Name (18 Boxes)', page: 1, type: 'letter-boxes', x: 120.0, y: 733.5, charSpacing: 11.9, fontSize: 7.5 },
  { id: 'p1_branch_code', key: 'branchCode', label: 'Branch Code (Boxes)', page: 1, type: 'letter-boxes', x: 383.0, y: 733.5, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_app_new', key: 'applicationType', label: 'Application: New', page: 1, type: 'checkbox', x: 383.5, y: 703.5, checkValue: 'New' },
  { id: 'p1_app_update', key: 'applicationType', label: 'Application: Update', page: 1, type: 'checkbox', x: 421.0, y: 703.5, checkValue: 'Update' },
  { id: 'p1_cust_salaried', key: 'customerType', label: 'Customer Type: Salaried', page: 1, type: 'checkbox', x: 275.5, y: 665.0, checkValue: 'Salaried' },
  { id: 'p1_acc_normal', key: 'accountType', label: 'Account Type: Normal', page: 1, type: 'checkbox', x: 118.5, y: 646.0, checkValue: 'Normal' },
  { id: 'p1_name_prefix', key: 'namePrefix', label: 'Name Prefix (MR/MS)', page: 1, type: 'text', x: 118.0, y: 584.5, fontSize: 7.5 },
  { id: 'p1_first_name', key: 'firstName', label: 'First Name (Letter Boxes)', page: 1, type: 'letter-boxes', x: 179.0, y: 584.5, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_middle_name', key: 'middleName', label: 'Middle Name (Letter Boxes)', page: 1, type: 'letter-boxes', x: 298.0, y: 584.5, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_last_name', key: 'lastName', label: 'Last Name (Letter Boxes)', page: 1, type: 'letter-boxes', x: 444.0, y: 584.5, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_dob', key: 'dob', label: 'Date of Birth (DDMMYYYY)', page: 1, type: 'date-boxes', x: 121.5, y: 549.0, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_gender_male', key: 'gender', label: 'Gender: Male', page: 1, type: 'checkbox', x: 252.5, y: 554.0, checkValue: 'Male' },
  { id: 'p1_marital_married', key: 'maritalStatus', label: 'Marital Status: Married', page: 1, type: 'checkbox', x: 118.5, y: 537.0, checkValue: 'Married' },
  { id: 'p1_rel_father', key: 'relationshipType', label: 'Relative: Father', page: 1, type: 'checkbox', x: 121.0, y: 518.5, checkValue: 'Father' },
  { id: 'p1_rel_first_name', key: 'relativeFirstName', label: 'Father/Spouse First Name', page: 1, type: 'letter-boxes', x: 179.0, y: 496.0, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_rel_middle_name', key: 'relativeMiddleName', label: 'Father/Spouse Middle Name', page: 1, type: 'letter-boxes', x: 298.0, y: 496.0, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_rel_last_name', key: 'relativeLastName', label: 'Father/Spouse Last Name', page: 1, type: 'letter-boxes', x: 444.0, y: 496.0, charSpacing: 12.0, fontSize: 7.5 },
  { id: 'p1_nationality_indian', key: 'nationality', label: 'Nationality: Indian', page: 1, type: 'checkbox', x: 111.5, y: 457.0, checkValue: 'In-Indian' },
  { id: 'p1_annual_income', key: 'annualIncome', label: 'Annual Income (Rs)', page: 1, type: 'text', x: 140.0, y: 363.9, fontSize: 8.5 },
  { id: 'p1_religion_hindu', key: 'religion', label: 'Religion: Hindu', page: 1, type: 'checkbox', x: 113.0, y: 348.5, checkValue: 'Hindu' },
  { id: 'p1_category_gen', key: 'category', label: 'Category: General', page: 1, type: 'checkbox', x: 114.0, y: 331.0, checkValue: 'General' },
  { id: 'p1_disability_no', key: 'disability', label: 'Disability: No', page: 1, type: 'checkbox', x: 149.5, y: 314.0, checkValue: 'No' },
  { id: 'p1_edu_graduate', key: 'education', label: 'Education: Graduate', page: 1, type: 'checkbox', x: 288.5, y: 280.0, checkValue: 'Graduate' },
  { id: 'p1_place_birth', key: 'placeOfBirth', label: 'Place / City of Birth', page: 1, type: 'text', x: 112.0, y: 221.0, fontSize: 8 },
  { id: 'p1_pan', key: 'panNumber', label: 'PAN Card (10 Boxes)', page: 1, type: 'letter-boxes', x: 267.0, y: 169.0, charSpacing: 13.0, fontSize: 8.5 },
  { id: 'p1_mobile', key: 'mobileNumber', label: 'Mobile Number (10 Boxes)', page: 1, type: 'letter-boxes', x: 163.5, y: 118.0, charSpacing: 14.3, fontSize: 8.5 },
  { id: 'p1_email', key: 'email', label: 'Email ID', page: 1, type: 'text', x: 355.0, y: 118.0, fontSize: 8 },

  // Page 2
  { id: 'p2_id_aadhaar', key: 'idProofType', label: 'ID Proof: Aadhaar', page: 2, type: 'checkbox', x: 337.0, y: 798.0, checkValue: 'Aadhaar' },
  { id: 'p2_id_number', key: 'idProofNumber', label: 'ID / Aadhaar Document No (Boxes)', page: 2, type: 'letter-boxes', x: 171.3, y: 735.0, charSpacing: 12.8, fontSize: 8 },
  { id: 'p2_addr_type_res', key: 'addressType', label: 'Address Type: Residential', page: 2, type: 'checkbox', x: 209.0, y: 706.5, checkValue: 'Residential' },
  { id: 'p2_addr_line1', key: 'localAddressLine1', label: 'Local Address Line 1 (Boxes)', page: 2, type: 'letter-boxes', x: 122.7, y: 686.0, charSpacing: 15.5, fontSize: 8 },
  { id: 'p2_addr_city', key: 'localCity', label: 'Local City (Boxes)', page: 2, type: 'letter-boxes', x: 121.4, y: 667.0, charSpacing: 12.8, fontSize: 8 },
  { id: 'p2_addr_district', key: 'localDistrict', label: 'Local District (Boxes)', page: 2, type: 'letter-boxes', x: 326.4, y: 667.0, charSpacing: 12.8, fontSize: 8 },
  { id: 'p2_addr_state', key: 'localState', label: 'Local State (Boxes)', page: 2, type: 'letter-boxes', x: 121.4, y: 648.5, charSpacing: 12.8, fontSize: 8 },
  { id: 'p2_addr_pin', key: 'localPin', label: 'Local PIN (6 Boxes)', page: 2, type: 'letter-boxes', x: 492.4, y: 648.5, charSpacing: 12.8, fontSize: 8.5 },
  { id: 'p2_photo', key: 'photoUrl', label: 'Passport Photo Affix Area', page: 2, type: 'image', x: 46.0, y: 224.5, boxWidth: 66.4, boxHeight: 78.9 },
  { id: 'p2_place', key: 'declarationPlace', label: 'Declaration Place', page: 2, type: 'text', x: 80.7, y: 205.5, fontSize: 8 },
  { id: 'p2_sign', key: 'signatureName', label: 'Applicant Signature Stamp', page: 2, type: 'signature', x: 495.0, y: 258.0, fontSize: 9.5 },

  // Page 3
  { id: 'p3_acc_savings', key: 'accountTypePart2', label: 'Part-II: Savings Account', page: 3, type: 'checkbox', x: 43.5, y: 658.0, checkValue: 'Savings Bank Account' },
  { id: 'p3_atm_yes', key: 'atmCardRequired', label: 'ATM / Debit Card: Yes', page: 3, type: 'checkbox', x: 113.5, y: 557.5, checkValue: 'Yes' },
  { id: 'p3_card_name', key: 'atmCardName', label: 'Name on Card', page: 3, type: 'text', x: 195.0, y: 557.5, fontSize: 8 },
  { id: 'p3_card_platinum', key: 'cardType', label: 'Card: Rupay Platinum', page: 3, type: 'checkbox', x: 433.0, y: 531.5, checkValue: 'Rupay Platinum' },
  { id: 'p3_cheque_yes', key: 'chequeBookRequired', label: 'Cheque Book: Yes', page: 3, type: 'checkbox', x: 113.5, y: 498.0, checkValue: 'Yes' },
  { id: 'p3_inb_yes', key: 'internetBankingRequired', label: 'Internet Banking: Yes', page: 3, type: 'checkbox', x: 113.5, y: 459.5, checkValue: 'Yes' },

  // Page 5
  { id: 'p5_nominee_name', key: 'nomineeName', label: 'Nominee Name', page: 5, type: 'text', x: 75.0, y: 419.1, fontSize: 7.5 },
  { id: 'p5_nominee_relation', key: 'nomineeRelationship', label: 'Nominee Relationship', page: 5, type: 'text', x: 295.0, y: 419.1, fontSize: 7.5 },
  { id: 'p5_nominee_age', key: 'nomineeAge', label: 'Nominee Age', page: 5, type: 'text', x: 340.0, y: 419.1, fontSize: 7.5 },
];
