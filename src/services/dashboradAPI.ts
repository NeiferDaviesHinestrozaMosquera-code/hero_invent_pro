// src/services/dashboardAPI.ts
import { apiUtils } from './api';

export interface DashboardStats {
  totalSales: number;
  salesGrowth: number;
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
}

export interface SalesChartData {
  name: string;
  ventas: number;
  compras: number;
}

export interface CategoryChartData {
  name: string;
  value: number;
}

export interface InventoryChartData {
  name: string;
  stock: number;
  minimo: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
}

// Obtener estadísticas generales del dashboard
export const getStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch(apiUtils.buildUrl('/dashboard/stats'), {
      ...apiUtils.getDefaultConfig(),
    });
    return await apiUtils.handleResponse(response);
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    throw error;
  }
};

// Obtener datos para gráfico de ventas vs compras mensuales
export const getSalesChartData = async (): Promise<SalesChartData[]> => {
  try {
    const response = await fetch(apiUtils.buildUrl('/dashboard/charts/sales-vs-purchases'), {
      ...apiUtils.getDefaultConfig(),
    });
    return await apiUtils.handleResponse(response);
  } catch (error) {
    console.error('Error al obtener datos de ventas vs compras:', error);
    throw error;
  }
};

// Obtener datos para gráfico de productos por categoría
export const getCategoryChartData = async (): Promise<CategoryChartData[]> => {
  try {
    const response = await fetch(apiUtils.buildUrl('/dashboard/charts/products-by-category'), {
      ...apiUtils.getDefaultConfig(),
    });
    return await apiUtils.handleResponse(response);
  } catch (error) {
    console.error('Error al obtener datos de productos por categoría:', error);
    throw error;
  }
};

// Obtener datos para gráfico de niveles de inventario
export const getInventoryChartData = async (): Promise<InventoryChartData[]> => {
  try {
    const response = await fetch(apiUtils.buildUrl('/dashboard/charts/inventory-levels'), {
      ...apiUtils.getDefaultConfig(),
    });
    return await apiUtils.handleResponse(response);
  } catch (error) {
    console.error('Error al obtener datos de niveles de inventario:', error);
    throw error;
  }
};

// Obtener productos con bajo stock
export const getLowStockProducts = async (): Promise<LowStockProduct[]> => {
  try {
    const response = await fetch(apiUtils.buildUrl('/dashboard/low-stock'), {
      ...apiUtils.getDefaultConfig(),
    });
    return await apiUtils.handleResponse(response);
  } catch (error) {
    console.error('Error al obtener productos con bajo stock:', error);
    throw error;
  }
};

// Obtener resumen de ventas para reportes
export const getSalesSummary = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<any> => {
  try {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const url = apiUtils.buildUrl(
      `/sales/stats/summary?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`
    );

    const response = await fetch(url, {
      ...apiUtils.getDefaultConfig(),
    });

    return await apiUtils.handleResponse(response);
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
};
