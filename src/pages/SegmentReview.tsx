import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Search, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export function SegmentReview() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const limit = 50;

  const fetchCustomers = async () => {
    setIsFetching(true);
    try {
      const resDash = await fetch('/api/dashboard');
      if (resDash.status === 202) {
          setTimeout(fetchCustomers, 2000);
          return;
      }
      const jsonDash = await resDash.json();
      setStats(jsonDash.data?.segmentStats);
      
      const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });
      const res = await fetch(`/api/master/customers?${query.toString()}`);
      const json = await res.json();
      
      // Filter primarily on ones that are unclassified or mismatched
      // BUT for simplicity we will just show the unclassified ones if there is no search
      let pageData = json.data || [];
      if (!search) {
         // client side temporary filter for demo
         pageData = pageData.filter((r: any) => r.approvedSegment === 'Unknown / Unclassified' || r.approvedSegment !== r.suggestedSegment);
      }
      
      setData(pageData);
      setTotal(json.totalCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);
  
  const approveSegment = async (customerName: string, segment: string) => {
      try {
          await fetch('/api/master/approve-segment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerName, segment })
          });
          // Optimistic update
          setData(prev => prev.map(c => c.customerName === customerName ? { ...c, approvedSegment: segment } : c));
          fetchCustomers(); // Refresh stats mostly
      } catch(e) {
          console.error(e);
      }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-slideUpFade">
      
      {/* HEADER & SOURCE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Source: abk_sales_transactions (Dynamic Segmentation)</h2>
            <p className="text-xs text-slate-500">Unclassified & Review Queue</p>
          </div>
        </div>
      </div>
      
      {stats && (
          <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-slate-500 uppercase">Total Customers</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalCustomers}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-emerald-700 uppercase">Classified</div>
                  <div className="text-2xl font-bold text-emerald-900">{stats.classifiedCount}</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-amber-700 uppercase">Awaiting Review</div>
                  <div className="text-2xl font-bold text-amber-900">{stats.unclassifiedCount}</div>
              </div>
          </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-350px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested Segment</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Invoices</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action (Quick Apply)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => {
                  const isMatch = row.approvedSegment === row.suggestedSegment;
                  const isUnclassified = row.approvedSegment === 'Unknown / Unclassified';
                  const highlight = !isMatch && isUnclassified && row.suggestedSegment !== 'Unknown / Unclassified';
                  
                  return (
                    <tr key={idx} className={`transition-colors ${highlight ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                      <td className="p-4 text-sm font-medium text-slate-900 max-w-xs">{row.customerName}</td>
                      <td className="p-4 text-sm text-slate-600">
                          {row.suggestedSegment}
                          {!isUnclassified && (
                              <span className="block text-[10px] text-emerald-600 mt-1 font-bold">Approved as: {row.approvedSegment}</span>
                          )}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600 text-right">{row.invoicesCount}</td>
                      <td className="p-4 text-sm flex items-center justify-end space-x-2">
                          <select 
                             className="text-xs border border-slate-200 rounded p-1.5 focus:ring-2 focus:outline-none"
                             value={row.approvedSegment}
                             onChange={(e) => approveSegment(row.customerName, e.target.value)}
                          >
                              <option value="Unknown / Unclassified">Select Segment...</option>
                              <option value="Retailer">Retailer</option>
                              <option value="Distributor">Distributor</option>
                              <option value="Veterinary Clinic / Hospital">Veterinary Clinic / Hospital</option>
                              <option value="Grooming Centre">Grooming Centre</option>
                              <option value="Marketplace">Marketplace</option>
                              <option value="Direct / D2C">Direct / D2C</option>
                              <option value="Corporate / Institution">Corporate / Institution</option>
                          </select>
                          {highlight && (
                              <button 
                                onClick={() => approveSegment(row.customerName, row.suggestedSegment)}
                                className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-indigo-700 active:scale-95 flex items-center shadow-sm"
                              >
                                  <Check className="w-3 h-3 mr-1" /> Approve Suggestion
                              </button>
                          )}
                      </td>
                    </tr>
                  );
              })}
              {data.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No customers pending review in this view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
                Segment overrides are synced in memory for Phase 2 demo.
            </span>
        </div>
      </div>
    </div>
  );
}
