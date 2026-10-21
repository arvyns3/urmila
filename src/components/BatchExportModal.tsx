import React from 'react';
import { Archive, CheckCircle2, Download, X } from 'lucide-react';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number; // 0 to 100
  currentStatus: string;
  isComplete: boolean;
  zipBlob: Blob | null;
  totalRecords: number;
  onDownloadZip: () => void;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  progress,
  currentStatus,
  isComplete,
  zipBlob,
  totalRecords,
  onDownloadZip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Batch Document Generation</h3>
          </div>
          {!isComplete && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-800">
              Generating {totalRecords} high-resolution PDF documents from connected spreadsheet data.
            </p>
            <p className="text-slate-500">
              Each customer form is stamped across all 13 pages using the original template.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 truncate max-w-[280px]">
                {currentStatus || 'Processing...'}
              </span>
              <span className="font-mono tabular-nums text-slate-500 font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {isComplete && (
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold">Batch generation completed successfully!</p>
                <p className="text-emerald-700">
                  {totalRecords} PDF files packaged and ready for download.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
            >
              Close
            </button>

            {isComplete && zipBlob && (
              <button
                onClick={onDownloadZip}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save ZIP Archive</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
