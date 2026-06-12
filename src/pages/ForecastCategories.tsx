import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart2, Info } from 'lucide-react';
import { ListTable } from './SkuSummary';

export function ForecastCategories() {
  const { setIsFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchForecast = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/forecast/aggs');
        const json = await res.json();
        if (json.status !== 'loading') setData(json.categories || []);
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
          <p className="text-xs text-indigo-700 mt-1">Aggregated category demand projection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        <ListTable title="Category Wise Demand Forecast" icon={BarChart2} data={data} columns={[
            { key: 'category', label: 'Category' },
            { key: 'topBrand', label: 'Top Moving Brand' },
            { key: 'topSku', label: 'Top SKU' },
            { key: 'qty', label: 'Historical Qty', align: 'right', isNumber: true },
            { key: 'forecastNextMonth', label: 'Forecast Next Month', align: 'right', isNumber: true }
        ]} />
      </div>
    </div>
  );
}
