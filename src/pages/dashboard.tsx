import React from 'react';
import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { StatsCard } from '../components/stats-card';
import { SalesChart } from '../components/charts/sales-chart';
import { ProductCategoryChart } from '../components/charts/product-category-chart';
import { InventoryChart } from '../components/charts/inventory-chart';
import { PageHeader } from '../components/page-header';
import { useDashboardData } from '../hooks/useDashboardData';

export const Dashboard: React.FC = () => {
  const {
    dashboardStats,
    salesVsPurchasesData,
    productCategoryData,
    inventoryData,
    lowStockProducts,
    loading,
    error
  } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Resumen general del negocio"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Icon icon="lucide:loader-2" className="animate-spin text-4xl mb-2" />
            <p>Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Resumen general del negocio"
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-danger">
            <Icon icon="lucide:alert-circle" className="text-4xl mb-2" />
            <p>Error al cargar los datos: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general del negocio"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    
        <StatsCard
          title="Ventas del día"
          value={`$${dashboardStats?.today_sales.toLocaleString('es-CO', { minimumFractionDigits: 2 }) || '0.00'}`}
          icon="lucide:shopping-cart"
          color="primary"
        />

        <StatsCard
          title="Ingresos del día"
          value={`$${dashboardStats?.today_income.toLocaleString('es-CO', { minimumFractionDigits: 2 }) || '0.00'}`}
          icon="lucide:arrow-down-circle"
          color="success"
        />

        <StatsCard
          title="Gastos del día"
          value={`$${dashboardStats?.today_expenses.toLocaleString('es-CO', { minimumFractionDigits: 2 }) || '0.00'}`}
          icon="lucide:arrow-up-circle"
          color="danger"
        />

        <StatsCard
          title="Bajo stock"
          value={dashboardStats?.low_stock_count.toString() || '0'}
          icon="lucide:alert-triangle"
          color="warning"
        />
        <StatsCard
          title="Productos"
          value={dashboardStats?.total_products?.toString() || '0'}
          icon="lucide:package"
          color="secondary"
        />
        <StatsCard
          title="Categorías"
          value={dashboardStats?.total_categories?.toString() || '0'}
          icon="lucide:tag"
          color="success"
        />
        <StatsCard
          title="Proveedores"
          value={dashboardStats?.total_suppliers?.toString() || '0'}
          icon="lucide:truck"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesVsPurchasesData} title="Ventas vs Compras (Mensual)" />
        <ProductCategoryChart data={productCategoryData} title="Productos por Categoría" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryChart data={inventoryData} title="Niveles de Inventario" />

        <Card className="border border-divider">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Productos con Bajo Stock</h4>
          </CardHeader>
          <CardBody>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Icon
                          icon="lucide:alert-triangle"
                          className="text-warning mr-2"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-foreground-500">
                            Stock: <span className="text-danger">{product.stock}</span> / Mínimo: {product.min_stock}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        SKU: {product.sku}
                      </div>
                    </div>
                    <Divider className="my-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Icon icon="lucide:check-circle" className="text-success text-4xl mb-2" />
                <p className="text-foreground-600">Todos los productos tienen stock suficiente</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Footer corregido */}
      <div className="text-center py-4">
        <p className="text-sm text-foreground-400">Created for Digital Emporium- 2025</p>
      </div>
    </div>
  );
};