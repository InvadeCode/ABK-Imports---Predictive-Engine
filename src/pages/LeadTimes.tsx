import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export function LeadTimes() {
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchLeadTimes = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/data/skuProcurementMaster?limit=100');
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json = await res.json();
        if (mounted) {
          setData(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch lead times:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchLeadTimes();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Lead Times & Buffers</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">SKU-level procurement logic, minimum order quantities, and transit times.</p>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] relative">
        {isFetching && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin text-slate-400"><Clock className="w-6 h-6" /></div>
           </div>
        ) : null}
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="py-4 px-6 font-medium">Item Code</th>
                <th className="py-4 px-6 font-medium">Primary Supplier</th>
                <th className="py-4 px-6 font-medium text-right">Lead Time (Days)</th>
                <th className="py-4 px-6 font-medium text-right">Buffer (Days)</th>
                <th className="py-4 px-6 font-medium text-right text-purple-700 bg-purple-50/50">Total Cycle (Days)</th>
                <th className="py-4 px-6 font-medium text-right">MOQ</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => {
                    const item = row.item_code || row.item || '-';
                    const supp = row.supplier || row.primary_supplier || '-';
                    const lead = Number(row.lead_time || row.transit_days || 0);
                    const buf = Number(row.buffer || row.safety_days || 0);
                    const moq = Number(row.moq || row.minimum_order || 0);
                    const total = lead + buf;

                    return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-6 font-medium text-slate-900">{item}</td>
                            <td className="py-3 px-6 text-slate-600">{supp}</td>
                            <td className="py-3 px-6 text-right text-slate-500">{lead}</td>
                            <td className="py-3 px-6 text-right text-slate-500">{buf}</td>
                            <td className="py-3 px-6 text-right font-bold text-purple-700 bg-purple-50/30">{total}</td>
                            <td className="py-3 px-6 text-right text-slate-600">{moq.toLocaleString()}</td>
                        </tr>
                    )
                })}
                {data.length === 0 && !isFetching && (
                <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>No procurement attributes defined.</p>
                        <p className="text-xs mt-1">Please use the Upload Env to sync data.</p>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
