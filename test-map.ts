import dotenv from "dotenv";
const SUPABASE_REST_URL = 'https://eogqfqcsfzmjtxztqiag.supabase.co/rest/v1';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ3FmcWNzZnptanR4enRxaWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA1NjY1NiwiZXhwIjoyMDk2NjMyNjU2fQ.EzLgxrUE7mxmCWjv-ZCYmTC90xjDQdu3mNd5klw0K3o';

async function run() {
    let res = await fetch(`${SUPABASE_REST_URL}/abk_phase1_sku_summary?limit=1`, {
        headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
    });
    let skusRaw = await res.json();
    let s = skusRaw[0];
    
    console.log("Raw s:", s);

    let mapped = {
        itemCode: s.item_code, 
        itemName: s.item_name, 
        brand: s.brand, 
        category: s.parent_item_group || s.item_group, 
        qty: Number(s.total_quantity_sold || s.qty || 0), 
        value: Number(s.total_sales_value || s.value || 0), 
        firstSoldDate: s.first_sale_date || s.first_sold_date, 
        lastSoldDate: s.last_sale_date || s.last_sold_date
    }
    console.log("Mapped:", mapped);
}
run();
