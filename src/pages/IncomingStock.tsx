import React, { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';

export function IncomingStock() {
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchPO = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/data/incomingStock?limit=100');
        const json = await res.json();
        if (mounted) {
          setData(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch POs:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchPO();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Incoming Stock</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">Open purchase orders and in-transit shipments.</p>
        </div>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] relative">
        {isFetching && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin text-slate-400"><Truck className="w-6 h-6" /></div>
           </div>
        ) : null}
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="py-4 px-6 font-medium">PO Number</th>
                <th className="py-4 px-6 font-medium">Item Code</th>
                <th className="py-4 px-6 font-medium">Supplier</th>
                <th className="py-4 px-6 font-medium">ETD</th>
                <th className="py-4 px-6 font-medium text-right">Order Qty</th>
                <th className="py-4 px-6 font-medium text-right">Received</th>
                <th className="py-4 px-6 font-medium text-right bg-blue-50/50 text-blue-800">Pending Receipt</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => {
                    const po = row.po || row.po_number || '-';
                    const item = row.item_code || row.item || '-';
                    const supp = row.supplier || '-';
                    const etd = row.etd || row.delivery_date || '-';
                    const qty = Number(row.qty || row.order_qty || 0);
                    const rec = Number(row.received || row.received_qty || 0);
                    const pend = qty - rec;

                    return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-6 font-medium text-slate-900">{po}</td>
                            <td className="py-3 px-6 text-slate-600">{item}</td>
                            <td className="py-3 px-6 text-slate-500">{supp}</td>
                            <td className="py-3 px-6 text-slate-500">{etd}</td>
                            <td className="py-3 px-6 text-right font-medium">{qty.toLocaleString()}</td>
                            <td className="py-3 px-6 text-right text-slate-500">{rec.toLocaleString()}</td>
                            <td className="py-3 px-6 text-right font-bold text-blue-600 bg-blue-50/30">{pend.toLocaleString()}</td>
                        </tr>
                    )
                })}
                {data.length === 0 && !isFetching && (
                <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Truck className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>No incoming stock found.</p>
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
