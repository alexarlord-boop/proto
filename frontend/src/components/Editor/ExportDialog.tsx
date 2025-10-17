import React, { useState } from 'react';

export interface ExportOptions {
  format: 'static' | 'fullstack';
  dataStrategy: 'snapshot' | 'live';
  mode: 'public' | 'protected';
}

export type { ExportOptions as ExportOptionsType };

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  projectName: string;
}

export function ExportDialog({ isOpen, onClose, onExport, projectName }: ExportDialogProps) {
  const [format, setFormat] = useState<'static' | 'fullstack'>('static');
  const [dataStrategy, setDataStrategy] = useState<'snapshot' | 'live'>('snapshot');
  const [mode, setMode] = useState<'public' | 'protected'>('public');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ format, dataStrategy, mode });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Export Project: {projectName}</h2>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="static"
                  checked={format === 'static'}
                  onChange={() => setFormat('static')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Single HTML File</div>
                  <div className="text-sm text-gray-600">
                    Standalone HTML file with embedded React. Easy to share and host anywhere.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="format"
                  value="fullstack"
                  checked={format === 'fullstack'}
                  onChange={() => setFormat('fullstack')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Full-Stack ZIP</div>
                  <div className="text-sm text-gray-600">
                    Complete package with frontend + backend. Includes database connectors and queries.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Data Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Strategy
            </label>
            <div className="space-y-2">
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="dataStrategy"
                  value="snapshot"
                  checked={dataStrategy === 'snapshot'}
                  onChange={() => setDataStrategy('snapshot')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Snapshot (Static Data)</div>
                  <div className="text-sm text-gray-600">
                    Embed current data into the HTML. No backend required. Perfect for demos and reports.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="dataStrategy"
                  value="live"
                  checked={dataStrategy === 'live'}
                  onChange={() => setDataStrategy('live')}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Live Data</div>
                  <div className="text-sm text-gray-600">
                    Fetch data from API at runtime. Always shows latest data. Requires backend access.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Protection Mode (only for live data) */}
          {dataStrategy === 'live' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Protection
              </label>
              <div className="space-y-2">
                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="mode"
                    value="public"
                    checked={mode === 'public'}
                    onChange={() => setMode('public')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">🔓 Public with API Key</div>
                    <div className="text-sm text-gray-600">
                      Anyone with the file can view it. An auto-generated API key is embedded in the HTML.
                      No login required.
                    </div>
                  </div>
                </label>
                
                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="mode"
                    value="protected"
                    checked={mode === 'protected'}
                    onChange={() => setMode('protected')}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">🔒 Protected with Login</div>
                    <div className="text-sm text-gray-600">
                      Requires user authentication. Users must login with their Proto account.
                      More secure - no secrets embedded in HTML.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 text-sm text-blue-700">
                <p className="font-medium">Your Selection:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Format: {format === 'static' ? 'Single HTML File' : 'Full-Stack ZIP'}</li>
                  <li>Data: {dataStrategy === 'snapshot' ? 'Snapshot (Embedded)' : 'Live (API Calls)'}</li>
                  {dataStrategy === 'live' && (
                    <li>Protection: {mode === 'public' ? 'Public (API Key)' : 'Protected (Login Required)'}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Export Project
          </button>
        </div>
      </div>
    </div>
  );
}

