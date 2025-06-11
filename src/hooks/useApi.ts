// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { 
  suppliersAPI, 
  productsAPI, 
  inventoryAPI, 
  salesAPI, 
  reportsAPI,
  apiUtils 
} from '../services/api';

// Tipos para el hook
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  state: ApiState<T>;
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  clearError: () => void;
}

// Hook personalizado para manejo de API
export const useApi = <T = any>(): UseApiReturn<T> => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState(prev => ({ ...prev, data: result, loading: false }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return { state, execute, reset, clearError };
};

// Hook específico para proveedores
export const useSuppliers = () => {
  const { state, execute, reset, clearError } = useApi();

  const getAll = useCallback(() => execute(suppliersAPI.getAll), [execute]);
  const getById = useCallback((id: string | number) => execute(() => suppliersAPI.getById(id)), [execute]);
  const create = useCallback((data: any) => execute(() => suppliersAPI.create(data)), [execute]);
  const update = useCallback((id: string | number, data: any) => execute(() => suppliersAPI.update(id, data)), [execute]);
  const remove = useCallback((id: string | number) => execute(() => suppliersAPI.delete(id)), [execute]);

  return {
    suppliers: state.data,
    loading: state.loading,
    error: state.error,
    getAll,
    getById,
    create,
    update,
    remove,
    reset,
    clearError
  };
};

// Hook específico para productos
export const useProducts = () => {
  const { state, execute, reset, clearError } = useApi();

  const getAll = useCallback(() => execute(productsAPI.getAll), [execute]);
  const getById = useCallback((id: string | number) => execute(() => productsAPI.getById(id)), [execute]);
  const create = useCallback((data: any) => execute(() => productsAPI.create(data)), [execute]);
  const update = useCallback((id: string | number, data: any) => execute(() => productsAPI.update(id, data)), [execute]);
  const remove = useCallback((id: string | number) => execute(() => productsAPI.delete(id)), [execute]);

  return {
    products: state.data,
    loading: state.loading,
    error: state.error,
    getAll,
    getById,
    create,
    update,
    remove,
    reset,
    clearError
  };
};

// Hook específico para inventario
export const useInventory = () => {
  const { state, execute, reset, clearError } = useApi();

  const getAll = useCallback(() => execute(inventoryAPI.getAll), [execute]);
  const getMovements = useCallback((productId?: string | number) => execute(() => inventoryAPI.getMovements(productId)), [execute]);
  const addStock = useCallback((productId: string | number, quantity: number, reason?: string) => 
    execute(() => inventoryAPI.addStock(productId, quantity, reason)), [execute]);
  const removeStock = useCallback((productId: string | number, quantity: number, reason?: string) => 
    execute(() => inventoryAPI.removeStock(productId, quantity, reason)), [execute]);

  return {
    inventory: state.data,
    loading: state.loading,
    error: state.error,
    getAll,
    getMovements,
    addStock,
    removeStock,
    reset,
    clearError
  };
};

// Hook específico para ventas
export const useSales = () => {
  const { state, execute, reset, clearError } = useApi();

  const getAll = useCallback(() => execute(salesAPI.getAll), [execute]);
  const getById = useCallback((id: string | number) => execute(() => salesAPI.getById(id)), [execute]);
  const create = useCallback((data: any) => execute(() => salesAPI.create(data)), [execute]);
  const update = useCallback((id: string | number, data: any) => execute(() => salesAPI.update(id, data)), [execute]);
  const cancel = useCallback((id: string | number) => execute(() => salesAPI.cancel(id)), [execute]);

  return {
    sales: state.data,
    loading: state.loading,
    error: state.error,
    getAll,
    getById,
    create,
    update,
    cancel,
    reset,
    clearError
  };
};

// Hook específico para reportes
export const useReports = () => {
  const { state, execute, reset, clearError } = useApi();

  const getSalesReport = useCallback((startDate: string, endDate: string) => 
    execute(() => reportsAPI.getSalesReport(startDate, endDate)), [execute]);
  const getInventoryReport = useCallback(() => execute(reportsAPI.getInventoryReport), [execute]);
  const getTopProducts = useCallback((limit?: number) => execute(() => reportsAPI.getTopProducts(limit)), [execute]);

  return {
    report: state.data,
    loading: state.loading,
    error: state.error,
    getSalesReport,
    getInventoryReport,
    getTopProducts,
    reset,
    clearError
  };
};

// Exportar utilidades de API
export { apiUtils };