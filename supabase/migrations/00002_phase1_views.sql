-- Phase 1 Dashboard Views
-- These views aggregate data from public.abk_sales_transactions to prevent the frontend
-- from calculating KPIs on partially fetched rows.
-- Converted to MATERIALIZED VIEWS to avoid statement timeouts on 400k+ rows.

DROP VIEW IF EXISTS public.abk_phase1_sales_kpis CASCADE;
DROP VIEW IF EXISTS public.abk_phase1_monthly_sales CASCADE;
DROP VIEW IF EXISTS public.abk_phase1_sku_summary CASCADE;
DROP VIEW IF EXISTS public.abk_phase1_customer_summary CASCADE;
DROP VIEW IF EXISTS public.abk_phase1_category_summary CASCADE;
DROP VIEW IF EXISTS public.abk_phase1_brand_summary CASCADE;
DROP VIEW IF EXISTS public.abk_phase1_region_summary CASCADE;

-- 1. Main KPIs
CREATE MATERIALIZED VIEW public.abk_phase1_sales_kpis AS
SELECT
  COUNT(*) AS total_rows,
  COUNT(DISTINCT item_code) AS unique_skus,
  COUNT(DISTINCT customer_name) AS unique_customers,
  SUM(stock_qty) AS total_quantity,
  SUM(amount) AS total_sales_value,
  MIN(posting_date) AS first_date,
  MAX(posting_date) AS last_date
FROM public.abk_sales_transactions;

-- 2. Monthly Sales
CREATE MATERIALIZED VIEW public.abk_phase1_monthly_sales AS
SELECT
  date_trunc('month', posting_date::date)::date AS month,
  SUM(stock_qty) AS qty,
  SUM(amount) AS value
FROM public.abk_sales_transactions
GROUP BY date_trunc('month', posting_date::date)
ORDER BY month ASC;

-- 3. SKU Summary
CREATE MATERIALIZED VIEW public.abk_phase1_sku_summary AS
SELECT
  item_code,
  MAX(item_name) AS item_name,
  MAX(brand) AS brand,
  MAX(item_group) AS category,
  SUM(stock_qty) AS qty,
  SUM(amount) AS value,
  MIN(posting_date) AS first_sold_date,
  MAX(posting_date) AS last_sold_date
FROM public.abk_sales_transactions
GROUP BY item_code;

-- 4. Customer Summary
CREATE MATERIALIZED VIEW public.abk_phase1_customer_summary AS
SELECT
  customer_name,
  MAX(city) AS city,
  MAX(state) AS state,
  MAX(territory) AS territory,
  SUM(stock_qty) AS qty,
  SUM(amount) AS value,
  COUNT(DISTINCT invoice_no) AS invoices_count,
  MIN(posting_date) AS first_purchase_date,
  MAX(posting_date) AS last_purchase_date
FROM public.abk_sales_transactions
GROUP BY customer_name;

-- 5. Category Summary
CREATE MATERIALIZED VIEW public.abk_phase1_category_summary AS
SELECT
  item_group AS category,
  SUM(stock_qty) AS qty,
  SUM(amount) AS value
FROM public.abk_sales_transactions
GROUP BY item_group;

-- 6. Brand Summary
CREATE MATERIALIZED VIEW public.abk_phase1_brand_summary AS
SELECT
  brand,
  SUM(stock_qty) AS qty,
  SUM(amount) AS value
FROM public.abk_sales_transactions
GROUP BY brand;

-- 7. Region/State Summary
CREATE MATERIALIZED VIEW public.abk_phase1_region_summary AS
SELECT
  state AS region,
  SUM(stock_qty) AS qty,
  SUM(amount) AS value
FROM public.abk_sales_transactions
GROUP BY state;
