import React, { useState, useRef } from 'react';
import { 
  X, Download, Upload, FileText, FileSpreadsheet, 
  File, AlertCircle, CheckCircle, Loader2, Info
} from 'lucide-react';
import { 
  exportRoutesToXLSX, 
  exportRoutesToCSV, 
  exportRoutesToPDF,
  exportTroubleTicketsToXLSX,
  exportTroubleTicketsToPDF,
  exportAssetsToXLSX,
  exportMaintenanceToXLSX,
  exportAllData,
  importRoutesFromXLSX,
  importRoutesFromCSV,
  exportAssetsToPDF,
  exportMaintenanceToPDF
} from '../../utils/exportUtils';
import { Route, TroubleTicket, NetworkAsset, MaintenanceRecord } from '../../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'export' | 'import';
  dataType: 'routes' | 'tickets' | 'assets' | 'maintenance' | 'all';
  data: {
    routes?: Route[];
    tickets?: TroubleTicket[];
    assets?: NetworkAsset[];
    maintenance?: MaintenanceRecord[];
  };
  onImportComplete?: (data: any[]) => void;
}

export default function ExportImportModal({
  isOpen,
  onClose,
  mode,
  dataType,
  data,
  onImportComplete
}: ExportImportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'routes': return 'Routes';
      case 'tickets': return 'Trouble Tickets';
      case 'assets': return 'Network Assets';
      case 'maintenance': return 'Maintenance Records';
      case 'all': return 'All Data';
      default: return 'Data';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'xlsx': return FileSpreadsheet;
      case 'csv': return FileText;
      case 'pdf': return File;
      default: return File;
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const options = {
        includeTimestamp,
        title: `${getDataTypeLabel()} Report`
      };

      switch (dataType) {
        case 'routes':
          if (!data.routes) throw new Error('No routes data available');
          if (selectedFormat === 'xlsx') {
            exportRoutesToXLSX(data.routes, options);
          } else if (selectedFormat === 'csv') {
            exportRoutesToCSV(data.routes, options);
          } else if (selectedFormat === 'pdf') {
            exportRoutesToPDF(data.routes, options);
          }
          break;

        case 'tickets':
          if (!data.tickets || !data.routes) throw new Error('No tickets data available');
          if (selectedFormat === 'xlsx') {
            exportTroubleTicketsToXLSX(data.tickets, data.routes, options);
          } else if (selectedFormat === 'pdf') {
            exportTroubleTicketsToPDF(data.tickets, data.routes, options);
          } else {
            throw new Error('CSV export not available for trouble tickets');
          }
          break;

        case 'assets':
          if (!data.assets || !data.routes) throw new Error('No assets data available');
          if (selectedFormat === 'xlsx') {
            exportAssetsToXLSX(data.assets, data.routes, options);
          } else if (selectedFormat === 'pdf') {
            exportAssetsToPDF(data.assets, data.routes, options);
          } else {
            throw new Error('CSV export not available for assets');
          }
          break;

        case 'maintenance':
          if (!data.maintenance || !data.routes) throw new Error('No maintenance data available');
          if (selectedFormat === 'xlsx') {
            exportMaintenanceToXLSX(data.maintenance, data.routes, options);
          } else if (selectedFormat === 'pdf') {
            exportMaintenanceToPDF(data.maintenance, data.routes, options);
          } else {
            throw new Error('CSV export not available for maintenance records');
          }
          break;

        case 'all':
          if (!data.routes || !data.tickets || !data.assets || !data.maintenance) {
            throw new Error('Incomplete data for full export');
          }
          exportAllData(data.routes, data.tickets, data.assets, data.maintenance, selectedFormat);
          break;

        default:
          throw new Error('Invalid data type');
      }

      setMessage({ type: 'success', text: `${getDataTypeLabel()} exported successfully!` });
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Export failed' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      let importedData: any[] = [];

      if (dataType === 'routes') {
        if (file.name.endsWith('.xlsx')) {
          importedData = await importRoutesFromXLSX(file);
        } else if (file.name.endsWith('.csv')) {
          importedData = await importRoutesFromCSV(file);
        } else {
          throw new Error('Unsupported file format. Please use .xlsx or .csv files.');
        }
      } else {
        throw new Error('Import is currently only supported for routes');
      }

      if (importedData.length === 0) {
        throw new Error('No valid data found in the file');
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${importedData.length} ${dataType}` 
      });

      if (onImportComplete) {
        onImportComplete(importedData);
      }

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Import failed' 
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAvailableFormats = () => {
    switch (dataType) {
      case 'routes':
        return ['xlsx', 'csv', 'pdf'];
      case 'tickets':
        return ['xlsx', 'pdf'];
      case 'assets':
        return ['xlsx', 'pdf'];
      case 'maintenance':
        return ['xlsx', 'pdf'];
      case 'all':
        return ['xlsx', 'pdf'];
      default:
        return ['xlsx'];
    }
  };

  const availableFormats = getAvailableFormats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {mode === 'export' ? (
              <Download className="h-6 w-6 text-blue-600" />
            ) : (
              <Upload className="h-6 w-6 text-green-600" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mode === 'export' ? 'Export' : 'Import'} {getDataTypeLabel()}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'export' 
                  ? 'Choose format and export your data' 
                  : 'Select a file to import your data'
                }
              </p>
            </div>
              <p className="text-xs text-gray-500 mt-1">
                {dataType === 'routes' ? 'Supported formats: .xlsx, .csv' : 'Supported formats: .xlsx'}
              </p>
            </div>
          </div>

        <div className="p-6 space-y-6">
          {mode === 'export' ? (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {availableFormats.map((format) => {
                    const FormatIcon = getFormatIcon(format);
                    const isDisabled = !availableFormats.includes(format);
                    
                    return (
                      <button
                        key={format}
                        onClick={() => !isDisabled && setSelectedFormat(format as any)}
                        disabled={isDisabled}
                        className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                          selectedFormat === format
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : isDisabled
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <FormatIcon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">
                            {format.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format === 'xlsx' && 'Excel spreadsheet with multiple sheets'}
                            {format === 'csv' && 'Comma-separated values file'}
                            {format === 'pdf' && 'Formatted PDF report'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Export Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeTimestamp}
                      onChange={(e) => setIncludeTimestamp(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Include timestamp in filename</span>
                  </label>
                </div>
              </div>

              {/* Data Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Export Summary</span>
                </div>
                <div className="text-sm text-blue-800">
                  {dataType === 'routes' && data.routes && (
                    <p>{data.routes.length} routes will be exported</p>
                  )}
                  {dataType === 'tickets' && data.tickets && (
                    <p>{data.tickets.length} trouble tickets will be exported</p>
                  )}
                  {dataType === 'assets' && data.assets && (
                    <p>{data.assets.length} network assets will be exported</p>
                  )}
                  {dataType === 'maintenance' && data.maintenance && (
                    <p>{data.maintenance.length} maintenance records will be exported</p>
                  )}
                  {dataType === 'all' && (
                    <div>
                      <p>Complete data export including:</p>
                      <ul className="list-disc list-inside mt-1 ml-2">
                        <li>{data.routes?.length || 0} routes</li>
                        <li>{data.tickets?.length || 0} trouble tickets</li>
                        <li>{data.assets?.length || 0} network assets</li>
                        <li>{data.maintenance?.length || 0} maintenance records</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Import Instructions */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Import Instructions</span>
                </div>
                <div className="text-sm text-yellow-800">
                  <p>Supported formats: .xlsx, .csv</p>
                  <p className="mt-1">Make sure your file has the correct column headers.</p>
                  {dataType === 'routes' && (
                    <p className="mt-1">Required columns: Route Name, Status, Start Location, End Location</p>
                  )}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleImport}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </>
          )}

          {/* Message */}
          {message && (
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' :
              message.type === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : message.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Actions */}
          {mode === 'export' && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{isProcessing ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}