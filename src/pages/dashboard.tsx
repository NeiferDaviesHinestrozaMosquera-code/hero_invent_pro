import React from 'react';
import { Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';
import { StatsCard } from '../components/stats-card';
import { SalesChart } from '../components/charts/sales-chart';
import { ProductCategoryChart } from '../components/charts/product-category-chart';
import { InventoryChart } from '../components/charts/inventory-chart';
import { PageHeader } from '../components/page-header';
import { products, categories, suppliers, salesChartData, categoryChartData, inventoryChartData } from '../data/mock-data';

export const Dashboard: React.FC = () => {
  const lowStockProducts = products.filter(product => product.stock <= product.min_stock);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen general del negocio"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ventas del mes"
          value="$45,000.00"
          icon="lucide:shopping-cart"
          color="primary"
          change={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Productos"
          value={products.length.toString()}
          icon="lucide:package"
          color="secondary"
        />
        <StatsCard
          title="Categorías"
          value={categories.length.toString()}
          icon="lucide:tag"
          color="success"
        />
        <StatsCard
          title="Proveedores"
          value={suppliers.length.toString()}
          icon="lucide:truck"
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesChartData} title="Ventas vs Compras (Mensual)" />
        <ProductCategoryChart data={categoryChartData} title="Productos por Categoría" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryChart data={inventoryChartData} title="Niveles de Inventario" />

        <Card className="border border-divider">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h4 className="font-semibold text-large">Productos con Bajo Stock</h4>
          </CardHeader>
          <CardBody>
            {lowStockProducts.length > 0 ? (
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
              <center> <text name="" id="">Create for Digital Emporiun - 2025</text></center>

    </div>
  );
};