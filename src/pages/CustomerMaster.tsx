import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Search, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export function CustomerMaster() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const limit = 50;

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsFetching(true);
      try {
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: search
        });
        const res = await fetch(`/api/master/customers?${query.toString()}`);
        if (res.status === 202) {
             setTimeout(fetchCustomers, 2000);
             return;
        }
        const json = await res.json();
        setData(json.data || []);
        setTotal(json.totalCount || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchCustomers();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-slideUpFade">
      
      {/* HEADER & SOURCE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-[#de4b33] pl-3">Customer Master</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">Live paginated view of aggregated customer attributes.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Customer..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#de4b33]"
          />
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Segment</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">State / City</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Partner</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Invoices</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Qty</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900 max-w-xs">{row.customerName}</td>
                  <td className="p-4 text-sm">
                    {row.approvedSegment === 'Unknown / Unclassified' ? (
                        <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-medium w-max">
                            <AlertCircle className="w-3 h-3 mr-1" /> Unclassified
                        </span>
                    ) : (
                        <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-xs font-medium w-max">
                            <CheckCircle className="w-3 h-3 mr-1" /> {row.approvedSegment}
                        </span>
                    )}
                    {row.suggestedSegment !== row.approvedSegment && row.approvedSegment === 'Unknown / Unclassified' && (
                        <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">Suggested: {row.suggestedSegment}</div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                      <div>{row.state}</div>
                      <div className="text-xs text-slate-400">{row.city}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                      {row.salesPartner}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600 text-right">{row.invoicesCount}</td>
                  <td className="p-4 text-sm font-bold text-slate-900 text-right">{row.qty}</td>
                  <td className="p-4 text-sm font-medium text-slate-600 text-right">₹{Number(row.value).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {data.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No customers found</td>
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
                <span className="text-sm font-medium">Page {page} of {totalPages || 1}</span>
                <button 
                    disabled={page >= totalPages || total === 0}
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
