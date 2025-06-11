// 🔗 Tipos TypeScript - Hero Invent Pro
// Archivo generado para definir tipos consistentes entre frontend y backend

// ===================
// TIPOS BASE
// ===================

export interface BaseEntity {
  id?: number;
  created_at?: string;
  updated_at?: string;
}

// ===================
// PRODUCTOS
// ===================

export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  categoryId: number | null;
  supplierId: number | null;
  sku: string;
  barcode: string;
  status: boolean;
  imageUrl: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  categoryId: number | null;
  supplierId: number | null;
  sku: string;
  barcode: string;
  status: boolean;
  imageUrl: string;
}

// Tipo para servidor (snake_case)
export interface ServerProduct {
  id?: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category_id: number | null;
  supplier_id: number | null;
  sku: string;
  barcode: string;
  is_active: boolean;
  image: string;
  created_at?: string;
  updated_at?: string;
}

// ===================
// CATEGORÍAS
// ===================

export interface Category extends BaseEntity {
  name: string;
  description?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

// ===================
// CLIENTES
// ===================

export interface Customer extends BaseEntity {
  first_name: string;
  last_name: string;
  cc: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  active: boolean;
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  cc: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  active: boolean;
}

// ===================
// PROVEEDORES
// ===================

export interface Supplier extends BaseEntity {
  name: string;
  contact_person?: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  active: boolean;
}

export interface SupplierFormData {
  name: string;
  contact_person?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  active: boolean;
}

// ===================
// VENTAS
// ===================

export interface Sale extends BaseEntity {
  customer_id: number | null;
  sale_date: string;
  total: number;
  payment_method: string;
  status: SaleStatus;
  notes?: string;
}

export interface SaleFormData {
  customer_id: number | null;
  sale_date: string;
  total: number;
  payment_method: string;
  status: SaleStatus;
  notes?: string;
}

export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

// ===================
// ITEMS DE VENTA
// ===================

export interface SaleItem extends BaseEntity {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleItemFormData {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// ===================
// COMPRAS
// ===================

export interface Purchase extends BaseEntity {
  supplier_id: number | null;
  purchase_date: string;
  total: number;
  status: PurchaseStatus;
  notes?: string;
}

export interface PurchaseFormData {
  supplier_id: number | null;
  purchase_date: string;
  total: number;
  status: PurchaseStatus;
  notes?: string;
}

export type PurchaseStatus = 'pending' | 'received' | 'cancelled';

// ===================
// ITEMS DE COMPRA
// ===================

export interface PurchaseItem extends BaseEntity {
  purchase_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface PurchaseItemFormData {
  purchase_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

// ===================
// INGRESOS
// ===================

export interface Income extends BaseEntity {
  description: string;
  amount: number;
  category: string;
  income_date: string;
  source?: string;
  notes?: string;
}

export interface IncomeFormData {
  description: string;
  amount: number;
  category: string;
  income_date: string;
  source?: string;
  notes?: string;
}

// ===================
// GASTOS
// ===================

export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes?: string;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes?: string;
}

// ===================
// DASHBOARD
// ===================

export interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;
  lowStockCount: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    fill?: boolean;
  }[];
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  min_stock: number;
  sku: string;
}

// ===================
// API RESPONSES
// ===================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===================
// FORMS & UI
// ===================

export interface FormErrors {
  [key: string]: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  renderCell?: (item: any) => React.ReactNode;
}

export interface TableAction {
  key: string;
  label: string;
  icon: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onAction: (item: any) => void;
}

// ===================
// FILTROS Y BÚSQUEDA
// ===================

export interface SearchFilters {
  query?: string;
  category?: string;
  supplier?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
  inStock?: boolean;
  active?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ===================
// REPORTES
// ===================

export interface ReportConfig {
  type: 'sales' | 'products' | 'inventory' | 'financial';
  dateRange: {
    start: string;
    end: string;
  };
  groupBy?: 'day' | 'week' | 'month' | 'year';
  filters?: SearchFilters;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
  topCategories: {
    category: Category;
    quantity: number;
    revenue: number;
  }[];
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: LowStockProduct[];
  topValueProducts: {
    product: Product;
    totalValue: number;
  }[];
  categoryBreakdown: {
    category: Category;
    productCount: number;
    totalValue: number;
  }[];
}

export interface FinancialReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  incomeBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

// ===================
// ESTADOS DE COMPONENTES
// ===================

export interface ComponentState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ListState<T = any> extends ComponentState<T[]> {
  filters: SearchFilters;
  sort: SortOptions;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ===================
// CONFIGURACIÓN
// ===================

export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production';
  features: {
    enableReports: boolean;
    enableAccounting: boolean;
    enableInventoryTracking: boolean;
  };
  ui: {
    theme: 'light' | 'dark';
    language: 'es' | 'en';
    dateFormat: string;
    currencyFormat: string;
  };
}

// ===================
// EXPORTACIONES POR CATEGORÍA
// ===================

// Productos
export type {
  Product,
  ProductFormData,
  ServerProduct,
};

// Ventas
export type {
  Sale,
  SaleFormData,
  SaleItem,
  SaleItemFormData,
  SaleStatus,
};

// Compras
export type {
  Purchase,
  PurchaseFormData,
  PurchaseItem,
  PurchaseItemFormData,
  PurchaseStatus,
};

// Contabilidad
export type {
  Income,
  IncomeFormData,
  Expense,
  ExpenseFormData,
};

// Dashboard y Reportes
export type {
  DashboardStats,
  ChartData,
  SalesReport,
  InventoryReport,
  FinancialReport,
};

// Estados y API
export type {
  ComponentState,
  ListState,
  ApiResponse,
  PaginatedResponse,
};
