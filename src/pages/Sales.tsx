import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Search, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export function Sales() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const limit = 50;

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsFetching(true);
      try {
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: search
        });
        const res = await fetch(`/api/transactions?${query.toString()}`);
        const json = await res.json();
        setData(json.data || []);
        setTotal(json.totalCount || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchTransactions();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      
      {/* HEADER & SOURCE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2">
             <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-[#de4b33] pl-3">Current Sales</h1>
             <div className="group relative cursor-help flex items-center justify-center">
                 <AlertCircle className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                 <div className="invisible group-hover:visible absolute z-50 w-64 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 left-1/2 -translate-x-1/2 top-full mt-2 whitespace-normal break-words text-left">
                     <div className="font-bold mb-1">About This Page</div>
                     Raw tabular view of every historical sales transaction imported from your database. Searchable and paginated.
                 </div>
             </div>
           </div>
           <p className="text-sm text-slate-500 mt-1 pl-4">Live paginated view of public.abk_sales_transactions.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Product or Customer..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#de4b33]"
          />
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">City</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => (
                <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm text-slate-600 font-mono">{row.posting_date}</td>
                  <td className="p-4 text-sm text-slate-600 font-mono">{row.invoice}</td>
                  <td className="p-4 text-sm font-medium text-slate-900 max-w-xs truncate" title={row.item_name}>
                    {row.item_code}
                  </td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={row.customer_name}>{row.customer_name}</td>
                  <td className="p-4 text-sm text-slate-600">{row.city}</td>
                  <td className="p-4 text-sm font-bold text-slate-900 text-right">{row.stock_qty}</td>
                  <td className="p-4 text-sm font-medium text-slate-600 text-right">₹{Number(row.amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {data.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
                Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} rows
            </span>
            <div className="flex items-center space-x-2">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                <button 
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
