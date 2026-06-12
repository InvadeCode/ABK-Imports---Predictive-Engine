import React, { useEffect, useState } from 'react';
import { Target, AlertCircle } from 'lucide-react';

export function ForecastConfidence() {
  const [data, setData] = useState<any>(null);
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
          setData(json.confidenceStats || { high: 0, medium: 0, low: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch confidence stats:", err);
      } finally {
        if (mounted) setIsFetching(false);
      }
    };

    fetchForecast();
    return () => { mounted = false; };
  }, []);

  const total = data ? data.high + data.medium + data.low : 0;
  
  const getPct = (val: number) => {
      if (!total) return 0;
      return Math.round((val / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Forecast Confidence</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Target className="w-24 h-24" /></div>
             <div>
                 <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">High Confidence</h2>
                 <p className="text-4xl font-bold text-slate-900">{data?.high.toLocaleString() || 0} <span className="text-xl font-normal text-slate-400">SKUs</span></p>
             </div>
             <div className="mt-6">
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full" style={{ width: `${getPct(data?.high)}%`}}></div>
                 </div>
                 <p className="text-sm text-emerald-600 font-medium mt-2">{getPct(data?.high)}% of catalog</p>
             </div>
             <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-[90%]">More than 6 months of active sales history. Very stable demand patterns.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div>
                 <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Medium Confidence</h2>
                 <p className="text-4xl font-bold text-slate-900">{data?.medium.toLocaleString() || 0} <span className="text-xl font-normal text-slate-400">SKUs</span></p>
             </div>
             <div className="mt-6">
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-amber-400 h-full" style={{ width: `${getPct(data?.medium)}%`}}></div>
                 </div>
                 <p className="text-sm text-amber-600 font-medium mt-2">{getPct(data?.medium)}% of catalog</p>
             </div>
             <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-[90%]">Between 3 and 6 months of active sales history. Sufficient for baseline projection.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><AlertCircle className="w-24 h-24" /></div>
             <div>
                 <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Low Confidence</h2>
                 <p className="text-4xl font-bold text-slate-900">{data?.low.toLocaleString() || 0} <span className="text-xl font-normal text-slate-400">SKUs</span></p>
             </div>
             <div className="mt-6">
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                     <div className="bg-rose-500 h-full" style={{ width: `${getPct(data?.low)}%`}}></div>
                 </div>
                 <p className="text-sm text-rose-600 font-medium mt-2">{getPct(data?.low)}% of catalog</p>
             </div>
             <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-[90%]">Less than 3 months of active sales history. Requires human review and manual override.</p>
          </div>
      </div>
      
      <div className="bg-slate-900 text-white rounded-xl p-6">
         <h3 className="font-semibold text-lg mb-2">How do we calculate confidence?</h3>
         <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
             We compute a proprietary confidence score strictly based on the duration of active sales tenure since first invoice, adjusting for transactional sparsity to determine whether short-term velocity variations are significant. We enforce conservative dampening to "Low Confidence" lines to avoid over-purchasing new or highly irregular SKUs without manual review.
         </p>
      </div>
    </div>
  );
}
