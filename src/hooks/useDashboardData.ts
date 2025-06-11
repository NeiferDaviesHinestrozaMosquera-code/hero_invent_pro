// src/hooks/useDashboardData.ts
import { useState, useCallback, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import type { DashboardStats, LowStockProduct, SaleData, CategoryData } from '../types';

interface DashboardData {
  stats: DashboardStats;
  salesData: SaleData[];
  categoryData: CategoryData[];
  lowStockProducts: LowStockProduct[];
}

interface UseDashboardDataReturn {
  stats: DashboardStats;
  salesData: SaleData[];
  categoryData: CategoryData[];
  lowStockProducts: LowStockProduct[];
  loading: boolean;
  error: string | null;
  actions: {
    fetchDashboardData: () => Promise<void>;
    refreshStats: () => Promise<void>;
    refreshCharts: () => Promise<void>;
  };
}

const initialStats: DashboardStats = {
  totalProducts: 0,
  totalCategories: 0,
  totalSuppliers: 0,
  totalCustomers: 0,
  totalSales: 0,
  lowStockCount: 0,
  monthlyRevenue: 0,
  weeklyRevenue: 0,
  pendingOrders: 0
};

export const useDashboardData = (): UseDashboardDataReturn => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función principal para obtener todos los datos
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener datos en paralelo para mejor rendimiento
      const [statsResponse, salesResponse, categoriesResponse, lowStockResponse] = await Promise.allSettled([
        dashboardAPI.getStats(),
        dashboardAPI.getSalesData(),
        dashboardAPI.getCategoriesData(),
        dashboardAPI.getLowStockProducts()
      ]);

      // Procesar estadísticas
      if (statsResponse.status === 'fulfilled') {
        setStats(statsResponse.value);
      } else {
        console.error('Error cargando estadísticas:', statsResponse.reason);
      }

      // Procesar datos de ventas
      if (salesResponse.status === 'fulfilled') {
        setSalesData(salesResponse.value);
      } else {
        console.error('Error cargando datos de ventas:', salesResponse.reason);
      }

      // Procesar datos de categorías
      if (categoriesResponse.status === 'fulfilled') {
        setCategoryData(categoriesResponse.value);
      } else {
        console.error('Error cargando datos de categorías:', categoriesResponse.reason);
      }

      // Procesar productos con bajo stock
      if (lowStockResponse.status === 'fulfilled') {
        setLowStockProducts(lowStockResponse.value);
      } else {
        console.error('Error cargando productos con bajo stock:', lowStockResponse.reason);
      }

      // Si todos fallaron, mostrar error
      const allFailed = [statsResponse, salesResponse, categoriesResponse, lowStockResponse]
        .every(response => response.status === 'rejected');

      if (allFailed) {
        setError('Error al cargar los datos del dashboard. Verifique la conexión con el servidor.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar el dashboard';
      setError(errorMessage);
      console.error('Error en fetchDashboardData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar solo las estadísticas
  const refreshStats = useCallback(async () => {
    try {
      const newStats = await dashboardAPI.getStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error actualizando estadísticas:', err);
    }
  }, []);

  // Función para actualizar solo los datos de gráficos
  const refreshCharts = useCallback(async () => {
    try {
      const [salesResponse, categoriesResponse] = await Promise.allSettled([
        dashboardAPI.getSalesData(),
        dashboardAPI.getCategoriesData()
      ]);

      if (salesResponse.status === 'fulfilled') {
        setSalesData(salesResponse.value);
      }

      if (categoriesResponse.status === 'fulfilled') {
        setCategoryData(categoriesResponse.value);
      }
    } catch (err) {
      console.error('Error actualizando gráficos:', err);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    salesData,
    categoryData,
    lowStockProducts,
    loading,
    error,
    actions: {
      fetchDashboardData,
      refreshStats,
      refreshCharts
    }
  };
};