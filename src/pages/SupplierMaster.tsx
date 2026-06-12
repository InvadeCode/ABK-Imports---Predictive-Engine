import React, { useEffect, useState } from 'react';
import { Factory } from 'lucide-react';

export function SupplierMaster() {
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchSup = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/data/supplierMaster?limit=100');
        const json = await res.json();
        if (mounted) {
          setData(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchSup();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Supplier Master</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">Vendor registry and base supply terms.</p>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] relative">
        {isFetching && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin text-slate-400"><Factory className="w-6 h-6" /></div>
           </div>
        ) : null}
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="py-4 px-6 font-medium">Supplier Code</th>
                <th className="py-4 px-6 font-medium">Supplier Name</th>
                <th className="py-4 px-6 font-medium">Country</th>
                <th className="py-4 px-6 font-medium">Default Currency</th>
                <th className="py-4 px-6 font-medium">Payment Terms</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => {
                    const code = row.supplier_code || row.id || '-';
                    const name = row.supplier_name || row.supplier || '-';
                    const country = row.country || '-';
                    const curr = row.currency || '-';
                    const terms = row.payment_terms || '-';

                    return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-6 font-medium text-slate-900">{code}</td>
                            <td className="py-3 px-6 font-semibold text-slate-700">{name}</td>
                            <td className="py-3 px-6 text-slate-500">{country}</td>
                            <td className="py-3 px-6 text-slate-500">{curr}</td>
                            <td className="py-3 px-6 text-slate-500">{terms}</td>
                        </tr>
                    )
                })}
                {data.length === 0 && !isFetching && (
                <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Factory className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>No vendors found.</p>
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
