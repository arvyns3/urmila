import React, { useState } from 'react';
import { Link2, Upload, RefreshCw, Sparkles, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { SpreadsheetConnectionState } from '../types';

interface SpreadsheetConnectorProps {
  connection: SpreadsheetConnectionState;
  onConnectGoogleSheet: (url: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
  onLoadSampleData: () => void;
  onRefresh: () => Promise<void>;
}

export const SpreadsheetConnector: React.FC<SpreadsheetConnectorProps> = ({
  connection,
  onConnectGoogleSheet,
  onFileUpload,
  onLoadSampleData,
  onRefresh,
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrlInput.trim()) {
      setInputError('Please enter a Google Sheet URL');
      return;
    }
    setInputError(null);
    try {
      await onConnectGoogleSheet(sheetUrlInput.trim());
      setShowUrlInput(false);
    } catch (err: any) {
      setInputError(err.message || 'Failed to connect Google Sheet');
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileUpload(file);
      // Reset input value so same file can be reloaded if needed
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Connection status & metadata */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Connected:</span>
            <span className="font-semibold text-slate-900">{connection.sourceName}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{connection.rowCount} Applicants</span>
            {connection.lastSyncedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>Synced {connection.lastSyncedAt}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>BOM Template (13 Pgs)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {connection.sheetUrl && (
            <button
              onClick={onRefresh}
              disabled={connection.isLoading}
              title="Sync latest rows from Google Sheet"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connection.isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          )}

          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors whitespace-nowrap"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect Google Sheet</span>
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer transition-colors whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Excel / CSV</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.tsv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          <button
            onClick={onLoadSampleData}
            title="Reload realistic 5-applicant Bank of Maharashtra test dataset"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Sample Data (5)</span>
          </button>
        </div>
      </div>

      {/* Google Sheet URL Connect Modal / Drawer */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder="Paste Google Sheet URL (e.g. https://docs.google.com/spreadsheets/d/.../edit)"
              value={sheetUrlInput}
              onChange={(e) => setSheetUrlInput(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-slate-800"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={connection.isLoading}
              className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {connection.isLoading ? 'Connecting...' : 'Connect Sheet'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false);
                setInputError(null);
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Error state if any */}
      {(inputError || connection.error) && (
        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{inputError || connection.error}</span>
        </div>
      )}
    </div>
  );
};
