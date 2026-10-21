import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  FileText,
  CheckCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ApplicantRecord } from '../types';

interface PdfViewerPreviewProps {
  pdfUrl: string | null;
  blankTemplateUrl: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  activeApplicant: ApplicantRecord;
  onDownloadCurrent: () => void;
}

export const PdfViewerPreview: React.FC<PdfViewerPreviewProps> = ({
  pdfUrl,
  blankTemplateUrl,
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
  activeApplicant,
  onDownloadCurrent,
}) => {
  const [viewMode, setViewMode] = useState<'filled' | 'blank'>('filled');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const displayUrl = viewMode === 'filled' ? pdfUrl : blankTemplateUrl;

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Top Preview Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        {/* Left: View Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('filled')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              viewMode === 'filled'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Filled Form</span>
          </button>
          <button
            onClick={() => setViewMode('blank')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              viewMode === 'blank'
                ? 'bg-white text-slate-900 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Blank Template</span>
          </button>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono tabular-nums text-slate-200">
            Page <span className="font-bold text-white">{currentPage}</span> of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Quick jump pills */}
          <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-slate-800 text-[11px]">
            <button
              onClick={() => onPageChange(1)}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPage === 1 ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              P.1 CIF
            </button>
            <button
              onClick={() => onPageChange(2)}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPage === 2 ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              P.2 Address
            </button>
            <button
              onClick={() => onPageChange(3)}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPage === 3 ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              P.3 Account
            </button>
            <button
              onClick={() => onPageChange(5)}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentPage === 5 ? 'bg-slate-800 text-amber-400 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              P.5 Nominee
            </button>
          </div>
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
              className="text-slate-400 hover:text-white p-0.5"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] tabular-nums text-slate-300 w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
              className="text-slate-400 hover:text-white p-0.5"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            title="Print High-Resolution Form"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onDownloadCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Viewport */}
      <div className="flex-1 overflow-auto bg-slate-900/95 flex items-center justify-center p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="bg-slate-900 text-white px-4 py-3 rounded-lg border border-slate-800 flex items-center gap-3 shadow-xl">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Stamping High-Res Vector PDF...</span>
            </div>
          </div>
        )}

        {displayUrl ? (
          <div
            className="transition-all duration-150 shadow-2xl bg-white rounded flex items-center justify-center overflow-hidden"
            style={{
              width: `${(595.5 * zoomLevel) / 100}px`,
              height: `${(842.25 * zoomLevel) / 100}px`,
              maxWidth: '100%',
            }}
          >
            <iframe
              key={`${displayUrl}-${currentPage}`}
              src={`${displayUrl}#page=${currentPage}&toolbar=0&navpanes=0&view=FitH`}
              title="Bank of Maharashtra Form Preview"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="text-center text-slate-500 text-xs">
            Preparing high-resolution PDF preview...
          </div>
        )}
      </div>

      {/* Bottom Status bar */}
      <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Stamping Record:</span>
          <span className="text-slate-200 font-semibold">
            {activeApplicant.namePrefix} {activeApplicant.firstName} {activeApplicant.lastName}
          </span>
          <span className="text-slate-500">({activeApplicant.id})</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Resolution: 100% Original Vector Fidelity</span>
          <span>·</span>
          <span>Ink: Black/Dark Navy</span>
        </div>
      </div>
    </div>
  );
};
