import React, { useEffect, useState } from 'react';
import { Archive, Search, ChevronLeft, ChevronRight, Check, CheckSquare } from 'lucide-react';

export function InventorySnapshot() {
  const [data, setData] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  
  const limit = 50;

  const fetchInv = async () => {
    setIsFetching(true);
    try {
      const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search: search
      });
      const res = await fetch(`/api/data/inventorySnapshot?${query.toString()}`);
      if (res.status === 202) {
          setTimeout(fetchInv, 2000);
          return;
      }
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchInv();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleEdit = (row: any) => {
      setEditingRow(row.item_code);
      setEditValues({
          available: Number(row.available || row.actual_qty || row.qty || 0),
          reserved: Number(row.reserved || row.reserved_qty || 0)
      });
  };

  const handleSave = async (itemCode: string) => {
      try {
          await fetch('/api/data/inventorySnapshot/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemCode, ...editValues })
          });
          setEditingRow(null);
          fetchInv(); // refresh data
      } catch (e) {
          console.error(e);
      }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Current Inventory</h1>
           <p className="text-sm text-slate-500 mt-1 pl-4">Live snapshot of physical stock levels across all locations.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Products..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </form>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)] relative">
        {isFetching && data.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
               <div className="animate-spin text-slate-400"><Archive className="w-6 h-6" /></div>
           </div>
        ) : null}
        
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="py-4 px-6 font-medium">Product Info</th>
                <th className="py-4 px-6 font-medium">Location Info</th>
                <th className="py-4 px-6 font-medium text-right">Available Qty</th>
                <th className="py-4 px-6 font-medium text-right">Reserved Qty</th>
                <th className="py-4 px-6 font-medium text-right bg-slate-100">Total Qty</th>
                <th className="py-4 px-6 font-medium text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => {
                    const itemCode = row.item_code || row.item || row.sku || 'Unknown';
                    const itemName = row.item_name || 'Unknown Product';
                    const wh = row.warehouse || row.location || 'Unknown';
                    const batch = row.batch || row.batch_no || '-';
                    const exp = row.expiry || row.expiry_date || '-';
                    const avail = row.available || row.actual_qty || row.qty || 0;
                    const resv = row.reserved || row.reserved_qty || 0;
                    const tot = avail + resv;
                    const isEditing = editingRow === itemCode;

                    return (
                        <tr key={i} className={`hover:bg-slate-50 transition-colors ${isEditing ? 'bg-amber-50/50' : ''}`}>
                            <td className="py-3 px-6">
                                <div className="font-bold text-slate-900 truncate max-w-xs">{itemName}</div>
                                <div className="text-xs font-mono text-slate-500">{itemCode}</div>
                            </td>
                            <td className="py-3 px-6">
                                <div className="text-slate-700 font-medium">{wh}</div>
                                <div className="text-xs text-slate-500">Vol: {batch} • Exp: {exp}</div>
                            </td>
                            <td className="py-3 px-6 text-right font-medium">
                                {isEditing ? (
                                    <input type="number" className="w-24 text-right border rounded px-2 py-1 text-sm bg-white" value={editValues.available} onChange={e => setEditValues({...editValues, available: Number(e.target.value)})} />
                                ) : (
                                    Number(avail).toLocaleString()
                                )}
                            </td>
                            <td className="py-3 px-6 text-right text-amber-600 font-medium">
                                {isEditing ? (
                                    <input type="number" className="w-24 text-right border border-amber-200 rounded px-2 py-1 text-sm bg-white text-amber-600" value={editValues.reserved} onChange={e => setEditValues({...editValues, reserved: Number(e.target.value)})} />
                                ) : (
                                    Number(resv).toLocaleString()
                                )}
                            </td>
                            <td className="py-3 px-6 text-right font-bold bg-slate-50 text-slate-900 border-l border-r border-slate-100">{Number(tot).toLocaleString()}</td>
                            <td className="py-3 px-6 text-right">
                                {isEditing ? (
                                    <button onClick={() => handleSave(itemCode)} className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                                        <Check className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={() => handleEdit(row)} className="text-xs font-bold text-[#243673] hover:text-[#de4b33] uppercase transition-colors">
                                        Update Stock
                                    </button>
                                )}
                            </td>
                        </tr>
                    )
                })}
                {data.length === 0 && !isFetching && (
                <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Archive className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>No inventory snapshot records found.</p>
                        <p className="text-xs mt-1">Please use the Upload Env to sync data.</p>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-auto">
          <div className="text-sm text-slate-500">
             Showing {data.length} of {total} records
          </div>
          <div className="flex space-x-2">
             <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
             <button disabled={page >= totalPages || total === 0} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
