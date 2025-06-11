// src/services/dashboardAPI.ts
import { apiUtils } from './api';

// API específica para el Dashboard
export const dashboardAPI = {
  // Obtener estadísticas generales
  getStats: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/dashboard/stats'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener datos de ventas para gráficos
  getSalesData: async (period: string = 'monthly') => {
    const response = await fetch(
      apiUtils.buildUrl(`/dashboard/sales-data?period=${period}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener datos de categorías para gráficos
  getCategoriesData: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/dashboard/categories-data'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener productos con bajo stock
  getLowStockProducts: async (limit: number = 10) => {
    const response = await fetch(
      apiUtils.buildUrl(`/dashboard/low-stock?limit=${limit}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener datos de inventario para gráficos
  getInventoryData: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/dashboard/inventory-data'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener resumen financiero
  getFinancialSummary: async (startDate?: string, endDate?: string) => {
    let url = '/dashboard/financial-summary';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await fetch(
      apiUtils.buildUrl(url),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit: number = 5) => {
    const response = await fetch(
      apiUtils.buildUrl(`/dashboard/recent-activity?limit=${limit}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  }
};