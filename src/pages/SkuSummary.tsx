import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Package } from 'lucide-react';

export function SkuSummary() {
  const { setIsFetching } = useOutletContext<any>();
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.status !== "loading") setData(json.data);
      } catch (err) { } finally { setIsFetching(false); }
    };
    fetchDashboard();
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
        <Database className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-sm font-bold text-slate-800">Source: public.abk_sales_transactions</h2>
          <p className="text-xs text-slate-500">Aggregated SKU view</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListTable title="Top SKUs by Quantity" icon={Package} data={data.topSkusByQty} columns={[{ key: 'sku', label: 'SKU' }, { key: 'name', label: 'Name' }, { key: 'qty', label: 'Qty', align: 'right', isNumber: true }]} />
        <ListTable title="Top SKUs by Value" icon={Package} data={data.topSkusByValue} columns={[{ key: 'sku', label: 'SKU' }, { key: 'name', label: 'Name' }, { key: 'value', label: 'Value (₹)', align: 'right', isCurrency: true }]} />
      </div>
    </div>
  );
}

export function ListTable({ title, icon: Icon, data, columns }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center space-x-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              {columns.map((c: any, i: number) => (
                <th key={i} className={`p-3 text-xs font-bold text-slate-500 uppercase tracking-wider ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50">
                {columns.map((c: any, j: number) => (
                  <td key={j} className={`p-3 text-sm text-slate-600 ${c.align === 'right' ? 'text-right' : ''} ${c.key === 'sku' ? 'font-mono font-medium text-slate-900' : ''}`}>
                    {c.isNumber ? Number(row[c.key]).toLocaleString('en-IN') : c.isCurrency ? '₹' + Number(row[c.key]).toLocaleString('en-IN') : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
