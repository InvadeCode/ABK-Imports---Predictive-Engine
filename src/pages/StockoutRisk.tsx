import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function StockoutRisk() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const limit = 50;

  useEffect(() => {
    const fetchRisk = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/engine/risk');
        if (res.status === 202) {
             setTimeout(fetchRisk, 2000);
             return;
        }
        const json = await res.json();
        setData(json.stockout || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchRisk();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.toLowerCase());
    setPage(1);
  };

  const filtered = search ? data.filter(r => r.itemCode?.toLowerCase().includes(search) || r.itemName?.toLowerCase().includes(search)) : data;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-slideUpFade">
      <div className="bg-rose-50 p-4 rounded-xl shadow-sm border border-rose-100 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-rose-900">Stockout Risk Engine Active</h2>
          <p className="text-xs text-rose-700 mt-1">Cross-referencing forecasted demand, required lead times, safety buffers, and physical inventory to detect out-of-stock threats before they happen.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
           <h2 className="text-sm font-bold text-slate-800">High Risk Items ({data.length})</h2>
           <p className="text-xs text-slate-500">Days of Supply (DOS) is less than required Lead Time + Buffer.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search SKU..."
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none"
          />
        </form>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs">SKU Details</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs text-right">Available</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs text-right">Incoming</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs text-right">Daily FCST</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs text-right">DOS</th>
                <th className="p-4 font-medium text-rose-700 bg-rose-50/50 uppercase tracking-wider text-xs text-right">Required DOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 max-w-[200px]">
                    <div className="font-bold font-mono text-slate-900">{row.itemCode}</div>
                    <div className="text-slate-700 truncate" title={row.itemName}>{row.itemName}</div>
                    <div className="text-xs text-slate-400 mt-1">{row.supplier}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-600 text-right">{row.currentStock > 0 ? row.currentStock.toLocaleString() : <span className="text-rose-500 font-bold">0</span>}</td>
                  <td className="p-4 text-slate-600 text-right">{row.incomingStock.toLocaleString()}</td>
                  <td className="p-4 font-bold text-slate-900 text-right">{row.forecastDaily}</td>
                  <td className="p-4 font-bold text-rose-600 text-right text-lg">{row.daysOfSupply}</td>
                  <td className="p-4 font-bold text-rose-800 bg-rose-50/30 text-right">{row.totalCycle}</td>
                </tr>
              ))}
              {paginated.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No stockout risks identified (or supply data missing).</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} items</span>
            <div className="flex items-center space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                <button disabled={page >= totalPages || total === 0} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>
    </div>
  );
}
