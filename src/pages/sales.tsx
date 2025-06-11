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
  id: string;
  sale_id: string;
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api`;

// Funciones helper para manejar conversión segura de tipos
const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const formatCurrency = (value: any): string => {
  const numValue = toNumber(value);
  return numValue.toFixed(2);
};

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
        console.log('Iniciando carga de datos...');

        // 1. Cargar clientes primero
        console.log('Cargando clientes...');
        const customers = await fetchCustomers();
        setCustomersList(customers);
        console.log('Clientes cargados:', customers.length);

        // 2. Cargar productos
        console.log('Cargando productos...');
        const products = await fetchProducts();
        setProductsList(products);
        console.log('Productos cargados:', products.length);

        // 3. Cargar ventas con clientes disponibles
        console.log('Cargando ventas...');
        const sales = await fetchSales(customers);
        setSalesList(sales);
        console.log('Ventas cargadas:', sales.length);

      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar datos iniciales: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchSales = async (customers: Customer[]) => {
    try {
      console.log('Fetching sales from:', `${API_URL}/sales`);
      const response = await axios.get(`${API_URL}/sales`);
      console.log('Sales response:', response.data);

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

      console.log('Sales data extracted:', salesData);

      // Formatear ventas con información completa del cliente y total correcto
      const formattedSales = salesData.map((sale: any) => {
        // ✅ Determinar nombre del cliente usando múltiples fuentes
        let customerName = 'Cliente desconocido';
        const customerId = sale.customer_id?.toString() || '';

        if (sale.customer) {
          // Si ya viene el nombre formateado del backend
          customerName = sale.customer;
        } else if (sale.customer_info && (sale.customer_info.first_name || sale.customer_info.last_name)) {
          // Si viene la información del cliente separada
          customerName = `${sale.customer_info.first_name || ''} ${sale.customer_info.last_name || ''}`.trim();
        } else if (sale.first_name || sale.last_name) {
          // Si viene directamente en el objeto sale
          customerName = `${sale.first_name || ''} ${sale.last_name || ''}`.trim();
        } else if (customerId) {
          // Buscar en la lista de clientes cargada
          const customer = customers.find(c => c.id === customerId);
          customerName = customer ? customer.name : `Cliente ID: ${customerId}`;
        }

        // ✅ Total: usar el que viene del backend (ya calculado correctamente)
        const total = toNumber(sale.total);

        return {
          id: sale.id, // ✅ ID de base de datos
          date: sale.date || sale.created_at || new Date().toISOString(),
          customer: customerName, // ✅ Nombre completo del cliente
          customer_id: customerId,
          total: total, // ✅ Total correcto
          payment: sale.payment || 'cash',
          status: sale.status || 'completed',
          items: sale.items || [],
          created_at: sale.created_at,
          updated_at: sale.updated_at,
          customer_info: sale.customer_info // ✅ Información adicional del cliente
        };
      });

      console.log('Formatted sales:', formattedSales);
      return formattedSales;

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

      console.error('Sales fetch error:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const fetchProducts = async () => {
    try {
      console.log('Fetching products from:', `${API_URL}/products`);
      const response = await axios.get(`${API_URL}/products`);
      console.log('Products response:', response.data);

      let productsData = [];

      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      }

      const formattedProducts = productsData.map((product: any) => ({
        id: product.id ? product.id.toString() : 'temp-' + Date.now(),
        name: product.name || 'Producto sin nombre',
        price: toNumber(product.price),
        stock: parseInt(product.stock) || 0,
        category: product.category
      }));

      console.log('Formatted products:', formattedProducts);
      return formattedProducts;
    } catch (err: any) {
      console.error('Error cargando productos:', err);
      return [];
    }
  };

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers...');
      // Intentar diferentes endpoints posibles para clientes
      let response;
      try {
        response = await axios.get(`${API_URL}/customers`);
      } catch (e) {
        try {
          response = await axios.get(`${API_URL}/customer`);
        } catch (e2) {
          // Si no hay endpoint de clientes, crear lista vacía
          console.warn('No se encontró endpoint de clientes, usando lista vacía');
          return [];
        }
      }

      console.log('Customers response:', response.data);
      let customersData = [];

      if (Array.isArray(response.data)) {
        customersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      } else if (response.data && Array.isArray(response.data.customers)) {
        customersData = response.data.customers;
      }

      const formattedCustomers = customersData.map((customer: any) => ({
        id: customer.id ? customer.id.toString() : 'temp-' + Date.now(),
        name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() ||
          customer.name || 'Cliente',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || ''
      }));

      console.log('Formatted customers:', formattedCustomers);
      return formattedCustomers;
    } catch (err: any) {
      console.error('Error cargando clientes:', err);
      return [];
    }
  };

  const filteredSales = React.useMemo(() => {
    console.log('Filtering sales. SalesList:', salesList, 'SelectedTab:', selectedTab);

    if (!Array.isArray(salesList)) {
      console.warn('SalesList is not an array:', salesList);
      return [];
    }

    if (selectedTab === 'pending') {
      return salesList.filter(sale => sale.status === 'pending');
    } else if (selectedTab === 'completed') {
      return salesList.filter(sale => sale.status === 'completed');
    } else if (selectedTab === 'cancelled') {
      return salesList.filter(sale => sale.status === 'cancelled');
    }

    console.log('Returning all sales:', salesList);
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

      // Cargar detalles de venta
      const saleRes = await axios.get(`${API_URL}/sales/${sale.id}`);
      const saleDetails = saleRes.data;

      // Cargar items de la venta
      let itemsData = [];
      try {
        const itemsRes = await axios.get(`${API_URL}/sale_items/sale/${sale.id}`);
        if (Array.isArray(itemsRes.data)) {
          itemsData = itemsRes.data;
        } else if (itemsRes.data && Array.isArray(itemsRes.data.data)) {
          itemsData = itemsRes.data.data;
        } else if (itemsRes.data && Array.isArray(itemsRes.data.items)) {
          itemsData = itemsRes.data.items;
        }
      } catch (e) {
        console.warn('No se pudieron cargar los items de la venta:', e);
      }

      // Mapear items con nombres de productos
      const saleItems = itemsData.map((item: any) => {
        const product = productsList.find(p => p.id === (item.product_id ? item.product_id.toString() : ''));
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.unit_price || item.price);
        return {
          //id: item.id ? item.id.toString() : 'temp-' + Date.now(),
          sale_id: sale.id,
          product_id: item.product_id ? item.product_id.toString() : '',
          product_name: product?.name || item.product_name || 'Producto',
          quantity: quantity,
          unit_price: unitPrice,
          subtotal: toNumber(item.subtotal) || (quantity * unitPrice)
        };
      });

      const saleWithItems = {
        ...saleDetails,
        id: saleDetails.id ? saleDetails.id.toString() : sale.id,
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
      await axios.delete(`${API_URL}/sales/${saleId}`);
      setSalesList(prev => prev.filter(sale => sale.id !== saleId));
      setError('');
    } catch (err: any) {
      console.error('Error eliminando venta:', err);
      setError('Error al eliminar la venta: ' + (err.response?.data?.message || err.message));
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
    setIsNewCustomer(customersList.length === 0);
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
        subtotal: newQuantity * toNumber(selectedProduct.price)
      };

      setNewSale(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem: SaleItem = {
        id: '', // ✅ ID se asignará automáticamente por la base de datos
        sale_id: '', // ✅ Se asignará cuando se cree la venta
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: quantity,
        unit_price: toNumber(selectedProduct.price),
        subtotal: quantity * toNumber(selectedProduct.price)
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
    return newSale.items.reduce((total, item) => total + toNumber(item.subtotal), 0);
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
        date: new Date().toISOString().split('T')[0],
        items: newSale.items
      };

      let saleResponse;
      if (selectedSale) {
        saleResponse = await axios.put(`${API_URL}/sales/${selectedSale.id}`, saleData);
      } else {
        saleResponse = await axios.post(`${API_URL}/sales`, saleData);
      }

      // Recargar datos
      const customers = await fetchCustomers();
      setCustomersList(customers);
      const sales = await fetchSales(customers);
      setSalesList(sales);

      // Recargar productos para reflejar el stock actualizado
      const products = await fetchProducts();
      setProductsList(products);

      handleCloseModal();
    } catch (err: any) {
      console.error('Error guardando venta:', err.response?.data || err.message);
      setError('Error al guardar la venta: ' + (err.response?.data?.message || err.message));
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
      setError('Error al actualizar estado: ' + (err.response?.data?.message || err.message));
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
      label: '#ID',
      renderCell: (sale: Sale) => <span className="font-medium">#{sale.id}</span>
    },
    {
      key: 'date',
      label: 'Fecha',
      renderCell: (sale: Sale) => new Date(sale.date).toLocaleDateString('es-CO')
    },
    { key: 'customer', label: 'Cliente' },
    {
      key: 'total',
      label: 'Total',
      renderCell: (sale: Sale) => <span className="font-medium">${formatCurrency(sale.total)}</span>
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

  // Debug information
  console.log('Component render - Loading:', loading, 'Error:', error, 'FilteredSales:', filteredSales);

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
  `Total de Venta: $${formatCurrency(selectedSale.total)}` : 
  selectedSale ? 
    `Editar Venta: $${formatCurrency(selectedSale.total)}` : 
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
                      {new Date(selectedSale.date).toLocaleDateString('es-CO')}
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
                        {selectedSale.items.map((item) => (
                          <TableRow key={`${item.product_id}-${item.sale_id}`}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${formatCurrency(item.unit_price)}</TableCell>
                            <TableCell>${formatCurrency(item.subtotal)}</TableCell>
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
                  <p className="font-bold text-2xl text-primary">${formatCurrency(selectedSale.total)}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {customersList.length > 0 && (
                    <div className="flex items-center gap-4">
                      <Switch
                        isSelected={isNewCustomer}
                        onValueChange={handleCustomerToggle}
                      >
                        Cliente Nuevo
                      </Switch>
                      <span className="text-sm text-foreground-500">
                        {isNewCustomer ? 'Ingrese nombre del cliente' : 'Seleccione cliente existente'}
                      </span>
                    </div>
                  )}

                  {isNewCustomer ? (
                    <Input
                      label="Nombre del Cliente"
                      value={newSale.customer}
                      onChange={(e) => handleNewCustomerName(e.target.value)}
                      placeholder="Ingrese el nombre del cliente"
                    />
                  ) : (
                    <Autocomplete
                      label="Cliente"
                      placeholder="Seleccione un cliente"
                      selectedKey={selectedCustomer?.id || null}
                      onSelectionChange={handleCustomerSelection}
                    >
                      {customersList.map((customer) => (
                        <AutocompleteItem key={customer.id}>
                          {customer.name}
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                  )}

                  <Select
                    label="Método de Pago"
                    selectedKeys={[newSale.payment]}
                    onSelectionChange={(keys) =>
                      setNewSale(prev => ({ ...prev, payment: Array.from(keys)[0] as string }))
                    }
                  >
                    <SelectItem key="cash" value="cash">Efectivo</SelectItem>
                    <SelectItem key="credit card" value="credit card">Tarjeta de Crédito</SelectItem>
                    <SelectItem key="transfer" value="transfer">Transferencia</SelectItem>
                  </Select>
                </div>

                <Divider />

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Agregar Productos</h4>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <Autocomplete
                        label="Producto"
                        placeholder="Seleccione un producto"
                        selectedKey={selectedProduct?.id || null}
                        onSelectionChange={(key) => {
                          const product = productsList.find(p => p.id === key);
                          setSelectedProduct(product || null);
                        }}
                      >
                        {productsList
                          .filter(product => product.stock > 0)
                          .map((product) => (
                            <AutocompleteItem 
                              key={product.id} 
                              textValue={`${product.name} - Stock: ${product.stock} - $${product.price}`}
                            >
                              {product.name} - Stock: {product.stock} - ${product.price}
                            </AutocompleteItem>
                          ))}
                      </Autocomplete>
                    </div>

                    <Input
                      type="number"
                      label="Cantidad"
                      value={quantity.toString()}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={selectedProduct?.stock || undefined}
                    />

                    <Button
                      color="primary"
                      onPress={handleAddProduct}
                      isDisabled={!selectedProduct}
                      className="self-end"
                    >
                      Agregar
                    </Button>
                  </div>

                  {selectedProduct && (
                    <div className="bg-default-100 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>{selectedProduct.name}</strong> -
                        Precio: ${selectedProduct.price} -
                        Stock disponible: {selectedProduct.stock}
                      </p>
                    </div>
                  )}
                </div>

                {newSale.items.length > 0 && (
                  <>
                    <Divider />

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Productos Agregados</h4>

                      <Table aria-label="Productos en la venta">
                        <TableHeader>
                          <TableColumn>Producto</TableColumn>
                          <TableColumn>Cantidad</TableColumn>
                          <TableColumn>Precio Unit.</TableColumn>
                          <TableColumn>Subtotal</TableColumn>
                          <TableColumn>Acciones</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {newSale.items.map((item) => (
                            <TableRow key={item.product_id}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.quantity.toString()}
                                  onChange={(e) =>
                                    handleUpdateQuantity(
                                      item.product_id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  min="1"
                                  size="sm"
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>${formatCurrency(item.unit_price)}</TableCell>
                              <TableCell>${formatCurrency(item.subtotal)}</TableCell>
                              <TableCell>
                                <Button
                                  isIconOnly
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

                      <div className="text-right">
                        <p className="text-sm text-foreground-500">Total</p>
                        <p className="font-bold text-2xl text-primary">
                          ${formatCurrency(calculateTotal())}
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
            <Button variant="light" onPress={handleCloseModal}>
              Cerrar
            </Button>
            {selectedSale && newSale.items.length === 0 ? (
              <Button
                color="primary"
                onPress={() => {
                  // Cambiar a modo edición
                  setNewSale({
                    customer: selectedSale.customer,
                    customer_id: selectedSale.customer_id || '',
                    payment: selectedSale.payment,
                    items: selectedSale.items || []
                  });

                  // Configurar cliente seleccionado
                  if (selectedSale.customer_id) {
                    const customer = customersList.find(c => c.id === selectedSale.customer_id);
                    setSelectedCustomer(customer || null);
                    setIsNewCustomer(!customer);
                  } else {
                    setIsNewCustomer(true);
                  }
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
                  (isNewCustomer && !newSale.customer.trim()) ||
                  (!isNewCustomer && !selectedCustomer) ||
                  newSale.items.length === 0
                }
              >
                {selectedSale ? 'Actualizar' : 'Guardar'} Venta
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};