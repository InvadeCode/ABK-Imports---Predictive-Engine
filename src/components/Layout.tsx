import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Users, 
  Tags, 
  Map, 
  Database,
  SearchCode,
  RefreshCw,
  TrendingUp,
  LineChart,
  PieChart,
  BarChart2,
  MapPin,
  Layers,
  Briefcase,
  Target,
  Upload,
  Archive,
  Truck,
  Box,
  Factory,
  Clock,
  AlertCircle
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/forecast/sku', label: 'Predictive Forecasting', icon: TrendingUp },
  { path: '/forecast/demand-variance', label: 'Demand Impact Model', icon: Target },
  /* { path: '/master/skus', label: 'Product Master List', icon: Box }, */
  /* { path: '/sales', label: 'Current Sales List', icon: Database }, */
  /* { path: '/master/customers', label: 'Customer Master', icon: Briefcase }, */
  /* { path: '/inventory/snapshot', label: 'Live Inventory', icon: Package }, */
  /* { path: '/engine/stockout-risk', label: 'Supply Chain Breakage', icon: AlertCircle }, */
];

export function Layout() {
  const location = useLocation();
  const [isFetching, setIsFetching] = useState(false);

  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return "Sales Dashboard";
    if (location.pathname.includes('sales')) return "Current Sales";
    if (location.pathname.includes('sku')) return "Product Analytics";
    if (location.pathname.includes('master/customers')) return "Customer Master";
    if (location.pathname.includes('master/skus')) return "Product Master";
    if (location.pathname.includes('master/segment-review')) return "Segment Review";
    if (location.pathname.includes('forecast/sku')) return "Product Wise Forecast";
    if (location.pathname.includes('forecast/customers')) return "Customer Forecast";
    if (location.pathname.includes('forecast/segments')) return "Segment Forecast";
    if (location.pathname.includes('forecast/categories')) return "Category Forecast";
    if (location.pathname.includes('forecast/regions')) return "Region Forecast";
    if (location.pathname.includes('forecast/brands')) return "Brand Forecast";
    if (location.pathname.includes('forecast/sales-partners')) return "Sales Partner Forecast";
    if (location.pathname.includes('forecast/confidence')) return "Forecast Confidence Engine";
    if (location.pathname.includes('inventory/upload')) return "Data Upload Env";
    if (location.pathname.includes('inventory/snapshot')) return "Current Inventory";
    if (location.pathname.includes('inventory/warehouse')) return "Warehouses";
    if (location.pathname.includes('procurement/incoming-stock')) return "In-Transit Stock";
    if (location.pathname.includes('procurement/suppliers')) return "Vendor Master";
    if (location.pathname.includes('procurement/lead-times')) return "Lead Times & Buffers";
    if (location.pathname.includes('data-health')) return "Data Quality";
    return "ABK Internal";
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1e293b] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-16 md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20 shadow-[2px_0_15px_rgba(0,0,0,0.02)]">
        <div className="overflow-y-auto flex-1 pb-4">
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100 mb-2 sticky top-0 bg-white z-10 hover:bg-[#FAF9F6] transition-colors cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 hover:scale-105 transition-transform bg-[#F8F9FA] border border-slate-100 p-1">
              <img src="https://abkimports.com/wp-content/uploads/2023/04/ABK-Logo_150pix-x-150pix-01.png" alt="ABK" className="w-full h-full object-contain" />
            </div>
            <span className="hidden md:block ml-3 font-bold tracking-tight text-[#243673]">ABK Dashboard</span>
          </div>

          <nav className="p-3 space-y-1 mt-2">
            {MENU_ITEMS.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive ? 'bg-[#de4b33] text-white shadow-md shadow-[#de4b33]/20' : 'text-slate-500 hover:bg-slate-50 hover:text-[#243673]'}`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="hidden md:block ml-3">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 md:px-10 shrink-0 z-10 sticky top-0 transition-all duration-300">
          <h1 className="text-lg font-bold tracking-tight text-[#243673]">
            {getPageTitle()}
          </h1>
          
          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isFetching ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-[11px] font-bold text-slate-600 tracking-wide">Live Supabase Sync</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
           <Outlet context={{ isFetching, setIsFetching }} />
        </div>
      </div>
    </div>
  );
}
