import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Copy, Download, UserCheck, FileCheck, ExternalLink } from 'lucide-react';
import { ApplicantRecord } from '../types';

interface SpreadsheetGridProps {
  applicants: ApplicantRecord[];
  selectedId: string;
  onSelectApplicant: (id: string) => void;
  onAddApplicant: () => void;
  onDuplicateApplicant: (id: string) => void;
  onDeleteApplicant: (id: string) => void;
  onExportSpreadsheet: (format: 'xlsx' | 'csv') => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  applicants,
  selectedId,
  onSelectApplicant,
  onAddApplicant,
  onDuplicateApplicant,
  onDeleteApplicant,
  onExportSpreadsheet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;
    const q = searchQuery.toLowerCase();
    return applicants.filter(
      (app) =>
        app.id.toLowerCase().includes(q) ||
        `${app.firstName} ${app.lastName}`.toLowerCase().includes(q) ||
        app.panNumber.toLowerCase().includes(q) ||
        app.mobileNumber.toLowerCase().includes(q) ||
        app.localCity.toLowerCase().includes(q) ||
        app.branchName.toLowerCase().includes(q)
    );
  }, [applicants, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Grid Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, PAN, mobile, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onAddApplicant}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>

          <button
            onClick={() => onExportSpreadsheet('xlsx')}
            title="Download current grid as Excel (.xlsx)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 z-10 select-none">
            <tr>
              <th className="py-2 px-3 w-10 text-center">#</th>
              <th className="py-2 px-3">Applicant Name</th>
              <th className="py-2 px-3">Branch & ID</th>
              <th className="py-2 px-3">PAN & Mobile</th>
              <th className="py-2 px-3">City & Scheme</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredApplicants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No applicant records found matching your query.
                </td>
              </tr>
            ) : (
              filteredApplicants.map((app, index) => {
                const isSelected = app.id === selectedId;
                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplicant(app.id)}
                    className={`h-11 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 text-slate-900 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Index & active marker */}
                    <td className="py-2 px-3 text-center text-slate-400 font-mono tabular-nums">
                      {isSelected ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Active in PDF Preview" />
                      ) : (
                        index + 1
                      )}
                    </td>

                    {/* Applicant Name */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                          {app.namePrefix} {app.firstName} {app.lastName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        DOB: {app.dob || '—'} · {app.gender}
                      </div>
                    </td>

                    {/* Branch & ID */}
                    <td className="py-2 px-3">
                      <div className="truncate max-w-[130px] font-medium text-slate-800">
                        {app.branchName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        {app.id} · SOL: {app.branchCode}
                      </div>
                    </td>

                    {/* PAN & Mobile */}
                    <td className="py-2 px-3 font-mono tabular-nums">
                      <div className="text-slate-900 font-semibold">{app.panNumber || '—'}</div>
                      <div className="text-[11px] text-slate-500">{app.mobileNumber || '—'}</div>
                    </td>

                    {/* City & Scheme */}
                    <td className="py-2 px-3">
                      <div className="text-slate-800">{app.localCity || '—'}</div>
                      <div className="text-[11px] text-slate-500">{app.accountTypePart2}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onDuplicateApplicant(app.id)}
                          title="Duplicate record"
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteApplicant(app.id)}
                          title="Delete record"
                          disabled={applicants.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer info */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          Showing {filteredApplicants.length} of {applicants.length} records
        </span>
        <span className="text-slate-400">
          Click any row to load into PDF preview
        </span>
      </div>
    </div>
  );
};
