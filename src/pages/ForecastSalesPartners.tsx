import React, { useEffect, useState } from 'react';
import { Briefcase } from 'lucide-react';

export function ForecastSalesPartners() {
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchForecast = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/forecast/aggs');
        if (res.status === 202) {
            setTimeout(fetchForecast, 2000);
            return;
        }
        const json = await res.json();
        if (mounted) {
          setData(json.salesPartners || []);
        }
      } catch (err) {
        console.error("Failed to fetch SP forecast:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchForecast();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Sales Partner Forecast</h1>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px] relative">
        {isFetching && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
               <div className="animate-spin text-slate-400"><Briefcase className="w-6 h-6" /></div>
           </div>
        ) : null}
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="py-4 px-6 font-medium">Sales Partner</th>
              <th className="py-4 px-6 font-medium">Customers Handled</th>
              <th className="py-4 px-6 font-medium">Act. Qty (LTD)</th>
              <th className="py-4 px-6 font-medium text-blue-600 bg-blue-50/30">FCST Qty (Next M)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.salesPartner} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-900">{row.salesPartner}</td>
                <td className="py-4 px-6">{row.customersCount.toLocaleString()}</td>
                <td className="py-4 px-6">{row.qty.toLocaleString()}</td>
                <td className="py-4 px-6 font-bold text-blue-600 bg-blue-50/10">{row.forecastNextMonth.toLocaleString()}</td>
              </tr>
            ))}
             {data.length === 0 && !isFetching && (
               <tr>
                   <td colSpan={4} className="py-8 text-center text-slate-400">No partner data found</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
