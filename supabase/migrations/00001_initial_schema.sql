-- Supabase Tables / Views for ABK Imports Predictive Engine

-- 1. Configuration Tables

CREATE TABLE IF NOT EXISTS public.abk_inventory_snapshot (
    id uuid primary key default gen_random_uuid(),
    sku_code text not null,
    warehouse_name text default 'Main Warehouse',
    current_stock numeric default 0,
    reserved_stock numeric default 0,
    damaged_stock numeric default 0,
    available_stock numeric generated always as (current_stock - reserved_stock - damaged_stock) stored,
    last_updated timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.abk_incoming_stock (
    id uuid primary key default gen_random_uuid(),
    po_number text,
    sku_code text not null,
    supplier_name text,
    ordered_qty numeric default 0,
    pending_qty numeric default 0,
    expected_dispatch_date date,
    expected_arrival_date date,
    shipment_status text,
    warehouse_destination text,
    created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.abk_sku_procurement_master (
    id uuid primary key default gen_random_uuid(),
    sku_code text unique not null,
    supplier_name text,
    unit_landed_cost numeric,
    moq numeric,
    shelf_life_days integer,
    criticality_class text default 'B',
    default_lead_time_days integer default 50,
    safety_buffer_days integer default 15,
    service_level numeric default 0.95,
    created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.abk_supplier_performance (
    id uuid primary key default gen_random_uuid(),
    supplier_name text unique not null,
    supplier_processing_days integer default 7,
    transit_days integer default 30,
    customs_grn_days integer default 7,
    warehouse_processing_days integer default 3,
    on_time_delivery_percent numeric default 80,
    fill_rate_percent numeric default 85,
    order_accuracy_percent numeric default 90,
    delay_frequency_percent numeric default 10,
    cancellation_frequency_percent numeric default 5,
    created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.abk_forecast_actions (
    id uuid primary key default gen_random_uuid(),
    action_type text,
    sku_code text,
    customer_name text,
    region text,
    priority text,
    reason text,
    recommended_quantity numeric,
    confidence_score numeric,
    status text default 'Open',
    owner text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.abk_forecast_settings (
    id uuid primary key default gen_random_uuid(),
    setting_key text unique not null,
    setting_value text,
    description text,
    updated_at timestamptz default now()
);

-- Insert default settings if empty
INSERT INTO public.abk_forecast_settings (setting_key, setting_value, description)
VALUES 
    ('default_lead_time_days', '50', 'Default lead time in days if supplier data is missing'),
    ('default_safety_buffer_days', '15', 'Default safety buffer in days'),
    ('default_service_level', '0.95', 'Default service level for safety stock calculation'),
    ('default_z_score', '1.65', 'Z-score for 95% service level'),
    ('dead_stock_days', '180', 'Days of no sales to consider dead stock'),
    ('slow_moving_days', '90', 'Days of no sales to consider slow moving'),
    ('forecast_months', '3', 'Number of months to forecast')
ON CONFLICT (setting_key) DO NOTHING;

-- Note: The following views depend on the existence of missing tables from the current database:
-- abk_sales_monthly_sku, abk_sales_transactions, abk_product_master_from_sales
-- abk_sales_monthly_customer_sku, abk_sales_yearly_summary, abk_sku_qty_sample, abk_sku_qty_monthly, abk_sku_qty_yearly_totals

-- Creates safe view structure allowing fallback when tables are empty/missing
CREATE OR REPLACE VIEW public.abk_forecast_sku_base AS
SELECT 
    p.sku_code,
    p.sku_name,
    p.brand,
    p.category,
    COALESCE(m.last_30_days_sales, 0) as recent_velocity,
    COALESCE(m.avg_monthly_sales, 0) as avg_monthly
FROM 
    -- Assuming abk_product_master_from_sales structure
    -- Replace with actual table columns if different
    public.abk_product_master_from_sales p
LEFT JOIN (
    SELECT sku_code, SUM(qty) as last_30_days_sales, AVG(qty) as avg_monthly_sales
    FROM public.abk_sales_transactions
    GROUP BY sku_code
) m ON p.sku_code = m.sku_code;

CREATE OR REPLACE VIEW public.abk_stockout_risk_view AS
SELECT 
    p.sku_code,
    i.available_stock,
    i.current_stock,
    COALESCE(inc.pending_qty, 0) as incoming_stock,
    pm.default_lead_time_days as lead_time,
    pm.safety_buffer_days as safety_stock
FROM 
    public.abk_product_master_from_sales p
LEFT JOIN public.abk_inventory_snapshot i ON p.sku_code = i.sku_code
LEFT JOIN public.abk_incoming_stock inc ON p.sku_code = inc.sku_code
LEFT JOIN public.abk_sku_procurement_master pm ON p.sku_code = pm.sku_code;
