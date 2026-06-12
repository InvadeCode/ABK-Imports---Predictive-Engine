import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const UPLOAD_TYPES = [
    { id: 'inventorySnapshot', name: 'Inventory Snapshot (Stock Details)' },
    { id: 'incomingStock', name: 'Incoming Stock (In-Transit)' },
    { id: 'skuProcurementMaster', name: 'SKU Procurement & Lead Times' },
    { id: 'supplierMaster', name: 'Supplier Master' },
    { id: 'supplierPerformance', name: 'Supplier Performance Logs' },
    { id: 'warehouseMaster', name: 'Warehouse Master' },
];

export function InventoryUpload() {
  const [selectedType, setSelectedType] = useState(UPLOAD_TYPES[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [rowsCount, setRowsCount] = useState(0);

  const handleUpload = () => {
    if (!file) return;
    setStatus("parsing");
    
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data;
            if (data.length === 0) {
                setStatus("error");
                setErrorMsg("No content found in CSV");
                return;
            }
            
            setStatus("uploading");
            fetch(`/api/upload/${selectedType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data })
            })
            .then(res => res.json())
            .then(res => {
                if (res.error) throw new Error(res.error);
                setRowsCount(res.count);
                setStatus("success");
            })
            .catch(err => {
                setStatus("error");
                setErrorMsg(err.message || "Failed to upload.");
            });
        },
        error: (err) => {
             setStatus("error");
             setErrorMsg(err.message);
        }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Data Upload Environment</h1>
        <p className="text-slate-500 text-sm mt-2">Simulated upload utility to ingest Phase 4 CSV files into memory.</p>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Select Format Target</label>
           <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}
              className="w-full border-slate-200 rounded-lg text-sm bg-slate-50 border p-3 focus:ring-2 focus:ring-slate-900 outline-none"
           >
              {UPLOAD_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
              ))}
           </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">CSV File</label>
           <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
               <input 
                  type="file" 
                  accept=".csv"
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full mb-2"
               />
               <p className="text-xs text-slate-500 mt-2">Must include headers. Validates against schema on server.</p>
           </div>
        </div>

        {status === "error" && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-3 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{errorMsg}</span>
            </div>
        )}

        {status === "success" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-3 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Successfully processed {rowsCount} rows. Data is now active in memory.</span>
            </div>
        )}

        <button 
           onClick={handleUpload}
           disabled={!file || status === 'parsing' || status === 'uploading'}
           className="w-full bg-slate-900 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 hover:bg-slate-800 transition-colors"
        >
           {status === 'parsing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
           <span>{status === 'parsing' || status === 'uploading' ? 'Processing...' : 'Upload & Validate'}</span>
        </button>

      </div>
    </div>
  );
}
