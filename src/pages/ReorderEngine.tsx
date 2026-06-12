import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, Check, Activity } from 'lucide-react';

export function ReorderEngine() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [approvedPo, setApprovedPo] = useState<Set<string>>(new Set());
  const [expandedSku, setExpandedSku] = useState<string | null>(null);
  
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
        const reorderList = json.stockout.filter((r:any) => r.recommendReorder > 0);
        reorderList.sort((a:any, b:any) => b.recommendReorder - a.recommendReorder);
        setData(reorderList);
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

  const handleApprove = (sku: string) => {
      setApprovedPo(prev => {
          const np = new Set(prev);
          np.add(sku);
          return np;
      });
  }

  const filtered = search ? data.filter(r => r.itemCode?.toLowerCase().includes(search) || r.itemName?.toLowerCase().includes(search) || r.supplier?.toLowerCase().includes(search)) : data;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-slideUpFade">
      <div className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100 flex items-start space-x-3">
        <ShoppingCart className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-indigo-900">Purchase Order Auto-Generator</h2>
          <p className="text-xs text-indigo-700 mt-1">Generating ideal restock configurations to bring Stockout Risk items back to target safety levels. Target buffer aims for total lead time + 45 days, automatically stepping up to MOQ.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
           <h2 className="text-sm font-bold text-slate-800">Draft Reorder Recommendations ({data.length})</h2>
        </div>
        
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Supplier, SKU..."
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
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs">Supplier</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs">Cycle Time & Delays</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs text-right">DOS Gap</th>
                <th className="p-4 font-medium text-slate-500 uppercase tracking-wider text-xs text-right">Draft QTY</th>
                <th className="p-4 font-medium text-indigo-700 bg-indigo-50/50 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((row: any, idx: number) => {
                  const isApproved = approvedPo.has(row.itemCode);
                  const isExpanded = expandedSku === row.itemCode;
                  return (
                    <React.Fragment key={idx}>
                    <tr onClick={() => setExpandedSku(isExpanded ? null : row.itemCode)} className={`transition-colors cursor-pointer ${isApproved ? 'bg-emerald-50/50 opacity-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-4 max-w-[200px]">
                        <div className="font-bold font-mono text-slate-900">{row.itemCode}</div>
                        <div className="text-slate-700 truncate" title={row.itemName}>{row.itemName}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-600 max-w-[150px] truncate" title={row.supplier}>{row.supplier}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1 text-xs mb-1">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded" title="Base Lead Time">LT: {row.baseLeadTime}d</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded" title="Safety Buffer">Buf: {row.buffer}d</span>
                        </div>
                        {row.activeDelay > 0 ? (
                           <div className="inline-flex items-center bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-xs border border-rose-100 font-medium">
                              +{row.activeDelay}d {row.delayReason}
                           </div>
                        ) : (
                           <div className="inline-flex items-center text-emerald-600 px-1.5 py-0.5 text-xs font-medium">
                              Optimal Status
                           </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-rose-600 text-right">{row.daysOfSupply} / {row.totalCycle}d</td>
                      <td className="p-4 font-bold text-slate-900 text-right text-lg">{row.recommendReorder.toLocaleString()}</td>
                      <td className="p-4 text-right">
                          <button 
                             disabled={isApproved}
                             onClick={(e) => { e.stopPropagation(); handleApprove(row.itemCode); }}
                             className="bg-indigo-600 text-white disabled:bg-emerald-600 disabled:opacity-100 text-xs px-3 py-1.5 rounded font-bold hover:bg-indigo-700 active:scale-95 inline-flex items-center shadow-sm w-[110px] justify-center"
                          >
                             {isApproved ? <><Check className="w-4 h-4 mr-1"/> Drafted</> : 'Approve PO'}
                          </button>
                      </td>
                    </tr>
                    {isExpanded && (
                       <tr>
                          <td colSpan={6} className="bg-slate-50 p-6 border-b border-slate-200">
                              <h4 className="text-sm font-bold text-slate-800 mb-4">Supply Chain Pipeline Risk Analysis</h4>
                              <div className="max-w-4xl">
                                  <div className="flex items-center justify-between relative">
                                      {/* Connecting line */}
                                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
                                      
                                      {/* Nodes */}
                                      <div className="flex flex-col items-center gap-2">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white ${row.activeDelay > 0 && row.delayReason.includes('Supplier') ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'border-indigo-500'}`}>🏭</div>
                                          <div className="text-xs font-bold text-slate-700">Supplier</div>
                                          <div className="text-[10px] text-slate-500 text-center w-24">Manufacturing & Dispatch</div>
                                          {row.activeDelay > 0 && row.delayReason.includes('Supplier') && (
                                              <div className="text-[10px] font-bold text-rose-600 text-center w-24 mt-1 bg-rose-100 p-1 rounded">+ {row.activeDelay}d Delay (Max Risk)</div>
                                          )}
                                      </div>
                                      
                                      <div className="flex flex-col items-center gap-2">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white ${row.activeDelay > 0 && (row.delayReason.includes('Port') || row.delayReason.includes('Transit')) ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'border-indigo-500'}`}>🚢</div>
                                          <div className="text-xs font-bold text-slate-700">Primary Transit</div>
                                          <div className="text-[10px] text-slate-500 text-center w-24">Freight & Customs</div>
                                          {row.activeDelay > 0 && (row.delayReason.includes('Port') || row.delayReason.includes('Transit')) && (
                                              <div className="text-[10px] font-bold text-amber-600 text-center w-24 mt-1 bg-amber-100 p-1 rounded">+ {row.activeDelay}d Delay (Max Risk)</div>
                                          )}
                                      </div>
                                      
                                      <div className="flex flex-col items-center gap-2">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white border-indigo-500`}>📦</div>
                                          <div className="text-xs font-bold text-slate-700">Warehouse</div>
                                          <div className="text-[10px] text-slate-500 text-center w-24">Quality Check & Inwarding</div>
                                      </div>
                                      
                                      <div className="flex flex-col items-center gap-2">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white border-indigo-500`}>🏪</div>
                                          <div className="text-xs font-bold text-slate-700">Dealer / Retailer</div>
                                          <div className="text-[10px] text-slate-500 text-center w-24">Last Mile Fulfillment</div>
                                      </div>
                                  </div>
                                  
                                  {row.activeDelay > 0 && (
                                    <div className="mt-8 bg-white border border-rose-100 rounded-lg p-4 flex gap-3 shadow-sm">
                                        <div className="bg-rose-50 text-rose-600 p-2 rounded-full h-fit"><Activity className="w-4 h-4" /></div>
                                        <div>
                                            <div className="text-sm font-bold text-rose-900">Recommended Action Plan</div>
                                            <div className="text-xs text-rose-700 mt-1">Air-freight a partial shipment (20% of requirement) to cover the {row.activeDelay} day gap while remaining bulk travels by standard ocean freight. This will prevent immediate stockout at dealer level.</div>
                                        </div>
                                    </div>
                                  )}
                              </div>
                          </td>
                       </tr>
                    )}
                    </React.Fragment>
                  )
              })}
              {paginated.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No reorders recommended at this time.</td>
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
