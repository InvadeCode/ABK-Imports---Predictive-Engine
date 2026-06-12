import React, { useEffect, useState } from 'react';
import { Box } from 'lucide-react';

export function WarehouseMaster() {
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchLoc = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/data/warehouseMaster');
        const json = await res.json();
        if (mounted) {
          setData(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchLoc();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Warehouse Master</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">Physical locations configured for inventory holding.</p>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] relative">
        {isFetching && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin text-slate-400"><Box className="w-6 h-6" /></div>
           </div>
        ) : null}
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="py-4 px-6 font-medium">Warehouse Name</th>
              <th className="py-4 px-6 font-medium">Type</th>
              <th className="py-4 px-6 font-medium">Region</th>
              <th className="py-4 px-6 font-medium">Capacity (Pallets)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">{row.warehouse_name || row.name || 'Unknown'}</td>
                <td className="py-4 px-6 text-slate-600">
                   <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">{row.type || 'Standard'}</span>
                </td>
                <td className="py-4 px-6 text-slate-600">{row.region || row.location || '-'}</td>
                <td className="py-4 px-6 text-slate-600">{row.capacity || '-'}</td>
              </tr>
            ))}
            {data.length === 0 && !isFetching && (
               <tr>
                   <td colSpan={4} className="py-12 text-center text-slate-400">
                       <Box className="w-8 h-8 mx-auto mb-3 opacity-20" />
                       <p>No warehouse records configured.</p>
                   </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
