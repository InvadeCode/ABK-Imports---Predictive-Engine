const SUPABASE_REST_URL = 'https://eogqfqcsfzmjtxztqiag.supabase.co/rest/v1';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZ3FmcWNzZnptanR4enRxaWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA1NjY1NiwiZXhwIjoyMDk2NjMyNjU2fQ.EzLgxrUE7mxmCWjv-ZCYmTC90xjDQdu3mNd5klw0K3o';

async function run() {
  const res = await fetch(`${SUPABASE_REST_URL}/abk_phase1_sales_kpis`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });
  console.log(await res.text());
}
run();
