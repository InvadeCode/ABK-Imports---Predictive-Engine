import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Sales } from './pages/Sales';
import { SkuSummary } from './pages/SkuSummary';
import { CustomerMaster } from './pages/CustomerMaster';
import { SkuMaster } from './pages/SkuMaster';
import { SegmentReview } from './pages/SegmentReview';
import { DataHealth } from './pages/DataHealth';
import { ForecastSku } from './pages/ForecastSku';
import { DemandVariance } from './pages/DemandVariance';
import { ForecastCustomers } from './pages/ForecastCustomers';
import { ForecastSegments } from './pages/ForecastSegments';
import { ForecastCategories } from './pages/ForecastCategories';
import { ForecastRegions } from './pages/ForecastRegions';
import { ForecastBrands } from './pages/ForecastBrands';
import { ForecastSalesPartners } from './pages/ForecastSalesPartners';
import { ForecastConfidence } from './pages/ForecastConfidence';
import { InventoryUpload } from './pages/InventoryUpload';
import { InventorySnapshot } from './pages/InventorySnapshot';
import { WarehouseMaster } from './pages/WarehouseMaster';
import { IncomingStock } from './pages/IncomingStock';
import { SupplierMaster } from './pages/SupplierMaster';
import { LeadTimes } from './pages/LeadTimes';
import { StockoutRisk } from './pages/StockoutRisk';
import { OverstockRisk } from './pages/OverstockRisk';
import { ReorderEngine } from './pages/ReorderEngine';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('abk_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('abk_auth', 'true');
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/forecast/sku" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sku" element={<SkuSummary />} />
          <Route path="master/customers" element={<CustomerMaster />} />
          <Route path="master/skus" element={<SkuMaster />} />
          <Route path="master/segment-review" element={<SegmentReview />} />
          <Route path="forecast/sku" element={<ForecastSku />} />
          <Route path="forecast/demand-variance" element={<DemandVariance />} />
          <Route path="forecast/customers" element={<ForecastCustomers />} />
          <Route path="forecast/segments" element={<ForecastSegments />} />
          <Route path="forecast/categories" element={<ForecastCategories />} />
          <Route path="forecast/regions" element={<ForecastRegions />} />
          <Route path="forecast/brands" element={<ForecastBrands />} />
          <Route path="forecast/sales-partners" element={<ForecastSalesPartners />} />
          <Route path="forecast/confidence" element={<ForecastConfidence />} />
          <Route path="inventory/upload" element={<InventoryUpload />} />
          <Route path="inventory/snapshot" element={<InventorySnapshot />} />
          <Route path="inventory/warehouse" element={<WarehouseMaster />} />
          <Route path="procurement/incoming-stock" element={<IncomingStock />} />
          <Route path="procurement/suppliers" element={<SupplierMaster />} />
          <Route path="procurement/lead-times" element={<LeadTimes />} />
          <Route path="engine/stockout-risk" element={<StockoutRisk />} />
          <Route path="engine/overstock" element={<OverstockRisk />} />
          <Route path="actions/reorder" element={<ReorderEngine />} />
          <Route path="data-health" element={<DataHealth />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

