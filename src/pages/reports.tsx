import React from 'react';
import { Card, CardBody, CardHeader, Tabs, Tab, Button, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { SalesChart } from '../components/charts/sales-chart';
import { ProductCategoryChart } from '../components/charts/product-category-chart';
import { InventoryChart } from '../components/charts/inventory-chart';
import { DataTable } from '../components/data-table';
import { salesChartData, categoryChartData, inventoryChartData, products, sales, purchases } from '../data/mock-data';

export const Reports: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('sales');
  const [reportPeriod, setReportPeriod] = React.useState('month');
  
  const salesColumns = [
    {
      key: 'id',
      label: '# Venta'
    },
    {
      key: 'date',
      label: 'Fecha',
      renderCell: (sale: any) => {
        const date = new Date(sale.date);
        return date.toLocaleDateString('es-MX');
      }
    },
    {
      key: 'customer',
      label: 'Cliente'
    },
    {
      key: 'total',
      label: 'Total',
      renderCell: (sale: any) => (
        <span className="font-medium">${sale.total.toFixed(2)}</span>
      )
    }
  ];

  const productColumns = [
    {
      key: 'name',
      label: 'Producto'
    },
    {
      key: 'stock',
      label: 'Stock Actual'
    },
    {
      key: 'minStock',
      label: 'Stock Mínimo'
    },
    {
      key: 'price',
      label: 'Precio',
      renderCell: (product: any) => (
        <span>${product.price.toFixed(2)}</span>
      )
    },
    {
      key: 'cost',
      label: 'Costo',
      renderCell: (product: any) => (
        <span>${product.cost.toFixed(2)}</span>
      )
    }
  ];

  const purchaseColumns = [
    {
      key: 'id',
      label: '# Compra'
    },
    {
      key: 'date',
      label: 'Fecha',
      renderCell: (purchase: any) => {
        const date = new Date(purchase.date);
        return date.toLocaleDateString('es-MX');
      }
    },
    {
      key: 'supplierId',
      label: 'Proveedor',
      renderCell: () => (
        <span>Proveedor</span>
      )
    },
    {
      key: 'total',
      label: 'Total',
      renderCell: (purchase: any) => (
        <span className="font-medium">${purchase.total.toFixed(2)}</span>
      )
    }
  ];

  const handleExportReport = () => {
    alert('Exportando reporte...');
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reportes" 
        description="Análisis y reportes del negocio"
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          aria-label="Opciones de reportes" 
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab as any}
        >
          <Tab key="sales" title="Ventas" />
          <Tab key="inventory" title="Inventario" />
          <Tab key="purchases" title="Compras" />
        </Tabs>
        
        <div className="flex gap-2">
          <Select
            label="Periodo"
            selectedKeys={[reportPeriod]}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="w-40"
          >
            <SelectItem key="day" value="day">Hoy</SelectItem>
            <SelectItem key="week" value="week">Esta semana</SelectItem>
            <SelectItem key="month" value="month">Este mes</SelectItem>
            <SelectItem key="year" value="year">Este año</SelectItem>
          </Select>
          
          <Button 
            color="primary" 
            variant="flat"
            startContent={<Icon icon="lucide:download" />}
            onPress={handleExportReport}
          >
            Exportar
          </Button>
        </div>
      </div>
      
      {selectedTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart data={salesChartData} title="Ventas vs Compras (Mensual)" />
            <Card className="border border-divider">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-semibold text-large">Resumen de Ventas</h4>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-500">Total Ventas</p>
                    <p className="text-2xl font-semibold">$45,000.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Número de Ventas</p>
                    <p className="text-2xl font-semibold">{sales.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Venta Promedio</p>
                    <p className="text-2xl font-semibold">$9,000.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Ventas Pendientes</p>
                    <p className="text-2xl font-semibold">1</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <Card className="border border-divider">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-semibold text-large">Detalle de Ventas</h4>
            </CardHeader>
            <CardBody>
              <DataTable 
                data={sales}
                columns={salesColumns}
                searchable={false}
              />
            </CardBody>
          </Card>
        </div>
      )}
      
      {selectedTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryChart data={inventoryChartData} title="Niveles de Inventario" />
            <ProductCategoryChart data={categoryChartData} title="Productos por Categoría" />
          </div>
          
          <Card className="border border-divider">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-semibold text-large">Detalle de Inventario</h4>
            </CardHeader>
            <CardBody>
              <DataTable 
                data={products}
                columns={productColumns}
                searchable={false}
              />
            </CardBody>
          </Card>
        </div>
      )}
      
      {selectedTab === 'purchases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart data={salesChartData} title="Compras Mensuales" />
            <Card className="border border-divider">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-semibold text-large">Resumen de Compras</h4>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-500">Total Compras</p>
                    <p className="text-2xl font-semibold">$148,000.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Número de Compras</p>
                    <p className="text-2xl font-semibold">{purchases.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Compra Promedio</p>
                    <p className="text-2xl font-semibold">$29,600.00</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Compras Pendientes</p>
                    <p className="text-2xl font-semibold">1</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <Card className="border border-divider">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-semibold text-large">Detalle de Compras</h4>
            </CardHeader>
            <CardBody>
              <DataTable 
                data={purchases}
                columns={purchaseColumns}
                searchable={false}
              />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};