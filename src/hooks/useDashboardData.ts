import { useState, useEffect } from 'react';
import { useApi } from './useApi';

interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_suppliers: number;
  monthly_sales: number;
  total_sales: number;
  low_stock_products: number;
}

interface SalesVsPurchasesData {
  name: string;
  ventas: number;
  compras: number;
}

interface ProductCategoryData {
  name: string;
  value: number;
}

interface InventoryData {
  name: string;
  stock: number;
  minimo: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  min_stock: number;
  sku: string;
}

export const useDashboardData = () => {
  const { fetchData, loading, error } = useApi();
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [salesVsPurchasesData, setSalesVsPurchasesData] = useState<SalesVsPurchasesData[]>([]);
  const [productCategoryData, setProductCategoryData] = useState<ProductCategoryData[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  const loadDashboardStats = async () => {
    const data = await fetchData<DashboardStats>('/dashboard/stats');
    if (data) {
      setDashboardStats(data);
    }
  };

  const loadSalesVsPurchasesData = async () => {
    const data = await fetchData<SalesVsPurchasesData[]>('/dashboard/sales-vs-purchases');
    if (data) {
      setSalesVsPurchasesData(data);
    }
  };

  const loadProductCategoryData = async () => {
    const data = await fetchData<ProductCategoryData[]>('/dashboard/products-by-category');
    if (data) {
      setProductCategoryData(data);
    }
  };

  const loadInventoryData = async () => {
    const data = await fetchData<InventoryData[]>('/dashboard/inventory-data');
    if (data) {
      setInventoryData(data);
    }
  };

  const loadLowStockProducts = async () => {
    const data = await fetchData<LowStockProduct[]>('/dashboard/low-stock-products');
    if (data) {
      setLowStockProducts(data);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadDashboardStats(),
      loadSalesVsPurchasesData(),
      loadProductCategoryData(),
      loadInventoryData(),
      loadLowStockProducts()
    ]);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    dashboardStats,
    salesVsPurchasesData,
    productCategoryData,
    inventoryData,
    lowStockProducts,
    loading,
    error,
    refreshData: loadAllData
  };
};

