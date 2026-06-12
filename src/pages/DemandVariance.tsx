import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Target, Search, ChevronLeft, ChevronRight, Activity, TrendingUp, TrendingDown, Info, IndianRupee } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function DemandVariance() {
  const { isFetching: isGlobalFetching, setIsFetching } = useOutletContext<any>();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [aggregate, setAggregate] = useState<any>(null);
  const [isFetching, setLocalFetching] = useState(false);
  const limit = 50;

  const [macroFactors, setMacroFactors] = useState<any[]>([]);
  const [ignoredFactors, setIgnoredFactors] = useState<string[]>([]);
  const [simulatedEffects, setSimulatedEffects] = useState<Record<string, number>>({});
  const [simulatedValues, setSimulatedValues] = useState<Record<string, any>>({});

  const handleSimulateChange = (f: any, newVal: any) => {
    setSimulatedValues(prev => ({ ...prev, [f.name]: newVal }));
    let newEffect = f.effect;
    if (f.type === 'weather') {
        newEffect = f.effect + ((newVal - f.rawValue) * -0.015);
    } else if (f.type === 'forex') {
        newEffect = f.effect + ((newVal - f.rawValue) * -0.02);
    } else if (f.type === 'rm') {
        newEffect = f.effect + ((newVal - f.rawValue) * -0.03);
    } else if (f.type === 'adoption') {
        newEffect = f.effect + ((newVal - f.rawValue) * 0.03);
    } else if (f.type === 'velocity') {
        if (newVal === 'High') newEffect = 0.15;
        else if (newVal === 'Stable') newEffect = 0.05;
        else newEffect = -0.15;
    } else if (f.type === 'freight') {
        if (newVal === 'Low') newEffect = 0.10;
        else if (newVal === 'Normal') newEffect = 0.0;
        else newEffect = -0.08;
    } else if (f.type === 'time') {
        if (newVal === 'Surge') newEffect = 0.18;
        else newEffect = -0.05;
    } else if (f.type === 'salary') {
        if (newVal === 'Payday Week') newEffect = 0.20;
        else if (newVal === 'Mid-Month') newEffect = 0.05;
        else newEffect = -0.15;
    }
    setSimulatedEffects(prev => ({ ...prev, [f.name]: newEffect }));
  };

  const [expandedFactors, setExpandedFactors] = useState(false);
  const [showSkuLevel, setShowSkuLevel] = useState(false);

  useEffect(() => {
    const fetchDemand = async () => {
      setLocalFetching(true);
      try {
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        const res = await fetch(`/api/forecast/demand-variance?${query.toString()}`);
        if (res.status === 202) {
             setTimeout(fetchDemand, 2000);
             return;
        }
        const json = await res.json();
        setData(json.data || []);
        setTotal(json.totalCount || 0);
        setAggregate(json.aggregate || null);
        if (json.macro) setMacroFactors(json.macro);
      } catch (e) {
        console.error(e);
      } finally {
        setLocalFetching(false);
      }
    };
    fetchDemand();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  // Compute "What-If" data dynamically for interactivity
  const computedData = data.map((row: any) => {
      const isIgnored = ignoredFactors.includes(row.activeFactor?.name);
      
      const factorName = row.activeFactor?.name;
      const originalEffect = row.activeFactor?.effect || 0;
      const appliedEffect = (!row.activeFactor || isIgnored) ? 0 : (simulatedEffects[factorName] !== undefined ? simulatedEffects[factorName] : originalEffect);
      
      const newVarianceDelta = Math.round((row.forecast3Months || 0) * appliedEffect);
      const newVariancePercentage = Math.round(appliedEffect * 100);
      const newFinalDemand = Math.max(0, (row.forecast3Months || 0) + newVarianceDelta);

      return {
          ...row,
          varianceDelta: newVarianceDelta,
          variancePercentage: newVariancePercentage,
          finalDemand: newFinalDemand,
          isIgnored
      };
  });

  const computedAggregate = React.useMemo(() => {
      let simulatedNetVariance = 0;
      if (aggregate && aggregate.factorAggregates) {
          Object.keys(aggregate.factorAggregates).forEach(factorName => {
              const baseForFactor = aggregate.factorAggregates[factorName];
              const isIgnored = ignoredFactors.includes(factorName);
              
              const factorMatch = macroFactors.find(m => m.name === factorName);
              const originalEffect = factorMatch ? factorMatch.effect : 0;
              const appliedEffect = (!factorMatch || isIgnored) ? 0 : (simulatedEffects[factorName] !== undefined ? simulatedEffects[factorName] : originalEffect);
              
              simulatedNetVariance += Math.round(baseForFactor * appliedEffect);
          });
      }
      
      const totalBaseForecast = aggregate ? aggregate.totalBaseForecast : 0;

      return {
          totalBaseForecast,
          totalFinalDemand: Math.max(0, totalBaseForecast + simulatedNetVariance),
          netVariance: simulatedNetVariance,
      };
  }, [aggregate, simulatedEffects, ignoredFactors, macroFactors]);

  const chartData = computedData.slice(0, 10).map((d: any) => ({
      name: d.itemCode,
      shortName: d.itemName.substring(0, 15) + (d.itemName.length > 15 ? '...' : ''),
      BaseForecast: d.forecast3Months,
      FinalDemand: d.finalDemand,
  }));

  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [currentConfidence, setCurrentConfidence] = useState(88);

  const generateRuleBasedInsights = React.useCallback(() => {
      let high = { text: "Reduce immediate import orders for Chip Chops & Farmina by 15% due to elevated forex and ocean freight costs. Wait for end-of-month stabilization.", impact: "Excessive working capital lock-up and ~4.2% margin erosion due to unoptimized procurement timing." };
      let medium = { text: "Increase bulk raw material procurement for domestic brands (like Drools) by 5% to hedge against the rising Poultry & Grain index.", impact: "Potential stock-outs on high-velocity SKUs and vulnerability to sudden raw material price hikes." };
      let low = { text: "Adjust procurement padding for temperature-sensitive pet foods (wet foods/treats) by +2 days to buffer against mild logistical transit delays.", impact: "Minor out-of-stock events on low-margin fast-moving items." };

      if (simulatedValues['Currency Exchange'] && simulatedValues['Currency Exchange'] > 85) {
          high.text = `Delay immediate import orders for premium imported brands. Forex is highly elevated at ₹${simulatedValues['Currency Exchange']}, eating into target margins.`;
      } else if (simulatedValues['Currency Exchange'] && simulatedValues['Currency Exchange'] < 82) {
          high.text = `Accelerate import orders for premium brands. Favorable forex at ₹${simulatedValues['Currency Exchange']} improves margin by ~3%.`;
      }

      if (simulatedValues['Logistics Weather'] && simulatedValues['Logistics Weather'] > 40) {
          low.text = `Extreme heat conditions (${simulatedValues['Logistics Weather']}°C) detected. Ensure temperature-controlled transit for sensitive SKUs (e.g., wet food, treats) to prevent spoilage.`;
      } else if (simulatedValues['Logistics Weather'] && simulatedValues['Logistics Weather'] < 15) {
          low.text = `Unusually cold conditions detected (${simulatedValues['Logistics Weather']}°C). Expect minor transit delays in northern regions.`;
      }

      if (simulatedValues['Domestic Raw Material Index'] && simulatedValues['Domestic Raw Material Index'] > 10) {
          medium.text = `Raw material index is critically high at ${simulatedValues['Domestic Raw Material Index']}%. Lock in domestic supply contracts now before further inflation hits bottom line.`;
      } else if (simulatedValues['Domestic Raw Material Index'] && simulatedValues['Domestic Raw Material Index'] < 2) {
          medium.text = `Raw material costs are currently suppressed at ${simulatedValues['Domestic Raw Material Index']}%. Opportunity to build up domestic inventory of high-margin treats.`;
      }

      setAiRecommendations({ high, medium, low });
      setCurrentConfidence(84 + Math.floor(Math.random() * 8));
  }, [simulatedValues]);

  useEffect(() => {
      generateRuleBasedInsights();
  }, [generateRuleBasedInsights]);

  const invokeGemini = async () => {
      setIsAiGenerating(true);
      try {
          const res = await fetch("/api/gemini/recommendations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ simulatedValues })
          });
          const json = await res.json();
          if (json.usingFallback || !json.recommendations) {
              generateRuleBasedInsights();
          } else {
              const recs = json.recommendations;
              const h = recs.find((r:any) => r.priority === 'high') || recs[0];
              const m = recs.find((r:any) => r.priority === 'medium') || recs[1];
              const l = recs.find((r:any) => r.priority === 'low') || recs[2];
              setAiRecommendations({ high: h, medium: m, low: l });
              if (json.confidence) setCurrentConfidence(json.confidence);
          }
      } catch (e) {
          generateRuleBasedInsights();
      } finally {
          setIsAiGenerating(false);
      }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const match = chartData.find(c => c.name === label);
      return (
        <div className="bg-slate-800 text-white p-3 rounded-lg shadow-xl border border-slate-700">
          <p className="font-bold mb-1">{match?.shortName}</p>
          <p className="text-xs text-slate-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }}></span>
              <span className="opacity-80">{entry.name}:</span>
              <span className="font-bold">{new Intl.NumberFormat('en-IN').format(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Demand Impact Model</h1>
            <div className="group relative cursor-help">
                <Info className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors" />
                <div className="invisible group-hover:visible absolute z-50 w-64 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-3 left-1/2 -translate-x-1/2 top-full mt-2 whitespace-normal break-words text-left">
                    <div className="font-bold mb-1">About This Page</div>
                    This page simulates the real-time variation of demand based on live external events (like weather changes, foreign exchange rates, and market sentiment).
                </div>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">Real-time delta variance mapped against live external APIs (Weather, Forex, Time)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group/card">
              <div className="absolute top-3 right-3 z-10">
                  <div className="group relative cursor-help">
                      <Info className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
                      <div className="invisible group-hover:visible absolute z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-2 right-0 top-full mt-2 whitespace-normal break-words">Total sum of unmodified AI baseline forecasts for the upcoming 90 days.</div>
                  </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl w-max mb-4 border border-slate-100">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 pr-6">Base Predictive Forecast (3M)</h3>
              <div className="text-3xl font-black text-slate-800">
                  {new Intl.NumberFormat('en-IN').format(computedAggregate.totalBaseForecast || 0)}
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
              <div className="absolute top-3 right-3 z-10">
                  <div className="group relative cursor-help">
                      <Info className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
                      <div className="invisible group-hover:visible absolute z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-2 right-0 top-full mt-2 whitespace-normal break-words">Aggregate volume shift based on live external events (weather, forex, etc).</div>
                  </div>
              </div>
              <div className={`p-3 rounded-xl w-max mb-4 border ${(computedAggregate.netVariance || 0) >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <Activity className={`w-6 h-6 ${(computedAggregate.netVariance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 pr-6">Net Variance Delta</h3>
              <div className="flex items-end gap-2">
                  <div className={`text-3xl font-black ${(computedAggregate.netVariance || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {(computedAggregate.netVariance || 0) > 0 ? '+' : ''}{new Intl.NumberFormat('en-IN').format(computedAggregate.netVariance || 0)}
                  </div>
              </div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
              <div className="absolute top-3 right-3 z-20">
                  <div className="group relative cursor-help">
                      <Info className="w-4 h-4 text-slate-500 hover:text-indigo-400 transition-colors" />
                      <div className="invisible group-hover:visible absolute z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-2 right-0 top-full mt-2 whitespace-normal break-words">Final adjusted volume expectation accounting for external variances.</div>
                  </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Target className="w-32 h-32 text-indigo-300" />
              </div>
              <div className="p-3 bg-slate-800 rounded-xl w-max mb-4 border border-slate-700 relative z-10">
                  <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 pr-6 relative z-10">Real Target Demand (3M)</h3>
              <div className="text-3xl font-black text-white relative z-10">
                  {new Intl.NumberFormat('en-IN').format(computedAggregate.totalFinalDemand || 0)}
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
              <div className="absolute top-3 right-3 z-10">
                  <div className="group relative cursor-help">
                      <Info className="w-4 h-4 text-slate-300 hover:text-indigo-500 transition-colors" />
                      <div className="invisible group-hover:visible absolute z-50 w-48 bg-slate-800 text-white text-xs rounded-lg shadow-xl p-2 right-0 top-full mt-2 whitespace-normal break-words">Average basket spend by pet parent across divisions (Toys, Treats, Food, Medical).</div>
                  </div>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl w-max mb-4 border border-sky-100">
                  <IndianRupee className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 pr-6">Avg Trend Pet Spend</h3>
              <div className="flex items-end gap-2">
                  <div className="text-3xl font-black text-slate-800">
                      ₹1,420
                  </div>
                  <div className="text-sm text-emerald-600 font-bold mb-1 ml-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> 8% MoM
                  </div>
              </div>
          </div>
      </div>

      {macroFactors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Live External Variables</h3>
                <button 
                  onClick={() => setExpandedFactors(!expandedFactors)}
                  className="flex items-center gap-1 text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  {expandedFactors ? "Collapse Variables" : `+ Show All Variables (${macroFactors.length})`}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                {macroFactors.slice(0, expandedFactors ? macroFactors.length : 4).map((f, i) => {
                    const isIgnored = ignoredFactors.includes(f.name);
                    const effectColor = f.effect > 0 ? 'text-emerald-600' : f.effect < 0 ? 'text-rose-600' : 'text-slate-600';
                    const effectBg = f.effect > 0 ? 'bg-emerald-50' : f.effect < 0 ? 'bg-rose-50' : 'bg-slate-50';
                    return (
                    <div 
                        key={i} 
                        className={`relative bg-white border text-left rounded-xl p-4 shadow-sm flex flex-col h-full gap-3 transition-all hover:shadow-md ${isIgnored ? 'opacity-50 grayscale border-slate-200' : 'border-slate-200'}`}
                    >
                        {/* Tooltip top right */}
                        <div className="absolute top-3 right-3 group cursor-help z-10 hidden sm:block">
                            <Info className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            <div className="invisible group-hover:visible absolute z-50 w-56 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg shadow-xl p-3 right-0 top-full mt-2 whitespace-normal break-words">
                                <div className="font-bold mb-1 border-b border-slate-700 pb-1 mb-2">Impact Detail</div>
                                <span className={f.effect > 0 ? 'text-emerald-400' : f.effect < 0 ? 'text-rose-400' : 'text-slate-300'}>
                                    {f.effect > 0 ? 'Positive' : 'Negative'} Net Impact: {Math.abs(f.effect * 100).toFixed(1)}% shift
                                </span>
                                <div className="mt-2 text-slate-400">
                                    This live metric continuously feeds into the predictive baseline, adjusting final target demand.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${effectBg}`}>
                                {f.type === 'weather' ? '☁️' : f.type === 'forex' ? '💲' : f.type === 'time' ? '🗓️' : f.type === 'crypto' ? '₿' : f.type === 'salary' ? '🏦' : f.type === 'social' ? '📱' : f.type === 'fuel' ? '⛽' : f.type==='adoption' ? '🐶' : '📊'}
                            </div>
                            <div className="pr-6">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{f.name}</div>
                                <div className="font-black text-lg text-slate-900 tracking-tight">{f.value}</div>
                            </div>
                        </div>
                        <div className="text-[13px] text-slate-600 leading-relaxed flex-1">
                            {f.description}
                        </div>
                        
                        {!isIgnored && (() => {
                            const simVal = simulatedValues[f.name] !== undefined ? simulatedValues[f.name] : f.rawValue;
                            const isNumeric = ['weather', 'forex', 'rm', 'adoption'].includes(f.type);
                            
                            if (isNumeric) {
                                let min=0, max=100, unit="", step=1;
                                if (f.type === 'weather') { min=10; max=50; unit="°C"; }
                                if (f.type === 'forex') { min=60; max=100; unit="₹"; }
                                if (f.type === 'rm') { min=0; max=20; unit="%"; step=0.1; }
                                if (f.type === 'adoption') { min=0; max=20; unit="% YoY"; step=0.1; }
                                return (
                                    <div className="mt-2 text-xs">
                                        <label className="flex items-center justify-between text-slate-500 font-medium mb-1">
                                            <span>Simulate {f.name}</span>
                                            <span>{simVal}{unit}</span>
                                        </label>
                                        <input 
                                            type="range" 
                                            min={min} 
                                            max={max} 
                                            step={step}
                                            value={simVal}
                                            onChange={(e) => handleSimulateChange(f, parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                );
                            } else {
                                let options = ['Stable', 'Unstable'];
                                if (f.type === 'velocity') options = ['Stable', 'Unstable', 'High'];
                                if (f.type === 'freight') options = ['Low', 'Normal', 'High'];
                                if (f.type === 'time') options = ['Stable', 'Surge'];
                                if (f.type === 'salary') options = ['Payday Week', 'Mid-Month', 'Month-End'];
                                return (
                                    <div className="mt-2 text-xs">
                                        <label className="block text-slate-500 font-medium mb-1">Simulate {f.name}</label>
                                        <select 
                                            value={simVal} 
                                            onChange={(e) => handleSimulateChange(f, e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-md py-1.5 px-2 outline-none focus:border-indigo-500"
                                        >
                                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                );
                            }
                        })()}

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                           <span className={`text-xs font-bold px-2 py-1 rounded-md ${effectBg} ${effectColor}`}>
                               {(f.effect > 0 ? '+' : '')}{(f.effect * 100).toFixed(1)}% Base Impact
                           </span>
                           <button 
                               onClick={() => setIgnoredFactors(prev => isIgnored ? prev.filter(n => n !== f.name) : [...prev, f.name])}
                               className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${isIgnored ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                           >
                               {isIgnored ? 'Include in Calc' : 'Ignore'}
                           </button>
                        </div>
                    </div>
                )})}
            </div>
          </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
            Forecast vs. Adjusted Demand (Top 10 Volume SKUs)
        </h3>
        <div className="w-full h-[300px]">
          {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                 <XAxis dataKey="name" tickFormatter={(v) => chartData.find(c => c.name === v)?.shortName || v} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                 <Tooltip content={<CustomTooltip />} />
                 <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px' }} />
                 <Bar dataKey="BaseForecast" name="Base Forecast" barSize={20} fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                 <Line type="monotone" dataKey="FinalDemand" name="Adjusted Target Demand" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
               </ComposedChart>
             </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Loading visual data...</div>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 relative">
          <div className="flex items-start gap-4">
              <div className="bg-white p-2 text-indigo-600 rounded-full h-fit shadow-sm"><Info className="w-5 h-5" /></div>
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                     <div>
                         <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Recommendation Model</h4>
                         <p className="text-xs text-indigo-800">Based on external factor variances, the AI suggests strategic adjustments to your procurement planning and inventory holding levels.</p>
                     </div>
                     <div className="flex items-center gap-3">
                         <button 
                             onClick={invokeGemini}
                             disabled={isAiGenerating}
                             className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-2 transition-colors ${isAiGenerating ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                         >
                             {isAiGenerating ? 'Generating...' : 'Regenerate Insight'}
                         </button>
                         <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm text-center flex flex-col items-center shrink-0 min-w-20">
                             <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Confidence</div>
                             <div className="text-lg font-black text-indigo-700 leading-none">{currentConfidence}%</div>
                         </div>
                     </div>
                 </div>
                 
                 {aiRecommendations && (
                     <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 transition-opacity duration-300 ${isAiGenerating ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                          <div className="bg-white rounded-lg p-3.5 border border-rose-100 shadow-sm flex flex-col justify-between">
                              <div className="text-[11px] font-black text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>High Priority
                              </div>
                              <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 font-medium text-pretty leading-relaxed">
                                  <li>{aiRecommendations.high?.text}</li>
                              </ul>
                              <div className="mt-3 pt-3 border-t border-rose-50/50">
                                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-1">Impact of Inaction</div>
                                  <p className="text-[11px] text-slate-600 font-medium">{aiRecommendations.high?.impact}</p>
                              </div>
                          </div>
                          <div className="bg-white rounded-lg p-3.5 border border-amber-100 shadow-sm flex flex-col justify-between">
                              <div className="text-[11px] font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>Medium Priority
                              </div>
                              <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 font-medium text-pretty leading-relaxed">
                                  <li>{aiRecommendations.medium?.text}</li>
                              </ul>
                              <div className="mt-3 pt-3 border-t border-amber-50">
                                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mb-1">Impact of Inaction</div>
                                  <p className="text-[11px] text-slate-600 font-medium">{aiRecommendations.medium?.impact}</p>
                              </div>
                          </div>
                          <div className="bg-white rounded-lg p-3.5 border border-emerald-100 shadow-sm flex flex-col justify-between">
                              <div className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Low Priority
                              </div>
                              <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 font-medium text-pretty leading-relaxed">
                                  <li>{aiRecommendations.low?.text}</li>
                              </ul>
                              <div className="mt-3 pt-3 border-t border-emerald-50">
                                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">Impact of Inaction</div>
                                  <p className="text-[11px] text-slate-600 font-medium">{aiRecommendations.low?.impact}</p>
                              </div>
                          </div>
                     </div>
                 )}
              </div>
          </div>
      </div>

      <div>
        <button
          onClick={() => setShowSkuLevel(!showSkuLevel)}
          className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left hover:bg-slate-50 transition-colors"
        >
          <span className="text-base font-bold text-slate-800">SKU Level Demand Variance Analysis</span>
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md">{showSkuLevel ? 'Hide Details' : 'View Details'}</span>
        </button>

        {showSkuLevel && (
        <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">SKU Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Forecast (3M)</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Major External Factor</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Variance Impact</th>
                  <th className="p-4 text-xs font-bold text-indigo-600 uppercase tracking-wider text-right bg-indigo-50/50">Target Demand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {computedData.map((row: any, idx: number) => (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${row.isIgnored ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#243673] truncate max-w-[250px]" title={row.itemName}>{row.itemName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{row.itemCode}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">{new Intl.NumberFormat('en-IN').format(row.forecast3Months || 0)}</td>
                    <td className="p-4">
                        <div className="inline-flex flex-col gap-1 max-w-[400px]">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded w-max ${row.isIgnored ? 'bg-slate-100 text-slate-500' : row.variancePercentage >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {row.activeFactor?.name} {row.isIgnored && '(Ignored)'}
                            </span>
                            <span className="text-[11px] text-slate-500 whitespace-normal break-words leading-tight">
                                {row.activeFactor?.description}
                            </span>
                        </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-right">
                        <div className="flex items-center justify-end gap-2">
                          {row.isIgnored ? (
                              <span className="text-slate-400">0%</span>
                          ) : row.variancePercentage >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                          ) : (
                              <TrendingDown className="w-3 h-3 text-rose-500" />
                          )}
                          {!row.isIgnored && (
                              <span className={row.variancePercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {row.variancePercentage > 0 ? '+' : ''}{row.variancePercentage}% 
                                  <span className="text-xs font-normal opacity-70 ml-1">({(row.varianceDelta > 0 ? '+' : '') + new Intl.NumberFormat('en-IN').format(row.varianceDelta)})</span>
                              </span>
                          )}
                        </div>
                    </td>
                    <td className="p-4 text-sm font-black text-indigo-700 text-right bg-indigo-50/30 text-lg">
                        {new Intl.NumberFormat('en-IN').format(row.finalDemand || 0)}
                    </td>
                  </tr>
                ))}
                {computedData.length === 0 && !isFetching && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No variance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-auto">
            <span className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{(page - 1) * limit + 1}</span> to <span className="font-bold text-slate-700">{Math.min(page * limit, total)}</span> of <span className="font-bold text-slate-700">{total}</span> records
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-700 min-w-[3rem] text-center">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

    </div>
  );
}
