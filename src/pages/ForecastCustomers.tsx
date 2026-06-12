import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LineChart, Search, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export function ForecastCustomers() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const limit = 50;

  useEffect(() => {
    const fetchForecast = async () => {
      setIsFetching(true);
      try {
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: search
        });
        const res = await fetch(`/api/forecast/customers?${query.toString()}`);
        if (res.status === 202) {
             setTimeout(fetchForecast, 2000);
             return;
        }
        const json = await res.json();
        setData(json.data || []);
        setTotal(json.totalCount || 0);
      } catch (err) { } finally { setIsFetching(false); }
    };
    fetchForecast();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); setSearch(searchInput); setPage(1);
  };

  return (
    <div className="space-y-6 animate-slideUpFade">
      <div className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100 flex items-start space-x-3">
        <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-indigo-900">Forecast based on sales history only.</h2>
          <p className="text-xs text-indigo-700 mt-1">Estimating next order probability and date based on purchase intervals and historical recency.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LineChart className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Customer Replenishment Forecast</h2>
            <p className="text-xs text-slate-500">Live Prediction over ABK Data</p>
          </div>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search Customer..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none" />
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-290px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer & Segment</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Last Purchase</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Expected Next Order</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Forecast Demand (Qty)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Repeat Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm max-w-xs">
                    <div className="font-bold text-slate-900">{row.customerName}</div>
                    <div className="text-xs text-slate-500 mt-1">{row.approvedSegment} | {row.state}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600 text-right">{row.lastPurchaseDate}</td>
                  <td className="p-4 text-sm font-bold text-indigo-600 text-right text-lg">{row.expectedNextOrderDate}</td>
                  <td className="p-4 text-sm font-bold text-slate-700 text-right">{row.expectedNextDemand}</td>
                  <td className="p-4 text-sm text-center">
                      <div className="flex justify-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded w-max ${row.repeatProbability >= 70 ? 'bg-emerald-100 text-emerald-700' : row.repeatProbability >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                              {row.repeatProbability}%
                          </span>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} rows</span>
            <div className="flex items-center space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                <button disabled={page >= Math.ceil(total / limit) || total === 0} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>
    </div>
  );
}
