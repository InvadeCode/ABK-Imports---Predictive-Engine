import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PieChart, Info } from 'lucide-react';
import { ListTable } from './SkuSummary';

export function ForecastSegments() {
  const { setIsFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/forecast/aggs');
        const json = await res.json();
        if (json.status !== 'loading') setData(json.segments || []);
      } catch (err) { } finally { setIsFetching(false); }
    };
    fetchForecast();
  }, []);

  return (
    <div className="space-y-6 animate-slideUpFade">
      <div className="bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100 flex items-start space-x-3">
        <Info className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-sm font-bold text-indigo-900">Forecast based on sales history only.</h2>
          <p className="text-xs text-indigo-700 mt-1">Aggregated segment demand projection to show where future growth will come from (Retailers vs Clinics etc.).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        <ListTable title="Segment Wise Demand Forecast" icon={PieChart} data={data} columns={[
            { key: 'segment', label: 'Segment Name' },
            { key: 'customersCount', label: 'Customers', align: 'right', isNumber: true },
            { key: 'qty', label: 'Historical Qty', align: 'right', isNumber: true },
            { key: 'forecastNextMonth', label: 'Forecast Next Month (Qty)', align: 'right', isNumber: true }
        ]} />
      </div>
    </div>
  );
}
