import React, { useState } from 'react';
import { User, MapPin, CreditCard, Shield, Camera, Upload } from 'lucide-react';
import { ApplicantRecord } from '../types';

interface ApplicantFormEditorProps {
  applicant: ApplicantRecord;
  onChange: (updated: ApplicantRecord) => void;
}

export const ApplicantFormEditor: React.FC<ApplicantFormEditorProps> = ({
  applicant,
  onChange,
}) => {
  const [section, setSection] = useState<'personal' | 'address' | 'banking' | 'nominee'>('personal');

  const update = <K extends keyof ApplicantRecord>(key: K, value: ApplicantRecord[K]) => {
    onChange({
      ...applicant,
      [key]: value,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          update('photoUrl', reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-100 border-b border-slate-200">
        <button
          onClick={() => setSection('personal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            section === 'personal'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Personal & KYC</span>
        </button>

        <button
          onClick={() => setSection('address')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            section === 'address'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Address & Photo</span>
        </button>

        <button
          onClick={() => setSection('banking')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            section === 'banking'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Banking & Services</span>
        </button>

        <button
          onClick={() => setSection('nominee')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            section === 'nominee'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Nomination (DA-1)</span>
        </button>
      </div>

      {/* Editor Content Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {section === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Prefix</label>
                <select
                  value={applicant.namePrefix}
                  onChange={(e) => update('namePrefix', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="MR">MR</option>
                  <option value="MS">MS</option>
                  <option value="MRS">MRS</option>
                  <option value="DR">DR</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-[11px] font-medium text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={applicant.firstName}
                  onChange={(e) => update('firstName', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono font-medium"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={applicant.middleName}
                  onChange={(e) => update('middleName', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={applicant.lastName}
                  onChange={(e) => update('lastName', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Date of Birth (DD/MM/YYYY) *</label>
                <input
                  type="text"
                  value={applicant.dob}
                  onChange={(e) => update('dob', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Gender *</label>
                <select
                  value={applicant.gender}
                  onChange={(e) => update('gender', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Marital Status *</label>
                <select
                  value={applicant.maritalStatus}
                  onChange={(e) => update('maritalStatus', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>

            {/* Father / Relative */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Relationship</label>
                <select
                  value={applicant.relationshipType}
                  onChange={(e) => update('relationshipType', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Relative First Name</label>
                <input
                  type="text"
                  value={applicant.relativeFirstName}
                  onChange={(e) => update('relativeFirstName', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Relative Last Name</label>
                <input
                  type="text"
                  value={applicant.relativeLastName}
                  onChange={(e) => update('relativeLastName', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono"
                />
              </div>
            </div>

            {/* Identity & Tax Numbers */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">PAN Card Number *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={applicant.panNumber}
                  onChange={(e) => update('panNumber', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono font-semibold tracking-wider text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  ID Proof Document No ({applicant.idProofType}) *
                </label>
                <input
                  type="text"
                  value={applicant.idProofNumber}
                  onChange={(e) => update('idProofNumber', e.target.value.toUpperCase())}
                  placeholder="Aadhaar / Passport No"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono text-slate-900"
                />
              </div>
            </div>

            {/* Occupation, Income, Education */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Occupation</label>
                <select
                  value={applicant.occupationType}
                  onChange={(e) => update('occupationType', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Salaried-Private">Salaried (Private)</option>
                  <option value="Salaried-Public">Salaried (Public)</option>
                  <option value="Salaried-Govt">Salaried (Govt)</option>
                  <option value="Professional">Professional</option>
                  <option value="Self employed">Self Employed</option>
                  <option value="Business">Business</option>
                  <option value="Retired">Retired</option>
                  <option value="Student">Student</option>
                  <option value="House Wife">House Wife</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Annual Income (Rs)</label>
                <input
                  type="text"
                  value={applicant.annualIncome}
                  onChange={(e) => update('annualIncome', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Education</label>
                <select
                  value={applicant.education}
                  onChange={(e) => update('education', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="Professional">Professional</option>
                  <option value="HSC">HSC (12th)</option>
                  <option value="SSC">SSC (10th)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {section === 'address' && (
          <div className="space-y-4">
            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Mobile Number (10 digits) *</label>
                <input
                  type="text"
                  maxLength={10}
                  value={applicant.mobileNumber}
                  onChange={(e) => update('mobileNumber', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={applicant.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-800">Local / Communication Address</label>
              <div>
                <input
                  type="text"
                  value={applicant.localAddressLine1}
                  onChange={(e) => update('localAddressLine1', e.target.value.toUpperCase())}
                  placeholder="Address Line 1 (Flat, Building, Street)"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-medium"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={applicant.localAddressLine2}
                  onChange={(e) => update('localAddressLine2', e.target.value.toUpperCase())}
                  placeholder="Address Line 2 (Area, Landmark)"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">City / Village *</label>
                  <input
                    type="text"
                    value={applicant.localCity}
                    onChange={(e) => update('localCity', e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">District *</label>
                  <input
                    type="text"
                    value={applicant.localDistrict}
                    onChange={(e) => update('localDistrict', e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">State *</label>
                  <input
                    type="text"
                    value={applicant.localState}
                    onChange={(e) => update('localState', e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={applicant.localPin}
                    onChange={(e) => update('localPin', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Passport Photo Stamp Attachment */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                Applicant Passport Photo (Page 2)
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                {applicant.photoUrl ? (
                  <img
                    src={applicant.photoUrl}
                    alt="Applicant"
                    className="w-14 h-16 object-cover border border-slate-300 rounded shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-16 bg-slate-200 border border-dashed border-slate-400 rounded flex flex-col items-center justify-center text-slate-500">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px]">Photo</span>
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-medium text-slate-700 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Passport Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Auto-stamped onto Page 2 photo box maintaining original PDF vector boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {section === 'banking' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Bank Branch Name</label>
                <input
                  type="text"
                  value={applicant.branchName}
                  onChange={(e) => update('branchName', e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Branch Code (SOL)</label>
                <input
                  type="text"
                  value={applicant.branchCode}
                  onChange={(e) => update('branchCode', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Part-II Account Scheme</label>
                <select
                  value={applicant.accountTypePart2}
                  onChange={(e) => update('accountTypePart2', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Savings Bank Account">Savings Bank Account</option>
                  <option value="Current Account">Current Account</option>
                  <option value="BSBDA">BSBDA</option>
                  <option value="Term Deposit">Term Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Mode of Operation</label>
                <select
                  value={applicant.modeOfOperation}
                  onChange={(e) => update('modeOfOperation', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Self/Either or Survivor">Self / Either or Survivor</option>
                  <option value="Jointly Operated">Jointly Operated</option>
                </select>
              </div>
            </div>

            {/* ATM & Card */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
              <label className="block text-[11px] font-semibold text-slate-800">ATM-Cum-Debit Card Service</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Card Required?</label>
                  <select
                    value={applicant.atmCardRequired}
                    onChange={(e) => update('atmCardRequired', e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Card Type</label>
                  <select
                    value={applicant.cardType}
                    onChange={(e) => update('cardType', e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="Rupay Platinum">Rupay Platinum</option>
                    <option value="Visa">Visa</option>
                    <option value="Rupay Select">Rupay Select</option>
                    <option value="Rupay classic">Rupay Classic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Name as on Card</label>
                  <input
                    type="text"
                    value={applicant.atmCardName}
                    onChange={(e) => update('atmCardName', e.target.value.toUpperCase())}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-mono font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Other services */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Cheque Book</label>
                <select
                  value={applicant.chequeBookRequired}
                  onChange={(e) => update('chequeBookRequired', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Internet Banking</label>
                <select
                  value={applicant.internetBankingRequired}
                  onChange={(e) => update('internetBankingRequired', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">AEPS Facility</label>
                <select
                  value={applicant.aepsRequired}
                  onChange={(e) => update('aepsRequired', e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {section === 'nominee' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50/50 rounded border border-amber-200/80">
              <span className="text-[11px] font-semibold text-amber-900 block mb-0.5">
                Form DA-1 (Nomination Form) — Page 5
              </span>
              <p className="text-[10px] text-amber-700">
                Under Section 45-ZA of the Banking Regulation Act, 1949. Automatically mapped and printed on Page 5.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Nominee Full Name</label>
                <input
                  type="text"
                  value={applicant.nomineeName}
                  onChange={(e) => update('nomineeName', e.target.value.toUpperCase())}
                  placeholder="e.g. PRIYA SHARMA"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Relationship with Depositor</label>
                <input
                  type="text"
                  value={applicant.nomineeRelationship}
                  onChange={(e) => update('nomineeRelationship', e.target.value.toUpperCase())}
                  placeholder="e.g. SPOUSE / FATHER / MOTHER"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Age</label>
                <input
                  type="text"
                  value={applicant.nomineeAge}
                  onChange={(e) => update('nomineeAge', e.target.value)}
                  placeholder="30"
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Mobile</label>
                <input
                  type="text"
                  value={applicant.nomineeMobile}
                  onChange={(e) => update('nomineeMobile', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Proportion</label>
                <input
                  type="text"
                  value={applicant.nomineeProportion || '100%'}
                  onChange={(e) => update('nomineeProportion', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Nominee Address</label>
              <input
                type="text"
                value={applicant.nomineeAddress}
                onChange={(e) => update('nomineeAddress', e.target.value.toUpperCase())}
                placeholder="Full address of the nominee"
                className="w-full border border-slate-300 rounded px-2 py-1.5 uppercase"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
