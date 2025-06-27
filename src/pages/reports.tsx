import React from 'react';
import { Card, CardBody, CardHeader, Tabs, Tab, Button, Select, SelectItem, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { SalesChart } from '../components/charts/sales-chart';
import { ProductCategoryChart } from '../components/charts/product-category-chart';
import { InventoryChart } from '../components/charts/inventory-chart';
import { DataTable } from '../components/data-table';
import { useReportsData } from '../hooks/useReportsData';

export const Reports: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState('sales');
  const [reportPeriod, setReportPeriod] = React.useState('month');
  
  const {
    salesData,
    purchasesData,
    productsData,
    salesVsPurchasesData,
    productCategoryData,
    inventoryData,
    salesStats,
    purchasesStats,
    loading,
    error,
    refreshData
  } = useReportsData();
  
  const salesColumns = [
    {
      key: 'id',
      label: '# Venta'
    },
    {
      key: 'sale_date',
      label: 'Fecha',
      renderCell: (sale: any) => {
        try {
          if (!sale?.sale_date) return '-';
          
          // Manejar diferentes formatos de fecha
          let date: Date;
          if (typeof sale.sale_date === 'string') {
            // Si viene como string, intentar parsearlo
            date = new Date(sale.sale_date);
          } else if (sale.sale_date instanceof Date) {
            date = sale.sale_date;
          } else {
            return '-';
          }
          
          // Verificar si la fecha es válida
          if (isNaN(date.getTime())) {
            return '-';
          }
          
          return date.toLocaleDateString('es-CO', {
            year: '2-digit',
            month: '2-digit', 
            day: '2-digit'
          });
        } catch (error) {
          console.error('Error formateando fecha:', error);
          return '-';
        }
      }
    },
    {
      key: 'customer_id',
      label: 'Cliente',
      renderCell: (sale: any) => {
        // Intentar mostrar el nombre del cliente si está disponible
        if (sale?.customer_name) {
          return <span>{sale.customer_name}</span>;
        } else if (sale?.customer?.name) {
          return <span>{sale.customer.name}</span>;
        } else if (sale?.customer_id) {
          return <span>Cliente #{sale.customer_id}</span>;
        } else {
          return <span>Cliente desconocido</span>;
        }
      }
    },
    {
      key: 'total_amount',
      label: 'Total',
      renderCell: (sale: any) => {
        // Intentar diferentes campos donde puede estar el total
        const amount = sale?.total_amount || sale?.total || sale?.amount || 0;
        const numericAmount = Number(amount);
        
        if (isNaN(numericAmount)) {
          return <span className="font-medium text-danger">Error en monto</span>;
        }
        
        return (
          <span className="font-medium text-success">
            {formatCurrency(numericAmount)}
          </span>
        );
      }
    }
  ];

  const productColumns = [
    {
      key: 'name',
      label: 'Producto',
      renderCell: (product: any) => product?.name || product?.product_name || '-'
    },
    {
      key: 'stock',
      label: 'Stock Actual',
      renderCell: (product: any) => {
        const stock = product?.stock || product?.current_stock || product?.quantity || 0;
        const numericStock = Number(stock);
        const minStock = Number(product?.min_stock || 0);
        
        const isLowStock = numericStock <= minStock && minStock > 0;
        
        return (
          <span className={isLowStock ? 'text-danger font-medium' : ''}>
            {numericStock}
            {isLowStock && ' ⚠️'}
          </span>
        );
      }
    },
    {
      key: 'min_stock',
      label: 'Stock Mínimo',
      renderCell: (product: any) => {
        const minStock = product?.min_stock || product?.minimum_stock || 0;
        return Number(minStock);
      }
    },
    {
      key: 'price',
      label: 'Precio',
      renderCell: (product: any) => {
        const price = product?.price || product?.selling_price || 0;
        const numericPrice = Number(price);
        return <span>{formatCurrency(numericPrice)}</span>;
      }
    },
    {
      key: 'cost',
      label: 'Costo',
      renderCell: (product: any) => {
        const cost = product?.cost || product?.purchase_price || product?.unit_cost || 0;
        const numericCost = Number(cost);
        return <span>{formatCurrency(numericCost)}</span>;
      }
    }
  ];

  const purchaseColumns = [
    {
      key: 'id',
      label: '# Compra'
    },
    {
      key: 'purchase_date',
      label: 'Fecha',
      renderCell: (purchase: any) => {
        try {
          const dateField = purchase?.purchase_date || purchase?.date || purchase?.created_at;
          if (!dateField) return '-';
          
          let date: Date;
          if (typeof dateField === 'string') {
            date = new Date(dateField);
          } else if (dateField instanceof Date) {
            date = dateField;
          } else {
            return '-';
          }
          
          if (isNaN(date.getTime())) {
            return '-';
          }
          
          return date.toLocaleDateString('es-CO', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit'
          });
        } catch (error) {
          console.error('Error formateando fecha de compra:', error);
          return '-';
        }
      }
    },
    {
      key: 'supplier_id',
      label: 'Proveedor',
      renderCell: (purchase: any) => {
        if (purchase?.supplier_name) {
          return <span>{purchase.supplier_name}</span>;
        } else if (purchase?.supplier?.name) {
          return <span>{purchase.supplier.name}</span>;
        } else if (purchase?.supplier_id) {
          return <span>Proveedor #{purchase.supplier_id}</span>;
        } else {
          return <span>Proveedor desconocido</span>;
        }
      }
    },
    {
      key: 'total_amount',
      label: 'Total',
      renderCell: (purchase: any) => {
        const amount = purchase?.total_amount || purchase?.total || purchase?.amount || 0;
        const numericAmount = Number(amount);
        
        if (isNaN(numericAmount)) {
          return <span className="font-medium text-danger">Error en monto</span>;
        }
        
        return (
          <span className="font-medium text-primary">
            {formatCurrency(numericAmount)}
          </span>
        );
      }
    }
  ];

  const handleExportReport = () => {
    // Implementar exportación real
    const currentData = selectedTab === 'sales' ? salesData : 
                       selectedTab === 'purchases' ? purchasesData : 
                       productsData;
                       
    if (currentData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    try {
      // Crear CSV básico
      const headers = selectedTab === 'sales' ? ['ID', 'Fecha', 'Cliente', 'Total'] :
                     selectedTab === 'purchases' ? ['ID', 'Fecha', 'Proveedor', 'Total'] :
                     ['Nombre', 'Stock', 'Stock Mínimo', 'Precio', 'Costo'];
      
      const csvContent = [
        headers.join(','),
        ...currentData.map(row => {
          if (selectedTab === 'sales') {
            return [
              row.id || '',
              row.sale_date ? new Date(row.sale_date).toLocaleDateString('es-CO') : '',
              row.customer_name || `Cliente #${row.customer_id}` || '',
              row.total_amount || 0
            ].join(',');
          } else if (selectedTab === 'purchases') {
            return [
              row.id || '',
              row.purchase_date ? new Date(row.purchase_date).toLocaleDateString('es-CO') : '',
              row.supplier_name || `Proveedor #${row.supplier_id}` || '',
              row.total_amount || 0
            ].join(',');
          } else {
            return [
              row.name || '',
              row.stock || 0,
              row.min_stock || 0,
              row.price || 0,
              row.cost || 0
            ].join(',');
          }
        })
      ].join('\n');
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_${selectedTab}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al exportar el reporte');
    }
  };

  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) return '$0';
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Mostrar estado de carga inicial
  if (loading && !salesData?.length && !purchasesData?.length && !productsData?.length) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Reportes" 
          description="Análisis y reportes del negocio"
        />
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner size="lg" />
          <p className="mt-4 text-foreground-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reportes" 
        description="Análisis y reportes del negocio"
      />
      
      {/* Mostrar advertencia si hay errores pero algunos datos se cargaron */}
      {error && ((salesData?.length || 0) > 0 || (purchasesData?.length || 0) > 0 || (productsData?.length || 0) > 0) && (
        <Card className="border border-warning bg-warning-50">
          <CardBody>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:alert-triangle" className="text-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-warning-800">Advertencia</p>
                <p className="text-warning-700 text-sm">
                  Algunos datos no se pudieron cargar completamente. Los reportes pueden estar incompletos.
                  <br />
                  <small>Error: {error}</small>
                </p>
              </div>
              <Button 
                size="sm"
                variant="flat"
                color="warning"
                onPress={refreshData}
                startContent={<Icon icon="lucide:refresh-ccw" />}
              >
                Reintentar
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Mostrar mensaje si no hay datos */}
      {!loading && (!salesData?.length && !purchasesData?.length && !productsData?.length) && (
        <Card className="border border-default">
          <CardBody className="text-center py-12">
            <Icon icon="lucide:database" className="mx-auto mb-4 text-4xl text-foreground-400" />
            <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
            <p className="text-foreground-500 mb-4">
              No se encontraron datos para mostrar en los reportes.
            </p>
            <Button 
              color="primary"
              variant="flat"
              onPress={refreshData}
              startContent={<Icon icon="lucide:refresh-ccw" />}
            >
              Cargar datos
            </Button>
          </CardBody>
        </Card>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs 
          aria-label="Opciones de reportes" 
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab as any}
        >
          <Tab key="sales" title={`Ventas (${salesData?.length || 0})`} />
          <Tab key="inventory" title={`Inventario (${productsData?.length || 0})`} />
          <Tab key="purchases" title={`Compras (${purchasesData?.length || 0})`} />
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
            isDisabled={
              (selectedTab === 'sales' && (!salesData?.length)) ||
              (selectedTab === 'purchases' && (!purchasesData?.length)) ||
              (selectedTab === 'inventory' && (!productsData?.length))
            }
          >
            Exportar
          </Button>
        </div>
      </div>
      
      {selectedTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart 
              data={salesVsPurchasesData || []} 
              title="Ventas vs Compras (Mensual)" 
              loading={loading}
              error={null}
            />
            <Card className="border border-divider">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-semibold text-large">Resumen de Ventas</h4>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-500">Total Ventas</p>
                    <p className="text-2xl font-semibold">{formatCurrency(salesStats?.totalSales || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Número de Ventas</p>
                    <p className="text-2xl font-semibold">{salesStats?.totalCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Venta Promedio</p>
                    <p className="text-2xl font-semibold">{formatCurrency(salesStats?.averageSale || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Ventas Pendientes</p>
                    <p className="text-2xl font-semibold">{salesStats?.pendingCount || 0}</p>
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
                data={salesData || []}
                columns={salesColumns}
                searchable={true}
                isLoading={loading && (!salesData?.length)}
                error={(!salesData?.length) && error ? error : null}
              />
            </CardBody>
          </Card>
        </div>
      )}
      
      {selectedTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryChart 
              data={inventoryData || []} 
              title="Niveles de Inventario" 
              loading={loading}
              error={null}
            />
            <ProductCategoryChart 
              data={productCategoryData || []} 
              title="Productos por Categoría" 
              loading={loading}
              error={null}
            />
          </div>
          
          <Card className="border border-divider">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-semibold text-large">Detalle de Inventario</h4>
            </CardHeader>
            <CardBody>
              <DataTable 
                data={productsData || []}
                columns={productColumns}
                searchable={true}
                isLoading={loading && (!productsData?.length)}
                error={(!productsData?.length) && error ? error : null}
              />
            </CardBody>
          </Card>
        </div>
      )}
      
      {selectedTab === 'purchases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart 
              data={salesVsPurchasesData || []} 
              title="Compras Mensuales" 
              loading={loading}
              error={null}
            />
            <Card className="border border-divider">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-semibold text-large">Resumen de Compras</h4>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-500">Total Compras</p>
                    <p className="text-2xl font-semibold">{formatCurrency(purchasesStats?.totalPurchases || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Número de Compras</p>
                    <p className="text-2xl font-semibold">{purchasesStats?.totalCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Compra Promedio</p>
                    <p className="text-2xl font-semibold">{formatCurrency(purchasesStats?.averagePurchase || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Compras Pendientes</p>
                    <p className="text-2xl font-semibold">{purchasesStats?.pendingCount || 0}</p>
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
                data={purchasesData || []}
                columns={purchaseColumns}
                searchable={true}
                isLoading={loading && (!purchasesData?.length)}
                error={(!purchasesData?.length) && error ? error : null}
              />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};