import React, { useEffect, useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Chip, 
  Card, 
  CardBody, 
  useDisclosure, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Select, 
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Autocomplete,
  AutocompleteItem,
  Divider,
  Switch
} from '@heroui/react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';

// Definición de tipos
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
};

type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type SaleItem = {
  id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type Sale = {
  id: string;
  date: string;
  customer: string;
  customer_id?: string;
  total: number;
  payment: string;
  status: string;
  items?: SaleItem[];
  created_at?: string;
  updated_at?: string;
};

const API_URL = 'http://localhost:8000/api';

export const Sales: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [salesList, setSalesList] = useState<Sale[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [newSale, setNewSale] = useState({
    customer: '',
    customer_id: '',
    payment: 'cash',
    items: [] as SaleItem[]
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar datos en orden correcto
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Cargar clientes primero
        await fetchCustomers();
        
        // 2. Cargar productos
        await fetchProducts();
        
        // 3. Cargar ventas (que ahora usan clientes ya cargados)
        await fetchSales();
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar datos iniciales');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Modificar fetchSales para que use los clientes ya cargados
  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/sales`);
      let salesData = [];

      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        salesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        salesData = response.data.data;
      } else if (response.data && Array.isArray(response.data.sales)) {
        salesData = response.data.sales;
      } else {
        console.warn('Formato de respuesta inesperado:', response.data);
        salesData = [];
      }

      // Formatear ventas con nombres de clientes correctos
      const formattedSales = salesData.map((sale: any) => {
        // Buscar cliente en la lista cargada
        let customerName = 'Cliente desconocido';
        
        if (sale.customer_id) {
          const customer = customersList.find(c => c.id === sale.customer_id.toString());
          customerName = customer ? customer.name : 'Cliente desconocido';
        } else if (sale.customer) {
          customerName = sale.customer;
        } else if (sale.first_name || sale.last_name) {
          customerName = `${sale.first_name || ''} ${sale.last_name || ''}`.trim();
        }

        return {
          id: sale.id.toString,
          date: sale.date || sale.created_at || new Date().toISOString(),
          customer: customerName,
          customer_id: sale.customer_id || '',
          total: parseFloat(sale.total) || 0,
          payment: sale.payment || 'cash',
          status: sale.status || 'completed',
          items: sale.items || [],
          created_at: sale.created_at,
          updated_at: sale.updated_at
        };
      });

      setSalesList(formattedSales);
      setError('');
    } catch (err: any) {
      console.error('Error cargando ventas:', err);
      let errorMessage = 'Error al cargar ventas. ';

      if (err.code === 'ECONNREFUSED') {
        errorMessage += 'No se puede conectar al servidor.';
      } else if (err.response?.status === 500) {
        errorMessage += 'Error interno del servidor.';
      } else if (err.response?.status === 404) {
        errorMessage += 'Endpoint no encontrado.';
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message || 'Error desconocido.';
      }

      setError(errorMessage);
      setSalesList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      let productsData = [];
      
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      }
      
      const formattedProducts = productsData.map((product: any) => ({
        id: product.id.toString(),
        name: product.name || 'Producto sin nombre',
        price: parseFloat(product.price) || 0,
        stock: parseInt(product.stock) || 0,
        category: product.category
      }));
      
      setProductsList(formattedProducts);
    } catch (err: any) {
      console.error('Error cargando productos:', err);
      setProductsList([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customer`);
      let customersData = [];
      
      if (Array.isArray(response.data)) {
        customersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      } else if (response.data && Array.isArray(response.data.customers)) {
        customersData = response.data.customers;
      }
      
      const formattedCustomers = customersData.map((customer: any) => ({
        id: customer.id.toString(),
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Cliente',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      }));
      
      setCustomersList(formattedCustomers);
    } catch (err: any) {
      console.error('Error cargando clientes:', err);
      setCustomersList([]);
    }
  };

  // Actualizar fetchSales cuando customersList cambie
  useEffect(() => {
    if (customersList.length > 0 && salesList.length === 0) {
      fetchSales();
    }
  }, [customersList]);

  const filteredSales = React.useMemo(() => {
    if (selectedTab === 'pending') {
      return salesList.filter(sale => sale.status === 'pending');
    } else if (selectedTab === 'completed') {
      return salesList.filter(sale => sale.status === 'completed');
    } else if (selectedTab === 'cancelled') {
      return salesList.filter(sale => sale.status === 'cancelled');
    }
    return salesList;
  }, [salesList, selectedTab]);

  const handleRowAction = async (action: string, sale: Sale) => {
    try {
      setLoading(true);
      
      if (action === 'delete') {
        if (window.confirm('¿Está seguro de eliminar esta venta?')) {
          await handleDeleteSale(sale.id);
        }
        return;
      }

      // Cargar detalles de venta e items
      const [saleRes, itemsRes] = await Promise.all([
        axios.get(`${API_URL}/sales/${sale.id}`),
        axios.get(`${API_URL}/sale_items/sale/${sale.id}`)
      ]);
      
      const saleDetails = saleRes.data;
      let itemsData = [];
      
      // Manejar diferentes formatos de respuesta para items
      if (Array.isArray(itemsRes.data)) {
        itemsData = itemsRes.data;
      } else if (itemsRes.data && Array.isArray(itemsRes.data.data)) {
        itemsData = itemsRes.data.data;
      } else if (itemsRes.data && Array.isArray(itemsRes.data.items)) {
        itemsData = itemsRes.data.items;
      }
      
      // Mapear items con nombres de productos
      const saleItems = itemsData.map((item: any) => {
        const product = productsList.find(p => p.id === item.product_id.toString());
        return {
          id: item.id?.toString(),
          product_id: item.product_id.toString(),
          product_name: product?.name || item.product_name || 'Producto',
          quantity: item.quantity,
          unit_price: item.unit_price || item.price,
          subtotal: item.subtotal || (item.quantity * (item.unit_price || item.price))
        };
      });
      
      const saleWithItems = {
        ...saleDetails,
        items: saleItems
      };
      
      setSelectedSale(saleWithItems);
      
      // Configurar para edición
      if (action === 'edit') {
        const existingCustomer = customersList.find(
          c => c.id === (saleDetails.customer_id?.toString() || '')
        );
        
        setNewSale({
          customer: existingCustomer ? '' : saleDetails.customer || '',
          customer_id: existingCustomer?.id || '',
          payment: saleDetails.payment || 'cash',
          items: saleItems
        });
        
        setSelectedCustomer(existingCustomer || null);
        setIsNewCustomer(!existingCustomer);
      }
      
      onOpen();
    } catch (err) {
      console.error('Error en acción:', action, err);
      setError(`Error al ${action === 'delete' ? 'eliminar' : 'cargar'} venta`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      // Primero eliminar los items de la venta
      await axios.delete(`${API_URL}/sale_items/sale/${saleId}`);
      // Luego eliminar la venta
      await axios.delete(`${API_URL}/sales/${saleId}`);
      setSalesList(prev => prev.filter(sale => sale.id !== saleId));
      setError('');
    } catch (err: any) {
      console.error('Error eliminando venta:', err);
      setError('Error al eliminar la venta');
    }
  };

  const handleAddSale = () => {
    setSelectedSale(null);
    setNewSale({
      customer: '',
      customer_id: '',
      payment: 'cash',
      items: []
    });
    setSelectedProduct(null);
    setSelectedCustomer(null);
    setIsNewCustomer(false);
    setQuantity(1);
    setError('');
    onOpen();
  };

  const handleCustomerToggle = (isNew: boolean) => {
    setIsNewCustomer(isNew);
    if (isNew) {
      setSelectedCustomer(null);
      setNewSale(prev => ({ ...prev, customer_id: '', customer: '' }));
    } else {
      setNewSale(prev => ({ ...prev, customer: '' }));
    }
  };

  const handleCustomerSelection = (customerId: string | null) => {
    const customer = customersList.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setNewSale(prev => ({ 
      ...prev, 
      customer_id: customerId || '',
    }));
  };

  const handleNewCustomerName = (name: string) => {
    setNewSale(prev => ({ 
      ...prev, 
      customer: name,
      customer_id: ''
    }));
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) {
      setError('Seleccione un producto y cantidad válida');
      return;
    }

    if (quantity > selectedProduct.stock) {
      setError(`Stock insuficiente. Disponible: ${selectedProduct.stock}`);
      return;
    }

    const existingItemIndex = newSale.items.findIndex(item => item.product_id === selectedProduct.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...newSale.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > selectedProduct.stock) {
        setError(`Stock insuficiente. Disponible: ${selectedProduct.stock}`);
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        subtotal: newQuantity * selectedProduct.price
      };
      
      setNewSale(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem: SaleItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: quantity,
        unit_price: selectedProduct.price,
        subtotal: quantity * selectedProduct.price
      };
      
      setNewSale(prev => ({ 
        ...prev, 
        items: [...prev.items, newItem] 
      }));
    }

    setSelectedProduct(null);
    setQuantity(1);
    setError('');
  };

  const handleRemoveProduct = (productId: string) => {
    setNewSale(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product_id !== productId)
    }));
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      setError(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    setNewSale(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unit_price }
          : item
      )
    }));
    setError('');
  };

  const calculateTotal = () => {
    return newSale.items.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSaveSale = async () => {
    try {
      setLoading(true);
      setError('');
      
      const customerName = isNewCustomer ? newSale.customer.trim() : selectedCustomer?.name || '';
      const customerId = isNewCustomer ? null : newSale.customer_id;
      
      if (!customerName) {
        setError('El nombre del cliente es requerido');
        return;
      }
      
      if (newSale.items.length === 0) {
        setError('Debe agregar al menos un producto');
        return;
      }

      const total = calculateTotal();
      const saleData = {
        customer: customerName,
        customer_id: customerId,
        total: total,
        payment: newSale.payment,
        status: 'completed',
        date: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
      };

      let saleResponse;
      if (selectedSale) {
        saleResponse = await axios.put(`${API_URL}/sales/${selectedSale.id}`, saleData);
        // Si es actualización, eliminar items existentes
        await axios.delete(`${API_URL}/sale_items/sale/${selectedSale.id}`);
      } else {
        saleResponse = await axios.post(`${API_URL}/sales`, saleData);
      }
      
      const saleId = selectedSale ? selectedSale.id : saleResponse.data.insertId || saleResponse.data.id;
      
      // Crear los items de la venta uno por uno
      for (const item of newSale.items) {
        const itemData = {
          sale_id: saleId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.unit_price, // Usar 'price' en lugar de 'unit_price' según el modelo
          subtotal: item.subtotal
        };
        
        await axios.post(`${API_URL}/sale_items`, itemData);
      }
      
      // Recargar datos
      await fetchSales();
      if (isNewCustomer) await fetchCustomers();
      
      handleCloseModal();
    } catch (err: any) {
      console.error('Error guardando venta:', err);
      let errorMessage = 'Error al guardar la venta. ';
      
      if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message || 'Error desconocido';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedSale(null);
    setNewSale({
      customer: '',
      customer_id: '',
      payment: 'cash',
      items: []
    });
    setSelectedCustomer(null);
    setIsNewCustomer(false);
    setSelectedProduct(null);
    setQuantity(1);
    setError('');
    onClose();
  };

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/sales/${saleId}/status`, { status: newStatus });
      setSalesList(prev => prev.map(sale => 
        sale.id === saleId ? { ...sale, status: newStatus } : sale
      ));
      setError('');
    } catch (err: any) {
      console.error('Error actualizando estado:', err);
      setError('Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentLabel = (payment: string) => {
    switch (payment) {
      case 'cash': return 'Efectivo';
      case 'credit card': return 'Tarjeta de Crédito';
      case 'transfer': return 'Transferencia';
      default: return payment;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const columns = [
    {
      key: 'id',
      label: '# Venta',
      renderCell: (sale: Sale) => <span className="font-medium">#{sale.id}</span>
    },
    {
      key: 'date',
      label: 'Fecha',
      renderCell: (sale: Sale) => new Date(sale.date).toLocaleDateString('es-MX')
    },
    { key: 'customer', label: 'Cliente' },
    {
      key: 'total',
      label: 'Total',
      renderCell: (sale: Sale) => <span className="font-medium">${sale.total.toFixed(2)}</span>
    },
    {
      key: 'payment',
      label: 'Método Pago',
      renderCell: (sale: Sale) => getPaymentLabel(sale.payment)
    },
    {
      key: 'status',
      label: 'Estado',
      renderCell: (sale: Sale) => (
        <div className="flex items-center gap-2">
          <Chip color={getStatusColor(sale.status)} variant="flat" size="sm">
            {getStatusLabel(sale.status)}
          </Chip>
          {sale.status === 'pending' && (
            <Button
              size="sm"
              color="success"
              variant="light"
              onPress={() => handleStatusChange(sale.id, 'completed')}
            >
              Completar
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Ventas" 
        description="Gestión de ventas y facturación"
        actionLabel="Nueva Venta"
        onAction={handleAddSale}
      />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3" 
            onClick={() => setError('')}
          >
            <Icon icon="mdi:close" />
          </button>
        </div>
      )}
      
      <Tabs 
        aria-label="Opciones de ventas" 
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="all" title="Todas" />
        <Tab key="completed" title="Completadas" />
        <Tab key="pending" title="Pendientes" />
        <Tab key="cancelled" title="Canceladas" />
      </Tabs>
      
      <DataTable 
        data={filteredSales}
        columns={columns}
        onRowAction={handleRowAction}
        searchable
        searchPlaceholder="Buscar ventas..."
        isLoading={loading}
        actions={['view', 'edit', 'delete']}
      />
      
      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseModal}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {selectedSale && newSale.items.length === 0 ? 
              `Detalle de Venta #${selectedSale.id}` : 
              selectedSale ? 
                `Editar Venta #${selectedSale.id}` : 
                'Nueva Venta'
            }
          </ModalHeader>
          <ModalBody>
            {selectedSale && newSale.items.length === 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-foreground-500">Cliente</p>
                    <p className="font-medium">{selectedSale.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Fecha</p>
                    <p className="font-medium">
                      {new Date(selectedSale.date).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Método de Pago</p>
                    <p className="font-medium">{getPaymentLabel(selectedSale.payment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500">Estado</p>
                    <Chip 
                      color={getStatusColor(selectedSale.status)} 
                      variant="flat" 
                      size="sm"
                    >
                      {getStatusLabel(selectedSale.status)}
                    </Chip>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Productos Vendidos</h4>
                  {selectedSale.items && selectedSale.items.length > 0 ? (
                    <Table aria-label="Productos de la venta">
                      <TableHeader>
                        <TableColumn>Producto</TableColumn>
                        <TableColumn>Cantidad</TableColumn>
                        <TableColumn>Precio Unitario</TableColumn>
                        <TableColumn>Subtotal</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {selectedSale.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                            <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-foreground-500">No hay productos registrados para esta venta.</p>
                  )}
                </div>
                
                <Divider />
                
                <div className="text-right">
                  <p className="text-sm text-foreground-500">Total</p>
                  <p className="font-bold text-2xl text-primary">${selectedSale.total.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-4">
                    <Switch
                      isSelected={isNewCustomer}
                      onValueChange={handleCustomerToggle}
                    >
                      Cliente Nuevo
                    </Switch>
                    <span className="text-sm text-foreground-500">
                      {isNewCustomer ? 'Crear cliente nuevo' : 'Seleccionar cliente existente'}
                    </span>
                  </div>
                  
                  {isNewCustomer ? (
                    <Input
                      label="Nombre del Cliente"
                      placeholder="Ingrese el nombre del cliente"
                      value={newSale.customer}
                      onChange={(e) => handleNewCustomerName(e.target.value)}
                      isRequired
                    />
                  ) : (
                    <Autocomplete
                      label="Cliente"
                      placeholder="Seleccione un cliente"
                      selectedKey={selectedCustomer?.id || null}
                      onSelectionChange={handleCustomerSelection}
                      isRequired
                    >
                      {customersList.map((customer) => (
                        <AutocompleteItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}
                  
                  <Select
                    label="Método de Pago"
                    selectedKeys={[newSale.payment]}
                    onSelectionChange={(keys) => {
                      const selectedPayment = Array.from(keys)[0] as string;
                      setNewSale(prev => ({ ...prev, payment: selectedPayment }));
                    }}
                  >
                    <SelectItem key="cash" value="cash">Efectivo</SelectItem>
                    <SelectItem key="credit card" value="credit card">Tarjeta de Crédito</SelectItem>
                    <SelectItem key="transfer" value="transfer">Transferencia</SelectItem>
                  </Select>
                </div>
                
                <Divider />
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Productos</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Autocomplete
                      label="Producto"
                      placeholder="Seleccione un producto"
                      selectedKey={selectedProduct?.id || null}
                      onSelectionChange={(productId) => {
                        const product = productsList.find(p => p.id === productId);
                        setSelectedProduct(product || null);
                      }}
                    >
                      {productsList.map((product) => (
                        <AutocompleteItem key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    
                    <Input
                      type="number"
                      label="Cantidad"
                      value={quantity.toString()}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      max={selectedProduct?.stock || 999}
                    />
                    
                    <Button
                      color="primary"
                      onPress={handleAddProduct}
                      isDisabled={!selectedProduct || quantity <= 0}
                      className="self-end"
                    >
                      Agregar
                    </Button>
                  </div>
                  
                  {selectedProduct && (
                    <Card>
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{selectedProduct.name}</p>
                            <p className="text-sm text-foreground-500">
                              Precio: ${selectedProduct.price.toFixed(2)} | Stock: {selectedProduct.stock}
                            </p>
                          </div>
                          <p className="font-bold">
                            Subtotal: ${(selectedProduct.price * quantity).toFixed(2)}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
                
                {newSale.items.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Productos Agregados</h4>
                      <Table aria-label="Productos en la venta">
                        <TableHeader>
                          <TableColumn>Producto</TableColumn>
                          <TableColumn>Cantidad</TableColumn>
                          <TableColumn>Precio Unit.</TableColumn>
                          <TableColumn>Subtotal</TableColumn>
                          <TableColumn>Acciones</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {newSale.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity.toString()}
                                  onChange={(e) => handleUpdateQuantity(
                                    item.product_id, 
                                    parseInt(e.target.value) || 0
                                  )}
                                  min="1"
                                  size="sm"
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                              <TableCell>${item.subtotal.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  onPress={() => handleRemoveProduct(item.product_id)}
                                >
                                  <Icon icon="mdi:delete" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="mt-4 text-right">
                        <p className="text-sm text-foreground-500">Total de la Venta</p>
                        <p className="font-bold text-2xl text-primary">
                          ${calculateTotal().toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={handleCloseModal}>
              {selectedSale && newSale.items.length === 0 ? 'Cerrar' : 'Cancelar'}
            </Button>
            {selectedSale && newSale.items.length === 0 ? (
              <Button 
                color="primary" 
                onPress={() => {
                  // Activar modo edición
                  const existingCustomer = customersList.find(
                    c => c.id === (selectedSale.customer_id?.toString() || '')
                  );
                  
                  setNewSale({
                    customer: existingCustomer ? '' : selectedSale.customer || '',
                    customer_id: existingCustomer?.id || '',
                    payment: selectedSale.payment || 'cash',
                    items: selectedSale.items || []
                  });
                  
                  setSelectedCustomer(existingCustomer || null);
                  setIsNewCustomer(!existingCustomer);
                }}
              >
                Editar
              </Button>
            ) : (
              <Button 
                color="primary" 
                onPress={handleSaveSale}
                isLoading={loading}
                isDisabled={
                  (!isNewCustomer && !selectedCustomer) || 
                  (isNewCustomer && !newSale.customer.trim()) ||
                  newSale.items.length === 0
                }
              >
                {selectedSale ? 'Actualizar Venta' : 'Guardar Venta'}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};