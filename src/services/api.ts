// src/services/api.ts
import { useState } from 'react';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Utilidades para la API
export const apiUtils = {
  // Construir URL completa
  buildUrl: (endpoint: string) => `${API_BASE_URL}${endpoint}`,
  
  // Configuración base para fetch
  getDefaultConfig: () => ({
    headers: {
      'Content-Type': 'application/json',
      // Agregar token de autenticación si existe
      ...(localStorage.getItem('token') && {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    }
  }),

  // Manejar respuestas
  handleResponse: async (response: Response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

// Hook personalizado para manejo de estados de API
export const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeRequest = async (apiCall: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { loading, error, executeRequest, clearError };
};

// API para Proveedores
export const suppliersAPI = {
  // Obtener todos los proveedores
  getAll: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/suppliers'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener proveedor por ID
  getById: async (id: string | number) => {
    const response = await fetch(
      apiUtils.buildUrl(`/suppliers/${id}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Crear nuevo proveedor
  create: async (supplierData: any) => {
    const response = await fetch(
      apiUtils.buildUrl('/suppliers'),
      {
        method: 'POST',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify(supplierData)
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Actualizar proveedor
  update: async (id: string | number, supplierData: any) => {
    const response = await fetch(
      apiUtils.buildUrl(`/suppliers/${id}`),
      {
        method: 'PUT',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify(supplierData)
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Eliminar proveedor
  delete: async (id: string | number) => {
    const response = await fetch(
      apiUtils.buildUrl(`/suppliers/${id}`),
      {
        method: 'DELETE',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  }
};

// API para Productos
export const productsAPI = {
  // Obtener todos los productos
  getAll: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/products'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener producto por ID
  getById: async (id: string | number) => {
    const response = await fetch(
      apiUtils.buildUrl(`/products/${id}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Crear nuevo producto
  create: async (productData: any) => {
    const response = await fetch(
      apiUtils.buildUrl('/products'),
      {
        method: 'POST',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify(productData)
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Actualizar producto
  update: async (id: string | number, productData: any) => {
    const response = await fetch(
      apiUtils.buildUrl(`/products/${id}`),
      {
        method: 'PUT',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify(productData)
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Eliminar producto
  delete: async (id: string | number) => {
    const response = await fetch(
      apiUtils.buildUrl(`/products/${id}`),
      {
        method: 'DELETE',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  }
};

// API para Inventario
export const inventoryAPI = {
  // Obtener todo el inventario
  getAll: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/inventory'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener movimientos de inventario
  getMovements: async (productId?: string | number) => {
    const url = productId 
      ? `/inventory/movements?productId=${productId}`
      : '/inventory/movements';
    
    const response = await fetch(
      apiUtils.buildUrl(url),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Registrar entrada de inventario
  addStock: async (productId: string | number, quantity: number, reason?: string) => {
    const response = await fetch(
      apiUtils.buildUrl('/inventory/add-stock'),
      {
        method: 'POST',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify({ productId, quantity, reason })
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Registrar salida de inventario
  removeStock: async (productId: string | number, quantity: number, reason?: string) => {
    const response = await fetch(
      apiUtils.buildUrl('/inventory/remove-stock'),
      {
        method: 'POST',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify({ productId, quantity, reason })
      }
    );
    return apiUtils.handleResponse(response);
  }
};

// API para Ventas
export const salesAPI = {
  // Obtener todas las ventas
  getAll: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/sales'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Obtener venta por ID
  getById: async (id: string | number) => {
    const response = await fetch(
      apiUtils.buildUrl(`/sales/${id}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Crear nueva venta
  create: async (saleData: any) => {
    const response = await fetch(
      apiUtils.buildUrl('/sales'),
      {
        method: 'POST',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify(saleData)
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Actualizar venta
  update: async (id: string | number, saleData: any) => {
    const response = await fetch(
      apiUtils.buildUrl(`/sales/${id}`),
      {
        method: 'PUT',
        ...apiUtils.getDefaultConfig(),
        body: JSON.stringify(saleData)
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Cancelar venta
  cancel: async (id: string | number) => {
    const response = await fetch(
      apiUtils.buildUrl(`/sales/${id}/cancel`),
      {
        method: 'PUT',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  }
};

// API para Reportes
export const reportsAPI = {
  // Reporte de ventas
  getSalesReport: async (startDate: string, endDate: string) => {
    const response = await fetch(
      apiUtils.buildUrl(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Reporte de inventario
  getInventoryReport: async () => {
    const response = await fetch(
      apiUtils.buildUrl('/reports/inventory'),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  },

  // Reporte de productos más vendidos
  getTopProducts: async (limit: number = 10) => {
    const response = await fetch(
      apiUtils.buildUrl(`/reports/top-products?limit=${limit}`),
      {
        method: 'GET',
        ...apiUtils.getDefaultConfig()
      }
    );
    return apiUtils.handleResponse(response);
  }
};

// Exportación por defecto (opcional, pero evita el error)
const api = {
  suppliersAPI,
  productsAPI,
  inventoryAPI,
  salesAPI,
  reportsAPI,
  apiUtils,
  useApiState
};

export default api;