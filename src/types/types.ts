// src/types/dashboard.ts
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSales: number;
  lowStockCount: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  pendingOrders: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  category?: string;
  supplier?: string;
  lastUpdated: string;
}

export interface SaleData {
  id: number;
  sale_date: string;
  created_at: string;
  total: string | number;
  customer_id?: number;
  customer_name?: string;
  status: string;
  items_count?: number;
}

export interface CategoryData {
  id: number;
  name: string;
  products_count: number;
  total_value: number;
  color?: string;
}

export interface InventoryData {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface SalesChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }>;
}

export interface CategoryChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
}

export interface InventoryChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  averageOrderValue: number;
  salesGrowth: number;
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}

export interface RecentActivity {
  id: number;
  type: 'sale' | 'purchase' | 'inventory' | 'product';
  description: string;
  timestamp: string;
  amount?: number;
  user?: string;
}

// Tipo para el estado completo del dashboard
export interface DashboardState {
  stats: DashboardStats;
  salesData: SaleData[];
  categoryData: CategoryData[];
  lowStockProducts: LowStockProduct[];
  inventoryData: InventoryData;
  financialSummary: FinancialSummary;
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}