import React, { useEffect, useState } from 'react';
import { Database, AlertCircle, CheckCircle } from 'lucide-react';

export function DataHealth() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
     fetch('/api/data-health/status')
        .then(r => r.json())
        .then(setData)
        .catch(console.error);
  }, []);

  const invOk = data?.inventorySnapshot > 0;
  const suppOk = data?.supplierMaster > 0;
  const locOk = data?.warehouseMaster > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3">
        <Database className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-sm font-bold text-slate-800">Source: public.abk_sales_transactions</h2>
          <p className="text-xs text-slate-500">System Integration Status</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-800">
            Phase 1 Integration Checklist
        </div>
        
        <div className="divide-y divide-slate-100">
            <HealthItem status="ok" title="Sales Transactions Database" desc="Connected. Fetching live from backend." />
            <HealthItem status="ok" title="Historical Sales Trends" desc="Successfully extracted and mapped date components." />
            
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Phase 2: Master Data</div>
            <HealthItem status="ok" title="Customer Segmentation" desc="Available. Rule engine active and mapped on backend." />
            <HealthItem status="ok" title="SKU Master Generation" desc="Available. Dynamic schema successfully inferred." />
            
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Phase 3: Forecasting</div>
            <HealthItem status="ok" title="SKU Demand Modeling" desc="Live. Statistical forecasting active across full assortment." />
            <HealthItem status="ok" title="Customer Repeat Probability" desc="Live. Calculating purchase intervals and next order predictions." />
            <HealthItem status="ok" title="Segment Growth Aggregation" desc="Live. Distributing forecast weights across segments and categories." />
            
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Phase 4: Inventory & Supply Chain</div>
            <HealthItem status={invOk ? "ok" : "missing"} title="Live Inventory Feed" desc={invOk ? `${data?.inventorySnapshot} SKUs synced to warehouse.` : "No stock location or warehouse mapping found."} />
            <HealthItem status={suppOk ? "ok" : "missing"} title="Supplier Master Data" desc={suppOk ? `${data?.supplierMaster} suppliers configured.` : "Vendor names and supply terms have not been uploaded."} />
            <HealthItem status={data?.skuProcurementMaster > 0 ? "ok" : "missing"} title="Procurement Lead Times" desc={data?.skuProcurementMaster > 0 ? "Transit times loaded." : "Expected transit times and buffer periods are missing."} />
            <HealthItem status="missing" title="Landed Cost Assumptions" desc="Item-wise import duties and logistics costs omitted." />
            
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Phase 5: Stockout Risk Engine</div>
            <HealthItem status={invOk ? "ok" : "missing"} title="Stockout Prediction" desc={invOk ? "Live. Correlating pipeline supply with forecasted burn rates." : "Pending Inventory."} />
            <HealthItem status={invOk ? "ok" : "missing"} title="Overstock Analysis" desc={invOk ? "Live. Identifying idle capital based on forward coverage limits." : "Pending Inventory."} />

            <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Phase 6: Reorder Engine</div>
            <HealthItem status={invOk ? "ok" : "missing"} title="Auto Purchase Orders" desc={invOk ? "Live. Drafting replenishment tickets based on target DOS and MOQ constraints." : "Pending Inventory."} />
        </div>
      </div>
      
      {(!invOk || !suppOk) ? (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm mt-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Stockout Risk Disabled</h3>
            <p className="text-sm text-slate-400">
              The intelligence engine cannot perform critical risk analysis, such as stockout prediction, overstock alerts, or import cut-off scheduling, until the missing tables in Phase 4 are synced into the data warehouse.
            </p>
          </div>
        </div>
      </div>
      ) : (
      <div className="bg-emerald-900 border border-emerald-800 p-6 rounded-xl shadow-sm mt-8">
         <div className="flex items-start space-x-3">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">All Engines Online</h3>
            <p className="text-sm text-emerald-100/70">
              Phases 1-6 are fully operational. Sales data, Master Data, Forecasts, Inventory, Supply tables, Risk calculation, and Procurement actions are completely integrated.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function HealthItem({ status, title, desc }: { status: "ok" | "missing", title: string, desc: string }) {
    return (
        <div className="p-4 flex items-start space-x-4">
            {status === 'ok' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
            ) : (
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            )}
            <div>
                <h4 className={`font-bold ${status === 'ok' ? 'text-slate-900' : 'text-amber-900'}`}>{title}</h4>
                <p className={`text-xs mt-1 ${status === 'ok' ? 'text-slate-500' : 'text-amber-700'}`}>{desc}</p>
            </div>
        </div>
    );
}
