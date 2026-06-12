import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Database, AlertCircle, ShoppingCart, Users, Package, BarChart3, RefreshCw } from 'lucide-react';

export function Dashboard() {
  const { setIsFetching } = useOutletContext<any>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryMsg, setRetryMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsFetching(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/dashboard');
        if (res.status === 500) {
           const errData = await res.json();
           setErrorMsg(errData.message || errData.error);
           setLoading(false);
           return;
        }
        if (res.status === 202) {
          const waitData = await res.json();
          setRetryMsg(waitData.message);
          setTimeout(fetchDashboard, 3000);
          return;
        }
        const json = await res.json();
        setData(json.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading && !errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin"></div>
        <p className="text-sm font-medium text-slate-600">{retryMsg || "Loading Dashboard Data..."}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-10 space-y-4 max-w-2xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-lg font-bold text-rose-900">Database Engine Error</h2>
        <p className="text-sm text-rose-700 leading-relaxed font-medium">
            {errorMsg}
        </p>
        <button onClick={() => { setLoading(true); fetch('/api/dashboard').then(() => window.location.reload()) }} className="px-4 py-2 mt-4 bg-rose-600 text-white rounded-lg text-sm shadow hover:bg-rose-700">
            Retry Connection
        </button>
      </div>
    );
  }

  if (!data || !data.kpis) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-10 space-y-4 max-w-2xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <h2 className="text-lg font-bold text-amber-900">Data Unavailable</h2>
        <p className="text-sm text-amber-700 leading-relaxed font-medium">
            We received a ready response from the server, but the payload was empty.
        </p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 mt-4 bg-amber-600 text-white rounded-lg text-sm shadow hover:bg-amber-700">
            Reload Dashboard
        </button>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
            <div className="group relative cursor-help flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                <div className="invisible group-hover:visible absolute z-50 w-64 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 left-1/2 -translate-x-1/2 top-full mt-2 whitespace-normal break-words text-left">
                    <div className="font-bold mb-1">About This Page</div>
                    This dashboard shows aggregated high-level KPIs and trends from your raw historical database.
                </div>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">High-level system health and historical aggregates</p>
        </div>
      </div>

      {/* HEADER & SOURCE */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center space-x-3">
        <Database className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-sm font-bold text-slate-800">Source: public.abk_sales_transactions</h2>
          <p className="text-xs text-slate-500">Live Aggregate from raw transaction table</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Rows" value={formatNumber(data.kpis.totalRows)} icon={Database} delay="100ms" />
        <KPICard title="Unique SKUs" value={formatNumber(data.kpis.uniqueSkus)} icon={Package} delay="200ms" />
        <KPICard title="Unique Customers" value={formatNumber(data.kpis.uniqueCustomers)} icon={Users} delay="300ms" />
        <KPICard title="Date Range" value={`${data.kpis.dateRange.min} to ${data.kpis.dateRange.max}`} icon={BarChart3} delay="400ms" />
        
        <KPICard title="Total Quantity Sold" value={formatNumber(data.kpis.totalQuantitySold)} icon={ShoppingCart} delay="500ms" highlight={true} />
        <KPICard title="Total Sales Value" value={formatCurrency(data.kpis.totalSalesValue)} icon={ShoppingCart} delay="600ms" highlight={true} />
        <KPICard title="Fiscal Years" value={data.kpis.fiscalYears.join(", ")} icon={BarChart3} delay="700ms" />
        <KPICard title="Last Sync" value={new Date(data.kpis.lastSyncMs).toLocaleTimeString()} icon={RefreshCw} delay="800ms" />
      </div>

      {/* PHASE 1 WARNING PANEL */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm mt-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-900">Missing Supply Chain Data</h3>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Inventory data: Not uploaded</li>
              <li>Incoming PO data: Not uploaded</li>
              <li>Supplier lead-time data: Not uploaded</li>
              <li>MOQ data: Not uploaded</li>
              <li>Landed cost data: Not uploaded</li>
              <li>Warehouse split data: Not uploaded</li>
            </ul>
            <p className="text-sm font-medium text-amber-900 pt-2 border-t border-amber-200">
              Phase 1 is showing real sales data only. Inventory, stockout, reorder, and procurement intelligence will activate after inventory and supplier data are uploaded.
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Monthly Sales Quantity Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatNumber(v)} />
                <Area type="monotone" dataKey="qty" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Monthly Sales Value Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <TopSkusTable title="Top Products by Quantity Sold" data={data.topSkusByQty} valueKey="qty" />
        <TopSkusTable title="Top Products by Revenue" data={data.topSkusByValue} valueKey="value" isCurrency={true} />
      </div>

    </div>
  );
}

function TopSkusTable({ title, data, valueKey, isCurrency }: { title: string, data: any[], valueKey: string, isCurrency?: boolean }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <h3 className="text-sm font-bold text-slate-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-xs font-bold text-slate-500 uppercase">Product</th>
              <th className="pb-3 text-xs font-bold text-slate-500 uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.slice(0, 5).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-3 text-sm">
                  <div className="font-medium text-slate-900 truncate max-w-[200px]" title={row.itemName}>{row.itemName}</div>
                  <div className="text-xs text-slate-500">{row.itemCode}</div>
                </td>
                <td className="py-3 text-sm font-bold text-slate-800 text-right">
                  {isCurrency 
                    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row[valueKey])
                    : new Intl.NumberFormat('en-IN').format(row[valueKey])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, delay, highlight }: { title: string, value: string, icon: any, delay: string, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl shadow-sm border ${highlight ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'} animate-slideUpFade`} style={{ animationDelay: delay }}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-5 h-5 ${highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
        <h3 className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
      </div>
      <div className={`text-2xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}
