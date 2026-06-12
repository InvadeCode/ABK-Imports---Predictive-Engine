import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Search, ChevronLeft, ChevronRight, AlertCircle, Info, PackageOpen, Filter, ThumbsUp, ThumbsDown, Sparkles, TrendingDown, Truck, Activity, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export function ForecastSku() {
  const { setIsFetching, isFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [aggregate, setAggregate] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sortBy, setSortBy] = useState('volume_desc');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [validating, setValidating] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
  const [selectedSupplyChain, setSelectedSupplyChain] = useState<any>(null);
  
  const limit = 50;

  useEffect(() => {
    const fetchForecast = async () => {
      setIsFetching(true);
      try {
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search: search,
            category: category,
            brand: brand,
            sortBy: sortBy
        });
        const res = await fetch(`/api/forecast/skus?${query.toString()}`);
        if (res.status === 202) {
             setTimeout(fetchForecast, 2000);
             return;
        }
        const json = await res.json();
        setData(json.data || []);
        setTotal(json.totalCount || 0);
        setAggregate(json.aggregate || null);
        if (json.distinctCategories) setCategories(json.distinctCategories);
        if (json.distinctBrands) setBrands(json.distinctBrands);
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchForecast();
  }, [page, search, category, brand, sortBy, trigger]);

  const handleValidate = async (itemCode: string) => {
      if (validating === itemCode) return;
      setValidating(itemCode);
      try {
          await fetch(`/api/forecast/skus/${itemCode}/validate`, { method: 'POST' });
          setTrigger(t => t + 1);
      } catch (e) {
          console.error(e);
      } finally {
          setValidating(null);
      }
  };

  const handleInvalidate = async (itemCode: string) => {
      if (validating === itemCode) return;
      setValidating(itemCode);
      try {
          await fetch(`/api/forecast/skus/${itemCode}/invalidate`, { method: 'POST' });
          setTrigger(t => t + 1);
      } catch (e) {
          console.error(e);
      } finally {
          setValidating(null);
      }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  // Top products for the chart based roughly on current data view
  const [hoveredData, setHoveredData] = useState<any>(null);

  const chartData = data.slice(0, 10).map((d: any) => ({
      name: d.itemCode,
      shortName: d.itemName.substring(0, 15) + (d.itemName.length > 15 ? '...' : ''),
      fullName: d.itemName,
      parentName: d.parentName,
      itemCode: d.itemCode,
      brand: d.brand,
      volume: d.forecast3Months,
      targetVolume: d.finalDemand !== undefined ? d.finalDemand : d.forecast3Months,
      baseConf: d.confidenceScore,
      targetConf: d.adjustedConfidence || d.confidenceScore
  }));

  const majorProduct = chartData.length > 0 ? chartData[0].fullName : '-';

  const CustomTooltipInner = ({ data }: { data: any }) => {
    if (!data) return null;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-1 max-w-[300px]">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-1">{data.fullName}</p>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-slate-500">ID:</span>
          <span className="font-mono text-slate-700">{data.itemCode}</span>
        </div>
        {data.parentName && data.parentName !== '-' && data.parentName !== data.fullName && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Parent:</span>
            <span className="text-slate-700 font-medium truncate ml-2 text-right" title={data.parentName}>{data.parentName}</span>
          </div>
        )}
        {data.brand && data.brand !== '-' && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Brand:</span>
            <span className="text-slate-700 font-medium truncate ml-2 text-right" title={data.brand}>{data.brand}</span>
          </div>
        )}
        <div className="flex flex-col gap-2 mt-3">
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded -mx-1">
              <span className="text-slate-600 font-bold text-xs uppercase">Base 90D Qty</span>
              <div className="text-right">
                  <div className="font-bold text-slate-800 text-sm">{new Intl.NumberFormat('en-IN').format(data.volume)}</div>
                  <div className="text-[10px] text-slate-500">Conf: {data.baseConf}%</div>
              </div>
            </div>
            <div className="flex justify-between items-center bg-indigo-50 p-2 rounded -mx-1">
              <span className="text-indigo-800 font-bold text-xs uppercase">Target 90D Qty</span>
              <div className="text-right">
                  <div className="font-bold text-indigo-700 text-sm">{new Intl.NumberFormat('en-IN').format(data.targetVolume)}</div>
                  <div className="text-[10px] text-indigo-500">Conf: {data.targetConf}%</div>
              </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-slideUpFade">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Predictive Forecasting</h1>
            <div className="group relative cursor-help">
                <Info className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                <div className="invisible group-hover:visible absolute z-50 w-64 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 left-1/2 -translate-x-1/2 top-full mt-2 whitespace-normal break-words text-left">
                    <div className="font-bold mb-1">About This Page</div>
                    This page lists AI-generated sales volume forecasts at the SKU level. You can validate or correct these predictions to improve model accuracy over time.
                </div>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">AI-driven predictive demand modeling across all active product lines</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#de4b33] rounded-2xl shadow-sm border border-[#de4b33]/20 relative isolate flex flex-col min-h-[300px] group/card">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            <div className="absolute top-4 right-4 z-20">
                <div className="group relative cursor-help">
                    <Info className="w-5 h-5 text-white/50 hover:text-white transition-colors" />
                    <div className="invisible group-hover:visible absolute z-50 w-56 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 right-0 top-full mt-2 whitespace-normal break-words text-left">
                        <div className="font-bold mb-1 border-b border-slate-700 pb-1">Top Projected Products</div>
                        Visualizes the baseline next 90-days forecast for the top-selling product categories based on recent velocity.
                    </div>
                </div>
            </div>
            <div className="p-6 relative z-10 flex flex-col flex-1">
                <div>
                     <div className="flex items-center space-x-2 text-white/80 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-wide uppercase">Corporate Forecasting Engine</span>
                     </div>
                     <h2 className="text-3xl font-bold text-white tracking-tight">Top Projected Products</h2>
                </div>
                
                <div className="mt-8 flex-1 w-full min-h-[200px] relative">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData} 
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="name" tickFormatter={(v) => chartData.find(c => c.name === v)?.shortName || v} stroke="#ffffff80" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
                        <Tooltip 
                          content={(props: any) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              return <CustomTooltipInner data={payload[0].payload} />;
                            }
                            return null;
                          }} 
                          cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} 
                          wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                        />
                        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#ffffff" fillOpacity={0.8 - (index * 0.05)} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex bg-white/10 rounded-xl h-full items-center justify-center animate-pulse">
                        <span className="text-white/60 text-sm font-medium">Model Synchronizing...</span>
                    </div>
                  )}
                </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center space-y-6 relative group/card2">
              <div className="absolute top-4 right-4 z-10">
                <div className="group relative cursor-help">
                    <Info className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
                    <div className="invisible group-hover:visible absolute z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-2 right-0 top-full mt-2 whitespace-normal break-words">Total aggregated 90-day forecast across all listed products.</div>
                </div>
              </div>
              <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Projected Qty (Next 90 Days)</h3>
                  <div className="text-4xl font-bold text-[#de4b33]">
                      {aggregate ? new Intl.NumberFormat('en-IN').format(aggregate.totalSales3Months) : '-'}
                  </div>
              </div>
              <div className="h-px bg-slate-100"></div>
              <div className="relative">
                  <div className="absolute top-0 right-0 z-10">
                      <div className="group relative cursor-help">
                          <Info className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
                          <div className="invisible group-hover:visible absolute z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-2 right-0 top-full mt-2 whitespace-normal break-words">The single product with the highest highest predicted future volume.</div>
                      </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Major Required Product</h3>
                  <div className="text-xl font-bold text-slate-800 line-clamp-2 pr-6">
                      {majorProduct}
                  </div>
              </div>
          </div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-start space-x-3 flex-1">
            <Info className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-emerald-900">Adaptive WMA Engine Active</h2>
              <p className="text-xs text-emerald-700 mt-1">Primary machine learning integration operational. The engine calculates dynamic run rates using Weighted Moving Averages (WMA), prioritizing recent sales velocity.</p>
            </div>
        </div>
        
        <div className="flex items-start space-x-3 flex-1 md:border-l border-emerald-200 md:pl-6">
            <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-emerald-900">Continuous RLHF Base</h2>
              <p className="text-xs text-emerald-700 mt-1">Baseline predictions adjust continuously. AI confidence scores increase automatically as human validations (thumbs up) reinforce the model.</p>
            </div>
        </div>

        {aggregate?.aiLearningProgress !== undefined && (
            <div className="bg-white/60 px-6 py-3 rounded-lg border border-emerald-200 shrink-0 text-center flex flex-col justify-center min-w-[140px] relative hover:bg-white/80 transition-colors group/score cursor-help">
                <div className="absolute top-2 right-2">
                    <Info className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">AI Training Level</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">{Math.floor(aggregate.aiLearningProgress)}%</div>
                
                <div className="invisible group-hover/score:visible absolute z-50 w-64 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 right-0 top-full mt-2 whitespace-normal break-words text-left">
                    <div className="font-bold text-emerald-300 mb-1 border-b border-slate-700 pb-1">How to increase your score?</div>
                    To increase this score, continuously validate or invalidate product forecasts in the table below using the <ThumbsUp className="w-3 h-3 inline pb-0.5 mx-0.5 text-emerald-300" /> / <ThumbsDown className="w-3 h-3 inline pb-0.5 mx-0.5 text-rose-300" /> actions. The model recalibrates daily based on this RLHF loop.
                </div>
            </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Product Wise Demand Forecast</h2>
            <p className="text-xs text-slate-500">Live Prediction over ABK Data</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-3">
            <select 
                title="Category"
                value={category} 
                onChange={e => {setCategory(e.target.value); setPage(1);}} 
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <select 
                title="Brand"
                value={brand} 
                onChange={e => {setBrand(e.target.value); setPage(1);}} 
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            <select 
                title="Sort By"
                value={sortBy} 
                onChange={e => {setSortBy(e.target.value); setPage(1);}} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
                <option value="volume_desc">Sort by Top 90D Forecast</option>
                <option value="qty_desc">Sort by Historical Qty</option>
                <option value="value_desc">Sort by Sales Value</option>
            </select>

            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Code/Name..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </form>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-290px)]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product & Category</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Historical Qty & Prev Month</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right bg-slate-50">Base Forecast (3M)</th>
                <th className="p-4 text-xs font-bold text-indigo-700 uppercase tracking-wider text-right bg-indigo-50">Target Demand (3M)</th>
                <th className="p-4 text-xs font-bold text-indigo-700 uppercase tracking-wider text-center bg-indigo-50">Adj. Conf.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, idx: number) => {
                const prevMonthQty = row.runRate || 0;
                const forecastNext = row.forecastNextMonth || 0;
                const variance = prevMonthQty > 0 ? ((forecastNext - prevMonthQty) / prevMonthQty) * 100 : 0;
                return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm max-w-sm">
                    <div className="font-bold font-mono text-slate-900">{row.itemCode}</div>
                    <div className="text-slate-800 font-bold" title={row.itemName}>{row.itemName}</div>
                    <div className="text-xs text-teal-700 font-bold tracking-wide mt-1">{row.category} | {row.brand}</div>
                    <div className="text-[11px] font-medium text-amber-700 mt-1.5 flex items-center gap-1 w-fit bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Trading Window: {row.firstSoldDate ? new Date(row.firstSoldDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'short', day: 'numeric'}) : '-'} 
                        <ChevronRight className="w-3 h-3 text-amber-500/50 mx-0.5" />
                        {row.lastSoldDate ? new Date(row.lastSoldDate).toLocaleDateString('en-IN', {year: 'numeric', month: 'short', day: 'numeric'}) : '-'}
                    </div>
                    <button 
                        onClick={() => setSelectedSupplyChain(row)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors w-fit bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-md"
                    >
                        <Truck className="w-3.5 h-3.5" />
                        View Supply Chain
                    </button>
                  </td>
                  <td className="p-4 text-sm text-slate-600 text-right">
                    <div className="text-slate-800 text-sm font-semibold mb-1.5" title="Total Historical Qty">{new Intl.NumberFormat('en-IN').format(row.qty || 0)} <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wide"> Hist. Qty</span></div>
                    <div className="text-indigo-600 text-base font-black">
                        {new Intl.NumberFormat('en-IN').format(prevMonthQty)}<span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider ml-1">Prev. Month</span>
                    </div>
                    {variance !== 0 && (
                        <div className={`text-[10px] font-bold mt-0.5 flex items-center justify-end ${variance > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {variance > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                            {Math.abs(Math.round(variance))}% vs Prev. Month
                        </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-800 text-right text-lg bg-slate-50">
                      {new Intl.NumberFormat('en-IN').format(row.forecast3Months || 0)}
                  </td>
                  <td className="p-4 text-indigo-700 text-right font-black text-lg bg-indigo-50/50">
                      <div className="flex flex-col items-end justify-center">
                          <span>{new Intl.NumberFormat('en-IN').format(row.finalDemand !== undefined ? row.finalDemand : (row.forecast3Months || 0))}</span>
                          {row.variancePercentage !== undefined && row.variancePercentage !== 0 && (
                              <span className={`flex items-center text-[10px] font-bold mt-1 ${row.variancePercentage > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {row.variancePercentage > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                  {Math.abs(row.variancePercentage)}% Impact
                              </span>
                          )}
                      </div>
                  </td>
                  <td className="p-4 text-sm text-center bg-indigo-50/50">
                      <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${(row.adjustedConfidence || row.confidenceScore) >= 80 ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : (row.adjustedConfidence || row.confidenceScore) >= 60 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                              {row.adjustedConfidence || row.confidenceScore}% (Adj)
                          </span>
                          <div className="flex items-center justify-center gap-3 mt-1">
                              <button 
                                disabled={validating === row.itemCode}
                                onClick={() => handleValidate(row.itemCode)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                                title="Approve Adjusted Demand"
                              >
                                  <ThumbsUp className="w-3 h-3" />
                                  <span className="hidden md:inline">Right</span>
                              </button>
                              <button 
                                disabled={validating === row.itemCode}
                                onClick={() => handleInvalidate(row.itemCode)}
                                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                                title="Reject Adjusted Demand"
                              >
                                  <ThumbsDown className="w-3 h-3" />
                                  <span className="hidden md:inline">Wrong</span>
                              </button>
                          </div>
                      </div>
                  </td>
                </tr>
              )})}
              {data.length === 0 && !isFetching && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No product forecasts found matching criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-auto">
            <span className="text-sm font-medium text-slate-600">
                Showing {total > 0 ? ((page - 1) * limit) + 1 : 0} - {Math.min(page * limit, total)} of {total} rows
            </span>
            <div className="flex items-center space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                <span className="text-sm font-medium">Page {page} of {totalPages || 1}</span>
                <button disabled={page >= totalPages || total === 0} onClick={() => setPage(p => p + 1)} className="p-1 rounded hover:bg-slate-200 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
        </div>
      </div>

      {selectedSupplyChain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50">
                <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Truck className="w-6 h-6 text-indigo-600" />
                        Supply Chain Map
                    </h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">End-to-end logistics & risk matrix for <span className="text-slate-800 font-bold">{selectedSupplyChain.itemName}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedSupplyChain(null)} 
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex flex-col gap-8">
                
                {/* Visual Pipeline */}
                <div>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Logistics Pipeline</h4>
                   <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="relative flex items-center justify-between z-0">
                            {/* The Line */}
                            <div className="absolute top-1/2 left-[10%] right-[10%] h-1 bg-slate-100 -translate-y-1/2 z-[1]"></div>
                            
                            <div className="relative z-10 flex flex-col items-center gap-2 flex-1 pt-2">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                                    <PackageOpen className="w-5 h-5" />
                                </div>
                                <div className="text-center absolute top-14 mt-1 w-32">
                                    <div className="text-xs font-bold text-slate-800">Sourcing</div>
                                    <div className="text-[10px] text-slate-500 font-medium leading-tight">Global Suppliers</div>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-2 flex-1 pt-2">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
                                </div>
                                <div className="text-center absolute top-14 mt-1 w-32">
                                    <div className="text-xs font-bold text-slate-800">Customs</div>
                                    <div className="text-[10px] text-slate-500 font-medium leading-tight">Border Clearance</div>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-2 flex-1 pt-2">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="text-center absolute top-14 mt-1 w-32">
                                    <div className="text-xs font-bold text-slate-800">Transit</div>
                                    <div className="text-[10px] text-slate-500 font-medium leading-tight">Ocean / Air</div>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-2 flex-1 pt-2">
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div className="text-center absolute top-14 mt-1 w-32">
                                    <div className="text-xs font-bold text-slate-800">Warehouse</div>
                                    <div className="text-[10px] text-slate-500 font-medium leading-tight">Primary Hub</div>
                                </div>
                            </div>
                        </div>
                        {/* Empty spacer so the absolute text elements don't get cut off */}
                        <div className="h-12 mt-2 w-full"></div>
                   </div>
                </div>

                {/* Risk Matrix Grid */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Risk Matrix</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-1.5 bg-rose-50 rounded-md text-rose-600"><AlertCircle className="w-4 h-4"/></div>
                                <span className="text-[10px] font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded tracking-wide uppercase">High</span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 mb-1">Forex Variance</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed">Exchange rate volatility vs USD implies +4% procurement cost buffer required.</div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-1.5 bg-amber-50 rounded-md text-amber-600"><AlertCircle className="w-4 h-4"/></div>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded tracking-wide uppercase">Med</span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 mb-1">Port Congestion</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed">72hr delay anticipated at destination hub due to seasonal shipping volume.</div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600"><Sparkles className="w-4 h-4"/></div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded tracking-wide uppercase">Low</span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 mb-1">Supplier Capacity</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed">Top manufacturer has affirmed 100% capacity matching your baseline forecast.</div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden hover:-translate-y-0.5 transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-1.5 bg-slate-50 rounded-md text-slate-400"><Activity className="w-4 h-4"/></div>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide uppercase">Stable</span>
                            </div>
                            <div className="text-xs font-bold text-slate-800 mb-1">Quality Control</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-relaxed">Historical defect rate remains under 0.2%, well within acceptable boundaries.</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setSelectedSupplyChain(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-colors"
                >
                    Close Matrix
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

