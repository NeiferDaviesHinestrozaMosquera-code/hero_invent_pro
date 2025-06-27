import { useState, useEffect } from 'react';
import { useApi } from './useApi';

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

export const useReportsData = () => {
  const { fetchData, loading, error, setError } = useApi();
  
  const [salesData, setSalesData] = useState<any[]>([]);
  const [purchasesData, setPurchasesData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [salesVsPurchasesData, setSalesVsPurchasesData] = useState<SalesVsPurchasesData[]>([]);
  const [productCategoryData, setProductCategoryData] = useState<ProductCategoryData[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);

  // Función para cargar datos con reintentos
  const loadDataWithRetry = async <T>(
    endpoint: string,
    setter: (data: T[]) => void,
    retries = 2,
    delay = 1000
  ) => {
    try {
      console.log(`Cargando datos de: ${endpoint}`);
      const data = await fetchData<T[]>(endpoint);
      if (data) {
        console.log(`Datos cargados exitosamente de ${endpoint}:`, data);
        setter(data);
      } else {
        console.warn(`No se recibieron datos de ${endpoint}`);
        setter([]);
      }
    } catch (err) {
      console.error(`Error al cargar ${endpoint}:`, err);
      if (retries > 0) {
        console.log(`Reintentando ${endpoint}... (${retries} intentos restantes)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        await loadDataWithRetry(endpoint, setter, retries - 1, delay * 2);
      } else {
        console.error(`Error persistente en ${endpoint}:`, err);
        // No establecer error global aquí, solo para este endpoint específico
        setter([]);
      }
    }
  };

  const loadAllData = async () => {
    setError(null);
    console.log('Iniciando carga de todos los datos...');
    
    // Cargar datos básicos primero
    const basicDataPromises = [
      loadDataWithRetry<any>('/sales', setSalesData),
      loadDataWithRetry<any>('/purchases', setPurchasesData),
      loadDataWithRetry<any>('/products', setProductsData)
    ];

    // Cargar datos del dashboard
    const dashboardDataPromises = [
      loadDataWithRetry<SalesVsPurchasesData>('/dashboard/sales-vs-purchases', setSalesVsPurchasesData),
      loadDataWithRetry<ProductCategoryData>('/dashboard/products-by-category', setProductCategoryData),
      loadDataWithRetry<InventoryData>('/dashboard/inventory-data', setInventoryData)
    ];

    try {
      // Ejecutar todas las cargas en paralelo
      await Promise.allSettled([...basicDataPromises, ...dashboardDataPromises]);
      console.log('Carga de datos completada');
    } catch (err) {
      console.error('Error general en la carga de datos:', err);
      setError('Error general al cargar los datos');
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Calcular estadísticas con manejo de errores mejorado
  const safeReduce = (arr: any[], key: string) => {
    try {
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      return arr.reduce((sum, item) => {
        const value = item && typeof item === 'object' ? item[key] : 0;
        const numValue = Number(value);
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
    } catch (error) {
      console.error(`Error calculando suma para ${key}:`, error);
      return 0;
    }
  };

  const safeFilter = (arr: any[], condition: (item: any) => boolean) => {
    try {
      if (!Array.isArray(arr)) return [];
      return arr.filter(item => {
        try {
          return condition(item);
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  };

  const salesStats = {
    totalSales: safeReduce(salesData, 'total_amount'),
    totalCount: Array.isArray(salesData) ? salesData.length : 0,
    averageSale: (() => {
      const total = safeReduce(salesData, 'total_amount');
      const count = Array.isArray(salesData) ? salesData.length : 0;
      return count > 0 ? total / count : 0;
    })(),
    pendingCount: safeFilter(salesData, sale => sale?.status === 'pending').length
  };

  const purchasesStats = {
    totalPurchases: safeReduce(purchasesData, 'total_amount'),
    totalCount: Array.isArray(purchasesData) ? purchasesData.length : 0,
    averagePurchase: (() => {
      const total = safeReduce(purchasesData, 'total_amount');
      const count = Array.isArray(purchasesData) ? purchasesData.length : 0;
      return count > 0 ? total / count : 0;
    })(),
    pendingCount: safeFilter(purchasesData, purchase => purchase?.status === 'pending').length
  };

  return {
    salesData: Array.isArray(salesData) ? salesData : [],
    purchasesData: Array.isArray(purchasesData) ? purchasesData : [],
    productsData: Array.isArray(productsData) ? productsData : [],
    salesVsPurchasesData: Array.isArray(salesVsPurchasesData) ? salesVsPurchasesData : [],
    productCategoryData: Array.isArray(productCategoryData) ? productCategoryData : [],
    inventoryData: Array.isArray(inventoryData) ? inventoryData : [],
    salesStats,
    purchasesStats,
    loading,
    error,
    refreshData: loadAllData
  };
};