import React from 'react';
import { Download, FileSpreadsheet, Eye, Sliders, Archive } from 'lucide-react';

interface HeaderProps {
  activeTab: 'spreadsheet' | 'inspector' | 'mapper' | 'specs';
  setActiveTab: (tab: 'spreadsheet' | 'inspector' | 'mapper' | 'specs') => void;
  onDownloadCurrent: () => void;
  onBatchDownload: () => void;
  isGenerating: boolean;
  totalApplicants: number;
  currentApplicantName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadCurrent,
  onBatchDownload,
  isGenerating,
  totalApplicants,
  currentApplicantName,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          AutoFill PDF Pro
        </a>
        <span className="hidden sm:inline text-xs text-slate-400 font-normal">
          · Bank Form Automation
        </span>
      </div>

      {/* Zone 2: Single-line Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('spreadsheet')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
            activeTab === 'spreadsheet'
              ? 'text-white border-b-2 border-amber-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
          <span>Connected Sheet ({totalApplicants})</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
            activeTab === 'inspector'
              ? 'text-white border-b-2 border-amber-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>Record Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('mapper')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
            activeTab === 'mapper'
              ? 'text-white border-b-2 border-amber-500 font-semibold'
              : 'hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Field Calibration</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onBatchDownload}
          disabled={isGenerating || totalApplicants === 0}
          title="Download all filled forms in a single ZIP file"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-md transition-colors whitespace-nowrap border border-slate-700 disabled:opacity-50"
        >
          <Archive className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Batch ZIP ({totalApplicants})</span>
          <span className="sm:hidden">ZIP</span>
        </button>

        <button
          onClick={onDownloadCurrent}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-md transition-colors whitespace-nowrap shadow-sm disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </button>
      </div>
    </header>
  );
};
