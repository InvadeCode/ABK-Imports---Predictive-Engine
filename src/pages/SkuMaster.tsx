import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Search, ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';

export function SkuMaster() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  
  const limit = 50;

  const fetchSkus = async () => {
    setIsFetching(true);
    try {
      const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search: search
      });
      const res = await fetch(`/api/master/skus?${query.toString()}`);
      if (res.status === 202) {
           setTimeout(fetchSkus, 2000);
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

  useEffect(() => {
    fetchSkus();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleEdit = (row: any) => {
      setEditingRow(row.itemCode);
      setEditValues({ leadTime: row.leadTime, bufferDays: row.bufferDays, moq: row.moq });
  };

  const handleSave = async (itemCode: string) => {
      try {
          await fetch('/api/data/skuProcurementMaster/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemCode, ...editValues })
          });
          setEditingRow(null);
          // Update local state optimistic
          setData(data.map(d => d.itemCode === itemCode ? { ...d, ...editValues } : d));
      } catch (e) {
          console.error(e);
      }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-slideUpFade">
      
      {/* HEADER & SOURCE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-[#de4b33] pl-3">Product Master List</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">Live paginated view of aggregated SKU variables.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search SKU Code or Name..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#de4b33]"
          />
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-slate-500">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Product Info</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Historical Qty</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Lead Time (Days)</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">Buffer (Days)</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider">MOQ</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => {
                const isEditing = editingRow === row.itemCode;
                return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm">
                      <div className="font-bold text-slate-900">{row.itemName}</div>
                      {row.parentName && row.parentName !== '-' && row.parentName !== row.itemName && (
                          <div className="text-xs text-slate-500 mt-0.5">Parent: {row.parentName}</div>
                      )}
                      <div className="text-xs font-mono text-slate-500">[{row.itemCode}] • {row.brand} • {row.category}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700">{row.qty}</td>
                  <td className="p-4 text-sm text-slate-600">
                      {isEditing ? (
                          <input type="number" className="w-20 border rounded px-2 py-1 text-sm bg-white" value={editValues.leadTime} onChange={e => setEditValues({...editValues, leadTime: Number(e.target.value)})} />
                      ) : (
                          <span>{row.leadTime}</span>
                      )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                      {isEditing ? (
                          <input type="number" className="w-20 border rounded px-2 py-1 text-sm bg-white" value={editValues.bufferDays} onChange={e => setEditValues({...editValues, bufferDays: Number(e.target.value)})} />
                      ) : (
                          <span>{row.bufferDays}</span>
                      )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                      {isEditing ? (
                          <input type="number" className="w-24 border rounded px-2 py-1 text-sm bg-white" value={editValues.moq} onChange={e => setEditValues({...editValues, moq: Number(e.target.value)})} />
                      ) : (
                          <span>{row.moq?.toLocaleString() || 0}</span>
                      )}
                  </td>
                  <td className="p-4 text-right">
                      {isEditing ? (
                          <button onClick={() => handleSave(row.itemCode)} className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                              <Check className="w-4 h-4" />
                          </button>
                      ) : (
                          <button onClick={() => handleEdit(row)} className="text-xs font-bold text-[#243673] hover:text-[#de4b33] uppercase transition-colors">
                              Edit Controls
                          </button>
                      )}
                  </td>
                </tr>
              )})}
              {data.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No products found</td>
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
