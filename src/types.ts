export interface ProductMaster {
  sku_code: string;
  sku_name: string;
  brand?: string;
  category?: string;
}

export interface InventorySnapshot {
  id: string;
  sku_code: string;
  warehouse_name: string;
  current_stock: number;
  reserved_stock: number;
  damaged_stock: number;
  available_stock: number;
  last_updated: string;
}

export interface IncomingStock {
  id: string;
  po_number: string;
  sku_code: string;
  supplier_name: string;
  ordered_qty: number;
  pending_qty: number;
  expected_dispatch_date: string;
  expected_arrival_date: string;
  shipment_status: string;
  warehouse_destination: string;
}

export interface ProcurementMaster {
  id: string;
  sku_code: string;
  supplier_name?: string;
  unit_landed_cost?: number;
  moq?: number;
  shelf_life_days?: number;
  criticality_class?: string;
  default_lead_time_days?: number;
  safety_buffer_days?: number;
  service_level?: number;
}

export interface ForecastSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}
