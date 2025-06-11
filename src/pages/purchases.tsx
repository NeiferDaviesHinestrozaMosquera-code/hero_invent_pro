import React from 'react';
import { Tabs, Tab, Chip, Card, CardBody, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Checkbox } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${API_BASE}/api`;

interface Product {
  id: number;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  cost?: number;
  category_id?: number;
  supplier_id?: number;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface PurchaseItem {
  id: number;
  purchase_id: number;
  product_id: number;
  quantity: number;
  cost: number;           // ✅ Campo real de la BD
  subtotal: number;       // ✅ Campo calculado automáticamente por la BD
  created_at?: string;
  updated_at?: string;
  product_name?: string;
  product_sku?: string;
}

interface PurchaseItemForm {
  product_id: string;
  quantity: string;
  cost: string;           // ✅ Usar 'cost' directamente
  use_product_cost: boolean;
}

type ModalMode = 'create' | 'view' | 'edit';

export const Purchases: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [purchaseItems, setPurchaseItems] = React.useState<PurchaseItem[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('list');
  const [selectedPurchaseItem, setSelectedPurchaseItem] = React.useState<PurchaseItem | null>(null);
  const [modalMode, setModalMode] = React.useState<ModalMode>('create');
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<PurchaseItemForm>({
    product_id: '',
    quantity: '',
    cost: '',              // ✅ Usar 'cost'
    use_product_cost: true
  });

  React.useEffect(() => {
    fetchPurchaseItems();
    fetchProducts();
  }, []);

  // Efecto para establecer automáticamente el costo base cuando se selecciona un producto
  React.useEffect(() => {
    if (formData.product_id && formData.use_product_cost) {
      const selectedProduct = products.find(p => p.id.toString() === formData.product_id);
      if (selectedProduct && selectedProduct.cost) {
        setFormData(prev => ({
          ...prev,
          cost: selectedProduct.cost!.toString()
        }));
      }
    }
  }, [formData.product_id, formData.use_product_cost, products]);

  // Efecto para establecer el costo base automáticamente cuando se selecciona un producto (incluso sin checkbox)
  React.useEffect(() => {
    if (formData.product_id) {
      const selectedProduct = products.find(p => p.id.toString() === formData.product_id);
      if (selectedProduct && selectedProduct.cost && !formData.cost) {
        setFormData(prev => ({
          ...prev,
          cost: selectedProduct.cost!.toString(),
          use_product_cost: true
        }));
      }
    }
  }, [formData.product_id, products]);

  const fetchPurchaseItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/purchase_items`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseItems(data);
      } else {
        console.error('Error fetching purchase items:', response.statusText);
        setError('Error al cargar elementos de compra');
      }
    } catch (error) {
      console.error('Error fetching purchase items:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error fetching products:', response.statusText);
        setError('Error al cargar productos');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error al conectar con el servidor');
    }
  };

  const handleCreatePurchaseItem = async () => {
    if (!formData.product_id || !formData.quantity || !formData.cost) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const cost = parseFloat(formData.cost);
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Por favor ingrese una cantidad válida mayor a 0');
      return;
    }
    
    if (isNaN(cost) || cost < 0) {
      alert('Por favor ingrese un costo unitario válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ✅ DEFINITIVO: Solo campos necesarios, SIN ID
      const requestBody = {
        purchase_id: 1,
        product_id: parseInt(formData.product_id),
        quantity: quantity,
        cost: cost
        // ✅ ABSOLUTAMENTE NO enviar: id, subtotal, total_cost, unit_cost
      };

      console.log('🚀 Enviando request SIN ID:', requestBody);

      const response = await fetch(`${API_BASE_URL}/purchase_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Purchase item creado exitosamente:', responseData);
        
        await fetchPurchaseItems();
        resetForm();
        onClose();
        alert('Elemento de compra registrado exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage = errorData.message || errorData.error || 'No se pudo registrar el elemento de compra';
        setError(`Error al crear: ${errorMessage}`);
        console.error('❌ Error response:', errorData);
      }
    } catch (error) {
      console.error('❌ Error creating purchase item:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePurchaseItem = async () => {
    if (!selectedPurchaseItem || !formData.product_id || !formData.quantity || !formData.cost) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const cost = parseFloat(formData.cost);
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Por favor ingrese una cantidad válida mayor a 0');
      return;
    }
    
    if (isNaN(cost) || cost < 0) {
      alert('Por favor ingrese un costo unitario válido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestBody = {
        purchase_id: selectedPurchaseItem.purchase_id,
        product_id: parseInt(formData.product_id),
        quantity: quantity,
        cost: cost
      };

      const response = await fetch(`${API_BASE_URL}/purchase_items/${selectedPurchaseItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        await fetchPurchaseItems();
        resetForm();
        onClose();
        alert('Elemento de compra actualizado exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage = errorData.message || errorData.error || 'No se pudo actualizar el elemento de compra';
        setError(`Error al actualizar: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating purchase item:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchaseItem = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este elemento de compra?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/purchase_items/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPurchaseItems();
        alert('Elemento de compra eliminado exitosamente');
      } else {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const errorMessage = errorData.message || errorData.error || 'No se pudo eliminar el elemento de compra';
        setError(`Error al eliminar: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting purchase item:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      quantity: '',
      cost: '',
      use_product_cost: true
    });
    setSelectedPurchaseItem(null);
    setModalMode('create');
    setError(null);
  };

  const handleNewPurchaseItem = () => {
    resetForm();
    setModalMode('create');
    onOpen();
  };

  const handleEditPurchaseItem = (item: PurchaseItem) => {
    setSelectedPurchaseItem(item);
    setFormData({
      product_id: item.product_id.toString(),
      quantity: item.quantity.toString(),
      cost: item.cost.toString(),
      use_product_cost: false
    });
    setModalMode('edit');
    onOpen();
  };

  const handleViewPurchaseItem = (item: PurchaseItem) => {
    setSelectedPurchaseItem(item);
    setModalMode('view');
    onOpen();
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create': return 'Crear Nuevo Elemento de Compra';
      case 'edit': return 'Editar Elemento de Compra';
      case 'view': return 'Ver Elemento de Compra';
      default: return 'Elemento de Compra';
    }
  };

  const getModalAction = () => {
    switch (modalMode) {
      case 'create': return handleCreatePurchaseItem;
      case 'edit': return handleUpdatePurchaseItem;
      default: return () => {};
    }
  };

  const getActionButtonText = () => {
    switch (modalMode) {
      case 'create': return 'Crear Elemento';
      case 'edit': return 'Actualizar Elemento';
      default: return 'Acción';
    }
  };

  const handleInputChange = (field: keyof PurchaseItemForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelect = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;
    const selectedProduct = products.find(p => p.id.toString() === selectedKey);
    
    setFormData(prev => ({
      ...prev,
      product_id: selectedKey || '',
      // Establecer automáticamente el costo base si existe
      cost: selectedProduct?.cost ? selectedProduct.cost.toString() : prev.cost,
      use_product_cost: selectedProduct?.cost ? true : prev.use_product_cost
    }));
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPurchaseItems = purchaseItems.length;
  
  // Cálculo del monto total usando 'subtotal'
  const totalAmount = React.useMemo(() => {
    return purchaseItems.reduce((sum, item) => {
      const subtotal = typeof item.subtotal === 'number' ? item.subtotal : parseFloat(item.subtotal?.toString() || '0');
      return sum + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
  }, [purchaseItems]);
  
  const totalQuantity = React.useMemo(() => {
    return purchaseItems.reduce((sum, item) => {
      const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity?.toString() || '0');
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }, [purchaseItems]);

  const averageCost = React.useMemo(() => {
    if (totalQuantity === 0) return 0;
    return totalAmount / totalQuantity;
  }, [totalAmount, totalQuantity]);

  // Cálculo del total del formulario: cantidad × costo
  const formTotal = React.useMemo(() => {
    const quantity = parseInt(formData.quantity) || 0;
    const cost = parseFloat(formData.cost) || 0;
    return quantity * cost;
  }, [formData.quantity, formData.cost]);

  // ✅ Mostrar mensaje de error si existe
  const ErrorMessage = () => {
    if (!error) return null;
    
    return (
      <Card className="mb-4 border-danger">
        <CardBody className="bg-danger-50">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:alert-circle" className="text-danger" />
            <p className="text-danger text-sm">{error}</p>
            <Button
              size="sm"
              variant="light"
              color="danger"
              onClick={() => setError(null)}
              isIconOnly
            >
              <Icon icon="lucide:x" />
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  const columns = [
    {
      key: 'id',
      label: '# Item',
      renderCell: (item: PurchaseItem) => (
        <span className="font-medium">#{item.id}</span>
      )
    },
    {
      key: 'product',
      label: 'Producto',
      renderCell: (item: PurchaseItem) => {
        const product = products.find(p => p.id === item.product_id);
        return (
          <div className="flex flex-col">
            <span className="font-medium">{item.product_name || product?.name || `ID: ${item.product_id}`}</span>
            {(item.product_sku || product?.sku) && (
              <span className="text-xs text-foreground-500">SKU: {item.product_sku || product?.sku}</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'quantity',
      label: 'Cantidad',
      renderCell: (item: PurchaseItem) => (
        <span className="font-medium">{item.quantity} unidades</span>
      )
    },
    {
      key: 'cost',
      label: 'Costo Unitario',
      renderCell: (item: PurchaseItem) => (
        <span className="font-medium">{formatCurrency(item.cost)}</span>
      )
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      renderCell: (item: PurchaseItem) => (
        <span className="font-semibold text-success">{formatCurrency(item.subtotal)}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Fecha',
      renderCell: (item: PurchaseItem) => (
        <span className="text-sm">{item.created_at ? formatDate(item.created_at) : 'N/A'}</span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      renderCell: (item: PurchaseItem) => (
        <Dropdown>
          <DropdownTrigger>
            <Button 
              variant="light" 
              size="sm"
              isIconOnly
            >
              <Icon icon="lucide:more-horizontal" className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem
              key="view"
              startContent={<Icon icon="lucide:eye" className="w-4 h-4" />}
              onClick={() => handleViewPurchaseItem(item)}
            >
              Ver detalles
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<Icon icon="lucide:edit" className="w-4 h-4" />}
              onClick={() => handleEditPurchaseItem(item)}
            >
              Editar
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Icon icon="lucide:trash-2" className="w-4 h-4" />}
              onClick={() => handleDeletePurchaseItem(item.id)}
            >
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )
    }
  ];

  const statsCards = [
    {
      title: 'Total Items',
      value: totalPurchaseItems.toLocaleString(),
      description: 'Elementos registrados',
      icon: 'lucide:package',
      color: 'text-blue-600'
    },
    {
      title: 'Cantidad Total',
      value: totalQuantity.toLocaleString(),
      description: 'Unidades totales',
      icon: 'lucide:layers',
      color: 'text-green-600'
    },
    {
      title: 'Monto Total',
      value: formatCurrency(totalAmount),
      description: 'Valor de inventario',
      icon: 'lucide:dollar-sign',
      color: 'text-purple-600'
    },
    {
      title: 'Costo Promedio',
      value: formatCurrency(averageCost),
      description: 'Por unidad',
      icon: 'lucide:trending-up',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Gestión de Compras" 
        subtitle="Administra los elementos de compra y el inventario"
      />

      {/* ✅ Componente de error */}
      <ErrorMessage />

      <div className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardBody className="flex flex-row items-center space-x-3">
                <div className={`p-2 rounded-lg bg-background ${stat.color}`}>
                  <Icon icon={stat.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-foreground-400">{stat.description}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Contenido principal */}
        <Card>
          <CardBody>
            <Tabs 
              selectedKey={selectedTab} 
              onSelectionChange={(key) => setSelectedTab(String(key))}
              className="w-full"
            >
              <Tab key="list" title="Lista de Elementos">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Elementos de Compra</h3>
                    <Button
                      color="primary"
                      startContent={<Icon icon="lucide:plus" />}
                      onPress={handleNewPurchaseItem}
                      isDisabled={loading}
                    >
                      Nuevo Elemento
                    </Button>
                  </div>

                  <DataTable
                    data={purchaseItems}
                    columns={columns}
                    loading={loading}
                    emptyContent="No hay elementos de compra registrados"
                  />
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>

      {/* Modal para crear/editar/ver elementos */}
      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseModal}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {getModalTitle()}
          </ModalHeader>
          <ModalBody>
            {modalMode === 'view' && selectedPurchaseItem ? (
              // Vista de solo lectura
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-500">ID del Elemento</p>
                    <p className="font-medium">#{selectedPurchaseItem.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Producto</p>
                    <p className="font-medium">{selectedPurchaseItem.product_name || `ID: ${selectedPurchaseItem.product_id}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Cantidad</p>
                    <p className="font-medium">{selectedPurchaseItem.quantity} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Costo Unitario</p>
                    <p className="font-medium">{formatCurrency(selectedPurchaseItem.cost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Subtotal</p>
                    <p className="font-medium text-success">{formatCurrency(selectedPurchaseItem.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Fecha de Creación</p>
                    <p className="font-medium">{selectedPurchaseItem.created_at ? formatDate(selectedPurchaseItem.created_at) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Formulario para crear/editar
              <div className="space-y-4">
                <Select
                  label="Producto"
                  placeholder="Selecciona un producto"
                  selectedKeys={formData.product_id ? [formData.product_id] : []}
                  onSelectionChange={handleProductSelect}
                  isRequired
                  isDisabled={loading}
                >
                  {products.map((product) => (
                    <SelectItem 
                      key={product.id.toString()} 
                      value={product.id.toString()}
                      textValue={`${product.name} ${product.sku ? `(${product.sku})` : ''} - ${formatCurrency(product.price)}`}
                    >
                      {product.name} {product.sku ? `(${product.sku})` : ''} - {formatCurrency(product.price)}
                    </SelectItem>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Cantidad"
                    placeholder="Ingrese la cantidad"
                    value={formData.quantity}
                    onValueChange={(value) => handleInputChange('quantity', value)}
                    min="1"
                    isRequired
                    isDisabled={loading}
                  />

                  <Input
                    type="number"
                    label="Costo Unitario"
                    placeholder="Ingrese el costo unitario"
                    value={formData.cost}
                    onValueChange={(value) => handleInputChange('cost', value)}
                    min="0"
                    step="0.01"
                    isRequired
                    isDisabled={loading}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                  />
                </div>

                {formData.product_id && (
                  <Checkbox
                    isSelected={formData.use_product_cost}
                    onValueChange={(value) => handleInputChange('use_product_cost', value)}
                    isDisabled={loading}
                  >
                    Usar costo base del producto
                  </Checkbox>
                )}

                {/* Mostrar total calculado */}
                {formData.quantity && formData.cost && (
                  <Card>
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <span className="text-foreground-500">Total calculado:</span>
                        <span className="text-lg font-bold text-success">
                          {formatCurrency(formTotal)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={handleCloseModal}
              isDisabled={loading}
            >
              Cancelar
            </Button>
            {modalMode !== 'view' && (
              <Button 
                color="primary" 
                onPress={getModalAction()}
                isDisabled={loading}
                isLoading={loading}
              >
                {getActionButtonText()}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};


export default Purchases;
