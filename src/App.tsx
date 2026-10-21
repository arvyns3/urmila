import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SpreadsheetConnector } from './components/SpreadsheetConnector';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { ApplicantFormEditor } from './components/ApplicantFormEditor';
import { FieldCalibrationView } from './components/FieldCalibrationModal';
import { PdfViewerPreview } from './components/PdfViewerPreview';
import { BatchExportModal } from './components/BatchExportModal';

import { ApplicantRecord, FieldCoordinate, SpreadsheetConnectionState } from './types';
import { SAMPLE_APPLICANTS } from './services/sampleData';
import { BOM_FIELD_COORDINATES } from './services/formCoordinates';
import {
  generateFilledPdf,
  generateBatchZip,
  DEFAULT_TEMPLATE_PATH,
  loadOriginalTemplate,
} from './services/pdfService';
import {
  fetchGoogleSheetData,
  parseSpreadsheetBuffer,
  exportApplicantsToSpreadsheet,
} from './services/spreadsheetService';

export default function App() {
  // Application Data State
  const [applicants, setApplicants] = useState<ApplicantRecord[]>(SAMPLE_APPLICANTS);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>(SAMPLE_APPLICANTS[0].id);
  const [activeTab, setActiveTab] = useState<'spreadsheet' | 'inspector' | 'mapper' | 'specs'>('spreadsheet');

  // Spreadsheet Connection State
  const [connection, setConnection] = useState<SpreadsheetConnectionState>({
    sourceType: 'sample',
    sourceName: 'Sample Bank Customers (5)',
    rowCount: SAMPLE_APPLICANTS.length,
    isLoading: false,
    lastSyncedAt: 'Just now',
    error: null,
  });

  // Coordinates State
  const [coordinates, setCoordinates] = useState<FieldCoordinate[]>(BOM_FIELD_COORDINATES);

  // PDF Preview & Generation State
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  // Batch Export Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchStatus, setBatchStatus] = useState<string>('');
  const [isBatchComplete, setIsBatchComplete] = useState<boolean>(false);
  const [batchZipBlob, setBatchZipBlob] = useState<Blob | null>(null);

  // Active Applicant helper
  const activeApplicant =
    applicants.find((a) => a.id === selectedApplicantId) || applicants[0] || SAMPLE_APPLICANTS[0];

  // Ref to store debounce timer and previous blob URL for cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Re-render filled PDF preview whenever active applicant changes
  const updatePdfPreview = useCallback(async (app: ApplicantRecord) => {
    setIsPdfLoading(true);
    try {
      const pdfBytes = await generateFilledPdf(app);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(blob);

      // Clean up previous blob URL
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
      currentBlobUrlRef.current = newUrl;
      setPdfBlobUrl(newUrl);
    } catch (err: any) {
      console.error('Error generating PDF preview:', err);
    } finally {
      setIsPdfLoading(false);
    }
  }, []);

  // Trigger PDF update with debounce
  useEffect(() => {
    if (!activeApplicant) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updatePdfPreview(activeApplicant);
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [activeApplicant, updatePdfPreview]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  // Handler: Connect Google Sheet
  const handleConnectGoogleSheet = async (url: string) => {
    setConnection((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await fetchGoogleSheetData(url);
      if (result.applicants.length === 0) {
        throw new Error('No applicant rows found in the provided Google Sheet.');
      }
      setApplicants(result.applicants);
      setSelectedApplicantId(result.applicants[0].id);
      setConnection({
        sourceType: 'google-sheets',
        sourceName: 'Google Sheets (Live Sync)',
        sheetUrl: url,
        rowCount: result.applicants.length,
        isLoading: false,
        lastSyncedAt: new Date().toLocaleTimeString(),
        error: null,
      });
      setActiveTab('spreadsheet');
    } catch (err: any) {
      setConnection((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch Google Sheet data.',
      }));
      throw err;
    }
  };

  // Handler: Import File (Excel / CSV)
  const handleFileUpload = async (file: File) => {
    setConnection((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const buffer = await file.arrayBuffer();
      const result = parseSpreadsheetBuffer(buffer);
      if (result.applicants.length === 0) {
        throw new Error('No valid records found in uploaded file.');
      }
      setApplicants(result.applicants);
      setSelectedApplicantId(result.applicants[0].id);
      setConnection({
        sourceType: 'file-upload',
        sourceName: file.name,
        rowCount: result.applicants.length,
        isLoading: false,
        lastSyncedAt: new Date().toLocaleTimeString(),
        error: null,
      });
      setActiveTab('spreadsheet');
    } catch (err: any) {
      setConnection((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to parse file.',
      }));
    }
  };

  // Handler: Load Sample Data
  const handleLoadSampleData = () => {
    setApplicants(SAMPLE_APPLICANTS);
    setSelectedApplicantId(SAMPLE_APPLICANTS[0].id);
    setConnection({
      sourceType: 'sample',
      sourceName: 'Sample Bank Customers (5)',
      rowCount: SAMPLE_APPLICANTS.length,
      isLoading: false,
      lastSyncedAt: 'Just now',
      error: null,
    });
  };

  // Handler: Refresh Sheet
  const handleRefreshSheet = async () => {
    if (connection.sheetUrl) {
      await handleConnectGoogleSheet(connection.sheetUrl);
    }
  };

  // Handler: Add Applicant
  const handleAddApplicant = () => {
    const newId = `APP-BOM-${String(applicants.length + 1).padStart(3, '0')}`;
    const newRecord: ApplicantRecord = {
      ...SAMPLE_APPLICANTS[0],
      id: newId,
      firstName: 'NEW',
      middleName: '',
      lastName: 'APPLICANT',
      panNumber: 'ABCDE1234F',
      mobileNumber: '9800000000',
      email: 'applicant@example.com',
      localCity: 'PUNE',
      atmCardName: 'NEW APPLICANT',
      signatureName: 'New Applicant',
    };
    setApplicants([newRecord, ...applicants]);
    setSelectedApplicantId(newId);
    setActiveTab('inspector');
  };

  // Handler: Duplicate Applicant
  const handleDuplicateApplicant = (id: string) => {
    const target = applicants.find((a) => a.id === id);
    if (!target) return;
    const newId = `${target.id}-COPY`;
    const copy: ApplicantRecord = {
      ...target,
      id: newId,
      firstName: `${target.firstName}`,
      lastName: `${target.lastName} (Copy)`,
    };
    setApplicants([copy, ...applicants]);
    setSelectedApplicantId(newId);
  };

  // Handler: Delete Applicant
  const handleDeleteApplicant = (id: string) => {
    if (applicants.length <= 1) return;
    const remaining = applicants.filter((a) => a.id !== id);
    setApplicants(remaining);
    if (selectedApplicantId === id) {
      setSelectedApplicantId(remaining[0].id);
    }
  };

  // Handler: Export Grid to Excel / CSV
  const handleExportSpreadsheet = (format: 'xlsx' | 'csv') => {
    const bytes = exportApplicantsToSpreadsheet(applicants, format);
    const blob = new Blob([bytes as unknown as BlobPart], {
      type:
        format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bank_Applicants_${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler: Update Applicant from Form Editor
  const handleUpdateApplicant = (updated: ApplicantRecord) => {
    setApplicants((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  // Handler: Update Field Coordinate
  const handleUpdateCoordinate = (id: string, updates: Partial<FieldCoordinate>) => {
    setCoordinates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Handler: Reset Coordinates
  const handleResetCoordinates = () => {
    setCoordinates(BOM_FIELD_COORDINATES);
  };

  // Handler: Download Current PDF
  const handleDownloadCurrentPdf = async () => {
    try {
      setIsPdfLoading(true);
      const pdfBytes = await generateFilledPdf(activeApplicant);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = `${activeApplicant.firstName}_${activeApplicant.lastName}`.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `BOM_AOF_${cleanName}_${activeApplicant.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Handler: Start Batch ZIP Generation
  const handleStartBatchDownload = async () => {
    setIsBatchModalOpen(true);
    setBatchProgress(5);
    setBatchStatus('Loading original 13-page vector template...');
    setIsBatchComplete(false);
    setBatchZipBlob(null);

    try {
      const zipBlob = await generateBatchZip(
        applicants,
        undefined,
        (completed, total, currentName) => {
          const pct = 10 + (completed / total) * 85;
          setBatchProgress(pct);
          setBatchStatus(`Stamping record ${completed + 1} of ${total}: ${currentName}`);
        }
      );

      setBatchZipBlob(zipBlob);
      setBatchProgress(100);
      setBatchStatus('Completed!');
      setIsBatchComplete(true);
    } catch (err: any) {
      setBatchStatus(`Failed: ${err.message}`);
    }
  };

  // Handler: Save Batch ZIP Blob
  const handleSaveBatchZip = () => {
    if (!batchZipBlob) return;
    const url = URL.createObjectURL(batchZipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOM_Account_Opening_Forms_Batch_${applicants.length}_Customers.zip`;
    a.click();
    URL.revokeObjectURL(url);
    setIsBatchModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadCurrent={handleDownloadCurrentPdf}
        onBatchDownload={handleStartBatchDownload}
        isGenerating={isPdfLoading}
        totalApplicants={applicants.length}
        currentApplicantName={`${activeApplicant.firstName} ${activeApplicant.lastName}`}
      />

      {/* Spreadsheet Connection & Source Bar */}
      <SpreadsheetConnector
        connection={connection}
        onConnectGoogleSheet={handleConnectGoogleSheet}
        onFileUpload={handleFileUpload}
        onLoadSampleData={handleLoadSampleData}
        onRefresh={handleRefreshSheet}
      />

      {/* Split Workspace Viewport (Desktop 1440px baseline) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Spreadsheet Data / Record Inspector / Field Calibration */}
        <section className="w-full lg:w-[48%] xl:w-[45%] h-full flex flex-col bg-white border-r border-slate-200 shrink-0">
          {activeTab === 'spreadsheet' && (
            <SpreadsheetGrid
              applicants={applicants}
              selectedId={selectedApplicantId}
              onSelectApplicant={setSelectedApplicantId}
              onAddApplicant={handleAddApplicant}
              onDuplicateApplicant={handleDuplicateApplicant}
              onDeleteApplicant={handleDeleteApplicant}
              onExportSpreadsheet={handleExportSpreadsheet}
            />
          )}

          {activeTab === 'inspector' && (
            <ApplicantFormEditor
              applicant={activeApplicant}
              onChange={handleUpdateApplicant}
            />
          )}

          {activeTab === 'mapper' && (
            <FieldCalibrationView
              coordinates={coordinates}
              onUpdateCoordinate={handleUpdateCoordinate}
              onResetDefaults={handleResetCoordinates}
            />
          )}
        </section>

        {/* Right Panel: High-Resolution Real-Time Vector PDF Preview */}
        <section className="hidden lg:flex flex-1 h-full flex-col overflow-hidden">
          <PdfViewerPreview
            pdfUrl={pdfBlobUrl}
            blankTemplateUrl={DEFAULT_TEMPLATE_PATH}
            currentPage={currentPage}
            totalPages={13}
            onPageChange={setCurrentPage}
            isLoading={isPdfLoading}
            activeApplicant={activeApplicant}
            onDownloadCurrent={handleDownloadCurrentPdf}
          />
        </section>
      </main>

      {/* Batch Export Progress & Download Modal */}
      <BatchExportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        progress={batchProgress}
        currentStatus={batchStatus}
        isComplete={isBatchComplete}
        zipBlob={batchZipBlob}
        totalRecords={applicants.length}
        onDownloadZip={handleSaveBatchZip}
      />
    </div>
  );
}
