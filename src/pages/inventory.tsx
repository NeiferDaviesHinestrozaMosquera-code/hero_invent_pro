import React from 'react';
import { Tabs, Tab, Chip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';

// Tipos de datos actualizados según la estructura de la BD
interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min_stock: number;
  image?: string;
  price: number;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  barcode?: string;
  cost?: number;
  is_active?: boolean;
}

interface StockAdjustment {
  product_id: string;
  quantity: number;
  cost?: number;
  price?: number;
  reason?: string;
}

// API base URL - ajusta según tu configuración
const API_BASE_URL = 'http://localhost:8000/api';

export const Inventory: React.FC = () => {
  // Estados para modales
  const { isOpen: isAdjustOpen, onOpen: onAdjustOpen, onClose: onAdjustClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Estados principales
  const [productList, setProductList] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [selectedTab, setSelectedTab] = React.useState('all');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Estados para ajuste de stock
  const [adjustmentType, setAdjustmentType] = React.useState<'add' | 'subtract'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = React.useState('');
  const [adjustmentReason, setAdjustmentReason] = React.useState('');

  // Estados para edición de producto
  const [editForm, setEditForm] = React.useState<Partial<Product>>({});
  const [editLoading, setEditLoading] = React.useState(false);

  // Cargar productos desde la API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await response.json();
      
      const products = Array.isArray(data) ? data : data.products || data.data || [];
      setProductList(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al eliminar el producto');
      }

      // Actualizar la lista de productos
      await fetchProducts();
      onDeleteClose();
      setSelectedProduct(null);
      alert('Producto eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const updateProduct = async () => {
    if (!selectedProduct || !editForm) return;

    try {
      setEditLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al actualizar el producto');
      }

      // Actualizar la lista de productos
      await fetchProducts();
      onEditClose();
      setSelectedProduct(null);
      setEditForm({});
      alert('Producto actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Cargar productos al montar el componente
  React.useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrar productos según la pestaña seleccionada
  const filteredProducts = React.useMemo(() => {
    if (selectedTab === 'low') {
      return productList.filter(product => product.stock <= product.min_stock);
    }
    return productList;
  }, [productList, selectedTab]);

  // Manejar acciones de fila
  const handleRowAction = (action: string, product: Product) => {
    console.log('Action:', action, 'Product:', product);
    setSelectedProduct(product);
    
    if (action === 'view') {
      onViewOpen();
    } else if (action === 'adjust') {
      setAdjustmentType('add');
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      onAdjustOpen();
    } else if (action === 'edit') {
      setEditForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        min_stock: product.min_stock,
        description: product.description,
        barcode: product.barcode,
        is_active: product.is_active
      });
      onEditOpen();
    } else if (action === 'delete') {
      onDeleteOpen();
    }
  };

  // Ajustar stock usando la API de productos
  const handleAdjustStock = async () => {
    if (!selectedProduct) return;

    const quantity = parseInt(adjustmentQuantity);
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      alert('Por favor ingrese una cantidad válida');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newStock = adjustmentType === 'add' 
        ? selectedProduct.stock + quantity 
        : selectedProduct.stock - quantity;

      if (newStock < 0) {
        alert('El stock no puede ser negativo');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: newStock,
          adjustment_type: adjustmentType,
          adjustment_quantity: quantity,
          reason: adjustmentReason || 'Ajuste de inventario'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error al ajustar el stock');
      }

      await fetchProducts();
      onAdjustClose();
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      setSelectedProduct(null);
      
      alert(`Stock ${adjustmentType === 'add' ? 'agregado' : 'reducido'} exitosamente`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'name',
      label: 'Producto',
      renderCell: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md overflow-hidden">
            <img 
              src={product.image || 'https://img.heroui.chat/image/ai?w=40&h=40&u=product'} 
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://img.heroui.chat/image/ai?w=40&h=40&u=product';
              }}
            />
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-foreground-500">SKU: {product.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock Actual',
      renderCell: (product: Product) => {
        const isLowStock = product.stock <= product.min_stock;
        return (
          <Chip 
            color={isLowStock ? "danger" : "success"} 
            variant="flat" 
            size="sm"
          >
            {product.stock} unidades
          </Chip>
        );
      }
    },
    {
      key: 'min_stock',
      label: 'Stock Mínimo',
      renderCell: (product: Product) => (
        <span>{product.min_stock} unidades</span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      renderCell: (product: Product) => {
        const isLowStock = product.stock <= product.min_stock;
        return (
          <div className="flex items-center">
            {isLowStock ? (
              <>
                <Icon icon="lucide:alert-triangle" className="text-warning mr-1" />
                <span className="text-warning">Bajo stock</span>
              </>
            ) : (
              <>
                <Icon icon="lucide:check-circle" className="text-success mr-1" />
                <span className="text-success">Óptimo</span>
              </>
            )}
          </div>
        );
      }
    },
    {
      key: 'price',
      label: 'Precio',
      renderCell: (product: Product) => (
        <span>${product.price?.toLocaleString() || '0'}</span>
      )
    }
  ];

  // Configuración de acciones para la tabla
  const tableActions = [
    {
      key: 'view',
      label: 'Ver Detalles',
      icon: 'lucide:eye',
      color: 'secondary' as const
    },
    {
      key: 'adjust',
      label: 'Ajustar Stock',
      icon: 'lucide:package-plus',
      color: 'primary' as const
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: 'lucide:edit',
      color: 'default' as const
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: 'lucide:trash-2',
      color: 'danger' as const
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventario" 
        description="Control de inventario y gestión de stock"
      />
      
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <Icon icon="lucide:alert-circle" className="mr-2" />
            {error}
          </div>
        </div>
      )}
      
      <Tabs 
        aria-label="Opciones de inventario" 
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab as any}
      >
        <Tab key="all" title="Todos los productos" />
        <Tab key="low" title={
          <div className="flex items-center gap-1">
            <Icon icon="lucide:alert-triangle" className="text-warning" />
            <span>Bajo stock</span>
            {filteredProducts.length > 0 && selectedTab === 'low' && (
              <Chip color="warning" size="sm" variant="flat">
                {productList.filter(p => p.stock <= p.min_stock).length}
              </Chip>
            )}
          </div>
        } />
      </Tabs>
      
      <DataTable 
        data={filteredProducts}
        columns={columns}
        onRowAction={handleRowAction}
        actions={tableActions}
        searchable
        searchPlaceholder="Buscar productos..."
        loading={loading}
        emptyMessage={
          selectedTab === 'low' 
            ? "No hay productos con stock bajo" 
            : "No hay productos disponibles"
        }
      />
      
      {/* Modal Ver Producto */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Detalles del Producto</h3>
                <p className="text-sm text-foreground-500">
                  Información completa del producto seleccionado
                </p>
              </ModalHeader>
              <ModalBody>
                {selectedProduct && (
                  <div className="space-y-6">
                    {/* Imagen y información básica */}
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={selectedProduct.image || 'https://img.heroui.chat/image/ai?w=96&h=96&u=product'} 
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://img.heroui.chat/image/ai?w=96&h=96&u=product';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold">{selectedProduct.name}</h4>
                        <p className="text-foreground-500 mb-2">SKU: {selectedProduct.sku}</p>
                        <div className="flex gap-2">
                          <Chip 
                            color={selectedProduct.stock <= selectedProduct.min_stock ? "danger" : "success"} 
                            variant="flat"
                          >
                            Stock: {selectedProduct.stock} unidades
                          </Chip>
                          <Chip 
                            color={selectedProduct.is_active ? "success" : "danger"} 
                            variant="flat"
                          >
                            {selectedProduct.is_active ? "Activo" : "Inactivo"}
                          </Chip>
                        </div>
                      </div>
                    </div>

                    {/* Información detallada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-foreground-600">Precio de Venta</label>
                          <p className="text-lg font-bold text-success">${selectedProduct.price?.toLocaleString() || '0'}</p>
                        </div>
                        
                        {selectedProduct.cost && (
                          <div>
                            <label className="text-sm font-medium text-foreground-600">Costo</label>
                            <p className="text-lg">${selectedProduct.cost.toLocaleString()}</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="text-sm font-medium text-foreground-600">Stock Mínimo</label>
                          <p className="text-lg">{selectedProduct.min_stock} unidades</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedProduct.barcode && (
                          <div>
                            <label className="text-sm font-medium text-foreground-600">Código de Barras</label>
                            <p className="text-lg font-mono">{selectedProduct.barcode}</p>
                          </div>
                        )}
                        
                        {selectedProduct.category_id && (
                          <div>
                            <label className="text-sm font-medium text-foreground-600">ID Categoría</label>
                            <p className="text-lg">{selectedProduct.category_id}</p>
                          </div>
                        )}
                        
                        {selectedProduct.supplier_id && (
                          <div>
                            <label className="text-sm font-medium text-foreground-600">ID Proveedor</label>
                            <p className="text-lg">{selectedProduct.supplier_id}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    {selectedProduct.description && (
                      <div>
                        <label className="text-sm font-medium text-foreground-600">Descripción</label>
                        <p className="text-foreground-800 mt-1 p-3 bg-default-100 rounded-lg">
                          {selectedProduct.description}
                        </p>
                      </div>
                    )}

                    {/* Alertas de stock */}
                    {selectedProduct.stock <= selectedProduct.min_stock && (
                      <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                          <Icon icon="lucide:alert-triangle" className="mr-2" />
                          <span className="font-medium">¡Stock bajo!</span>
                          <span className="ml-2">
                            El producto tiene {selectedProduct.stock} unidades, por debajo del mínimo de {selectedProduct.min_stock}.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cerrar
                </Button>
                <Button 
                  color="primary" 
                  onPress={() => {
                    onClose();
                    handleRowAction('edit', selectedProduct!);
                  }}
                >
                  <Icon icon="lucide:edit" className="mr-1" />
                  Editar Producto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Editar Producto</h3>
                <p className="text-sm text-foreground-500">
                  Modifique la información del producto
                </p>
              </ModalHeader>
              <ModalBody>
                {selectedProduct && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre del Producto"
                        placeholder="Ingrese el nombre"
                        value={editForm.name || ''}
                        onValueChange={(value) => setEditForm(prev => ({...prev, name: value}))}
                        startContent={<Icon icon="lucide:package" className="text-default-400" />}
                      />
                      
                      <Input
                        label="SKU"
                        placeholder="Código único del producto"
                        value={editForm.sku || ''}
                        onValueChange={(value) => setEditForm(prev => ({...prev, sku: value}))}
                        startContent={<Icon icon="lucide:hash" className="text-default-400" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Precio de Venta"
                        placeholder="0.00"
                        value={editForm.price?.toString() || ''}
                        onValueChange={(value) => setEditForm(prev => ({...prev, price: parseFloat(value) || 0}))}
                        startContent={<Icon icon="lucide:dollar-sign" className="text-default-400" />}
                      />
                      
                      <Input
                        type="number"
                        label="Costo"
                        placeholder="0.00"
                        value={editForm.cost?.toString() || ''}
                        onValueChange={(value) => setEditForm(prev => ({...prev, cost: parseFloat(value) || 0}))}
                        startContent={<Icon icon="lucide:credit-card" className="text-default-400" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Stock Mínimo"
                        placeholder="0"
                        value={editForm.min_stock?.toString() || ''}
                        onValueChange={(value) => setEditForm(prev => ({...prev, min_stock: parseInt(value) || 0}))}
                        startContent={<Icon icon="lucide:alert-triangle" className="text-default-400" />}
                      />
                      
                      <Input
                        label="Código de Barras"
                        placeholder="Código de barras (opcional)"
                        value={editForm.barcode || ''}
                        onValueChange={(value) => setEditForm(prev => ({...prev, barcode: value}))}
                        startContent={<Icon icon="lucide:scan" className="text-default-400" />}
                      />
                    </div>

                    <Textarea
                      label="Descripción"
                      placeholder="Descripción del producto (opcional)"
                      value={editForm.description || ''}
                      onValueChange={(value) => setEditForm(prev => ({...prev, description: value}))}
                      minRows={3}
                    />

                    <Select
                      label="Estado"
                      placeholder="Seleccione el estado"
                      selectedKeys={editForm.is_active ? ['active'] : ['inactive']}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] === 'active';
                        setEditForm(prev => ({...prev, is_active: value}));
                      }}
                    >
                      <SelectItem key="active" value="active">Activo</SelectItem>
                      <SelectItem key="inactive" value="inactive">Inactivo</SelectItem>
                    </Select>

                    <div className="bg-default-50 border border-default-200 px-4 py-3 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-foreground-600">Stock actual:</span>
                        <span className="font-medium">{selectedProduct.stock} unidades</span>
                      </div>
                      <p className="text-xs text-foreground-500 mt-1">
                        Para modificar el stock, use la opción "Ajustar Stock"
                      </p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} disabled={editLoading}>
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  onPress={updateProduct}
                  isLoading={editLoading}
                  disabled={!editForm.name || !editForm.sku || !editForm.price}
                >
                  <Icon icon="lucide:save" className="mr-1" />
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-danger">Confirmar Eliminación</h3>
                <p className="text-sm text-foreground-500">
                  Esta acción no se puede deshacer
                </p>
              </ModalHeader>
              <ModalBody>
                {selectedProduct && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                      <Icon icon="lucide:alert-triangle" className="text-danger text-2xl" />
                      <div>
                        <p className="font-medium text-danger">
                          ¿Está seguro que desea eliminar este producto?
                        </p>
                        <p className="text-sm text-foreground-600">
                          Se eliminará permanentemente el producto "{selectedProduct.name}" con SKU "{selectedProduct.sku}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-default-100 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden">
                          <img 
                            src={selectedProduct.image || 'https://img.heroui.chat/image/ai?w=48&h=48&u=product'} 
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://img.heroui.chat/image/ai?w=48&h=48&u=product';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{selectedProduct.name}</p>
                          <p className="text-sm text-foreground-500">SKU: {selectedProduct.sku}</p>
                          <p className="text-sm text-foreground-500">Stock actual: {selectedProduct.stock} unidades</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button 
                  color="danger" 
                  onPress={deleteProduct}
                  isLoading={loading}
                >
                  <Icon icon="lucide:trash-2" className="mr-1" />
                  Eliminar Producto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Ajustar Stock */}
      <Modal isOpen={isAdjustOpen} onClose={onAdjustClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3>Ajustar Inventario</h3>
                <p className="text-sm text-foreground-500">
                  Realizar ajuste de stock para el producto seleccionado
                </p>
              </ModalHeader>
              <ModalBody>
                {selectedProduct && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-default-100 rounded-lg">
                      <div>
                        <p className="font-medium">{selectedProduct.name}</p>
                        <p className="text-sm text-foreground-500">SKU: {selectedProduct.sku}</p>
                      </div>
                      <Chip color="primary" variant="flat">
                        Stock actual: {selectedProduct.stock}
                      </Chip>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        color={adjustmentType === 'add' ? 'success' : 'default'} 
                        variant={adjustmentType === 'add' ? 'solid' : 'bordered'}
                        onPress={() => setAdjustmentType('add')}
                        className="flex-1"
                      >
                        <Icon icon="lucide:plus" className="mr-1" />
                        Agregar Stock
                      </Button>
                      <Button 
                        color={adjustmentType === 'subtract' ? 'danger' : 'default'} 
                        variant={adjustmentType === 'subtract' ? 'solid' : 'bordered'}
                        onPress={() => setAdjustmentType('subtract')}
                        className="flex-1"
                      >
                        <Icon icon="lucide:minus" className="mr-1" />
                        Reducir Stock
                      </Button>
                    </div>
                    
                    <Input
                      type="number"
                      label="Cantidad"
                      placeholder="Ingrese la cantidad"
                      value={adjustmentQuantity}
                      onValueChange={setAdjustmentQuantity}
                      min="1"
                      startContent={
                        <Icon 
                          icon={adjustmentType === 'add' ? 'lucide:plus' : 'lucide:minus'} 
                          className={adjustmentType === 'add' ? 'text-success' : 'text-danger'}
                        />
                      }
                    />
                    
                  <Textarea
                      label="Motivo del Ajuste"
                      placeholder="Descripción del motivo (opcional)"
                      value={adjustmentReason}
                      onValueChange={setAdjustmentReason}
                      minRows={2}
                      maxRows={4}
                      startContent={<Icon icon="lucide:file-text" className="text-default-400" />}
                      description="Ingrese una descripción detallada del motivo del ajuste de inventario"
                    />

                    {adjustmentType === 'subtract' && 
                     selectedProduct &&
                     adjustmentQuantity &&
                     selectedProduct.stock < parseInt(adjustmentQuantity) && (
                      <div className="bg-danger-50 border border-danger-200 text-danger-700 px-3 py-2 rounded text-sm">
                        <div className="flex items-start gap-2">
                          <Icon icon="lucide:alert-triangle" className="mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Stock insuficiente</p>
                            <p>La cantidad a reducir ({adjustmentQuantity}) es mayor al stock actual ({selectedProduct.stock} unidades)</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {adjustmentQuantity && !isNaN(parseInt(adjustmentQuantity)) && parseInt(adjustmentQuantity) > 0 && (
                      <div className="bg-default-50 border border-default-200 px-4 py-3 rounded-lg">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground-600">Stock actual:</span>
                            <span className="font-medium">{selectedProduct?.stock} unidades</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground-600">
                              {adjustmentType === 'add' ? 'Cantidad a agregar:' : 'Cantidad a reducir:'}
                            </span>
                            <span className={`font-medium ${adjustmentType === 'add' ? 'text-success' : 'text-danger'}`}>
                              {adjustmentType === 'add' ? '+' : '-'}{adjustmentQuantity} unidades
                            </span>
                          </div>
                          <hr className="border-default-200" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Stock resultante:</span>
                            <span className="font-bold text-lg">
                              {selectedProduct && adjustmentType === 'add' 
                                ? selectedProduct.stock + parseInt(adjustmentQuantity)
                                : selectedProduct && selectedProduct.stock - parseInt(adjustmentQuantity)
                              } unidades
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Historial de ajustes previos (opcional) */}
                    {selectedProduct && (
                      <div className="border-t border-default-200 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon icon="lucide:history" className="text-default-400" />
                          <span className="text-sm font-medium text-foreground-600">Información del producto</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-foreground-500">Stock mínimo:</p>
                            <p className="font-medium">{selectedProduct.min_stock} unidades</p>
                          </div>
                          <div>
                            <p className="text-foreground-500">Precio:</p>
                            <p className="font-medium">${selectedProduct.price?.toLocaleString() || '0'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={onClose} 
                  disabled={loading}
                  startContent={<Icon icon="lucide:x" />}
                >
                  Cancelar
                </Button>
                <Button 
                  color={adjustmentType === 'add' ? 'success' : 'danger'} 
                  onPress={handleAdjustStock}
                  isLoading={loading}
                  disabled={
                    !adjustmentQuantity || 
                    parseInt(adjustmentQuantity) <= 0 ||
                    isNaN(parseInt(adjustmentQuantity)) ||
                    (adjustmentType === 'subtract' && selectedProduct && selectedProduct.stock < parseInt(adjustmentQuantity))
                  }
                  startContent={
                    !loading && (
                      <Icon icon={adjustmentType === 'add' ? 'lucide:package-plus' : 'lucide:package-minus'} />
                    )
                  }
                >
                  {loading 
                    ? 'Procesando...' 
                    : adjustmentType === 'add' 
                      ? 'Agregar al inventario' 
                      : 'Reducir del inventario'
                  }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};