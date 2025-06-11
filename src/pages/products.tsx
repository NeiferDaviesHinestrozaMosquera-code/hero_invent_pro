import React from 'react';
import { Chip, useDisclosure, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem, Switch, Card, CardBody, Divider, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Interfaces
interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact?: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number | null;
  supplierId: number | null;
  barcode: string;
  sku: string;
  cost: number;
  min_stock: number;
  status: boolean;
  imageUrl: string;
}

// Componente PageHeader
const PageHeader: React.FC<{
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}> = ({ title, description, actionLabel, onAction, disabled }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-foreground-500 mt-1">{description}</p>
    </div>
    <Button 
      color="primary" 
      onPress={onAction}
      startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
      isDisabled={disabled}
    >
      {actionLabel}
    </Button>
  </div>
);

// Componente DataTable
const DataTable: React.FC<{
  data: Product[];
  columns: any[];
  onRowAction: (action: string, item: Product) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}> = ({ data, columns, onRowAction, searchable, searchPlaceholder, isLoading, emptyMessage }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center h-64">
          <Spinner size="lg" />
          <p className="ml-4">Cargando productos...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-0">
        {searchable && (
          <div className="p-4 border-b">
            <Input
              placeholder={searchPlaceholder || "Buscar..."}
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Icon icon="mdi:magnify" className="w-4 h-4" />}
            />
          </div>
        )}
        
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon="mdi:package-variant" className="w-16 h-16 mx-auto text-foreground-300 mb-4" />
            <p className="text-foreground-500">{emptyMessage || "No hay datos disponibles"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-default-100">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="text-left p-4 font-medium text-foreground-600">
                      {column.label}
                    </th>
                  ))}
                  <th className="text-right p-4 font-medium text-foreground-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-divider hover:bg-default-50">
                    {columns.map((column) => (
                      <td key={column.key} className="p-4">
                        {column.renderCell ? column.renderCell(item) : item[column.key as keyof Product]}
                      </td>
                    ))}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="default"
                          onPress={() => onRowAction('view', item)}
                          startContent={<Icon icon="mdi:eye" className="w-4 h-4" />}
                        >
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => onRowAction('edit', item)}
                          startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => onRowAction('delete', item)}
                          startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Componente ProductForm
const ProductForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
  categories: { value: number; label: string }[];
  suppliers: { value: number; label: string }[];
  isLoading?: boolean;
}> = ({ isOpen, onClose, onSave, product, categories, suppliers, isLoading }) => {
  const [formData, setFormData] = React.useState<Product>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: null,
    supplierId: null,
    barcode: '',
    sku: '',
    cost: 0,
    min_stock: 0,
    status: true,
    imageUrl: ''
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const isReadOnly = product && (product as any).readOnly;
  const isEditing = product && !isReadOnly;

  React.useEffect(() => {
    if (product && !isReadOnly) {
      setFormData({ ...product });
    } else if (!product) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: null,
        supplierId: null,
        barcode: '',
        sku: '',
        cost: 0,
        min_stock: 0,
        status: true,
        imageUrl: ''
      });
    }
    setFormErrors({});
  }, [product, isReadOnly]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre del producto es obligatorio';
    }

    if (formData.price < 0) {
      errors.price = 'El precio debe ser mayor o igual a 0';
    }

    if (formData.stock < 0) {
      errors.stock = 'El stock debe ser mayor o igual a 0';
    }

    if (formData.cost < 0) {
      errors.cost = 'El costo debe ser mayor o igual a 0';
    }

    if (formData.min_stock < 0) {
      errors.min_stock = 'El stock mínimo debe ser mayor o igual a 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    onSave(formData);
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando se modifica
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const modalTitle = isReadOnly ? 'Ver Producto' : isEditing ? 'Editar Producto' : 'Nuevo Producto';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {modalTitle}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información básica */}
            <div className="space-y-4">
              <Input
                label="Nombre del producto"
                placeholder="Ingrese el nombre"
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
                isRequired
                isReadOnly={isReadOnly}
                isInvalid={!!formErrors.name}
                errorMessage={formErrors.name}
              />
              
              <Textarea
                label="Descripción"
                placeholder="Descripción del producto"
                value={formData.description}
                onValueChange={(value) => handleInputChange('description', value)}
                isReadOnly={isReadOnly}
              />
              
              <Input
                label="SKU"
                placeholder="Código SKU"
                value={formData.sku}
                onValueChange={(value) => handleInputChange('sku', value)}
                isReadOnly={isReadOnly}
              />
              
              <Input
                label="Código de barras"
                placeholder="Código de barras"
                value={formData.barcode}
                onValueChange={(value) => handleInputChange('barcode', value)}
                isReadOnly={isReadOnly}
              />
            </div>

            {/* Precios y stock */}
            <div className="space-y-4">
              <Input
                label="Precio de venta"
                placeholder="0.00"
                type="number"
                value={formData.price.toString()}
                onValueChange={(value) => handleInputChange('price', parseFloat(value) || 0)}
                isRequired
                isReadOnly={isReadOnly}
                startContent={<span className="text-foreground-500">$</span>}
                isInvalid={!!formErrors.price}
                errorMessage={formErrors.price}
              />
              
              <Input
                label="Costo"
                placeholder="0.00"
                type="number"
                value={formData.cost.toString()}
                onValueChange={(value) => handleInputChange('cost', parseFloat(value) || 0)}
                isReadOnly={isReadOnly}
                startContent={<span className="text-foreground-500">$</span>}
                isInvalid={!!formErrors.cost}
                errorMessage={formErrors.cost}
              />
              
              <Input
                label="Stock actual"
                placeholder="0"
                type="number"
                value={formData.stock.toString()}
                onValueChange={(value) => handleInputChange('stock', parseInt(value) || 0)}
                isRequired
                isReadOnly={isReadOnly}
                isInvalid={!!formErrors.stock}
                errorMessage={formErrors.stock}
              />
              
              <Input
                label="Stock mínimo"
                placeholder="5"
                type="number"
                value={formData.min_stock.toString()}
                onValueChange={(value) => handleInputChange('min_stock', parseInt(value) || 5)}
                isReadOnly={isReadOnly}
                isInvalid={!!formErrors.min_stock}
                errorMessage={formErrors.min_stock}
              />
            </div>
          </div>

          <Divider className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <Select
                label="Categoría"
                placeholder="Seleccione una categoría"
                selectedKeys={formData.categoryId ? [formData.categoryId.toString()] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleInputChange('categoryId', value ? parseInt(value) : null);
                }}
                isDisabled={isReadOnly}
              >
                {categories.map((category) => (
                  <SelectItem key={category.value.toString()} value={category.value.toString()}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
              {categories.length === 0 && !isReadOnly && (
                <p className="text-xs text-warning mt-1">
                  No hay categorías disponibles. Verifique la conexión con el servidor.
                </p>
              )}
            </div>

            {/* Proveedor */}
            <div>
              <Select
                label="Proveedor"
                placeholder="Seleccione un proveedor"
                selectedKeys={formData.supplierId ? [formData.supplierId.toString()] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleInputChange('supplierId', value ? parseInt(value) : null);
                }}
                isDisabled={isReadOnly}
              >
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.value.toString()} value={supplier.value.toString()}>
                    {supplier.label}
                  </SelectItem>
                ))}
              </Select>
              {suppliers.length === 0 && !isReadOnly && (
                <p className="text-xs text-warning mt-1">
                  No hay proveedores disponibles. Verifique la conexión con el servidor.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Input
              label="URL de imagen"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.imageUrl}
              onValueChange={(value) => handleInputChange('imageUrl', value)}
              isReadOnly={isReadOnly}
              className="flex-1 mr-4"
            />
            
            <Switch
              isSelected={formData.status}
              onValueChange={(checked) => handleInputChange('status', checked)}
              isDisabled={isReadOnly}
            >
              Producto activo
            </Switch>
          </div>

          {/* Vista previa de imagen */}
          {formData.imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Vista previa:</p>
              <img 
                src={formData.imageUrl} 
                alt="Vista previa"
                className="w-24 h-24 object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            {isReadOnly ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button 
              color="primary" 
              onPress={handleSubmit}
              isLoading={isLoading}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Producto
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Componente principal Products
export const Products: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [productList, setProductList] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [dataLoaded, setDataLoaded] = React.useState({
    categories: false,
    suppliers: false,
    products: false
  });

  // Función mejorada para hacer peticiones HTTP
  const makeRequest = async (url: string, options: RequestInit = {}) => {
    try {
      console.log(`Making request to: ${url}`, options);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      console.log(`Response status for ${url}: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response for ${url}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log(`Response data for ${url}:`, data);
      
      return data;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      throw error;
    }
  };

  // Función para cargar categorías
  const fetchCategories = async (): Promise<Category[]> => {
    try {
      console.log('Fetching categories...');
      const result = await makeRequest(`${API_BASE_URL}/api/categories`);
      
      let categoriesData: any[] = [];
      
      // Manejar diferentes formatos de respuesta
      if (result.success && Array.isArray(result.data)) {
        categoriesData = result.data;
      } else if (Array.isArray(result)) {
        categoriesData = result;
      } else if (result.categories && Array.isArray(result.categories)) {
        categoriesData = result.categories;
      } else if (result.items && Array.isArray(result.items)) {
        categoriesData = result.items;
      } else {
        console.warn('Formato de respuesta inesperado para categorías:', result);
        categoriesData = [];
      }

      // Normalizar categorías
      const normalizedCategories: Category[] = categoriesData
        .map((cat: any) => {
          const id = cat.id || cat.id_categoria || cat.categoryId;
          const name = cat.name || cat.nombre || cat.categoryName || `Categoría ${id}`;
          const description = cat.description || cat.descripcion || '';
          
          return {
            id: Number(id),
            name: String(name),
            description: String(description)
          };
        })
        .filter(cat => !isNaN(cat.id) && cat.name.trim() !== '');

      console.log('Categorías normalizadas:', normalizedCategories);
      setCategories(normalizedCategories);
      setDataLoaded(prev => ({ ...prev, categories: true }));
      
      return normalizedCategories;
    } catch (error: any) {
      console.error('Error al cargar categorías:', error);
      const errorMessage = `Error al cargar categorías: ${error.message}`;
      setError(errorMessage);
      
      // Categorías por defecto en caso de error
      const defaultCategories: Category[] = [
        { id: 1, name: 'General', description: 'Categoría general' },
        { id: 2, name: 'Electrónicos', description: 'Productos electrónicos' },
        { id: 3, name: 'Ropa', description: 'Artículos de vestir' }
      ];
      
      setCategories(defaultCategories);
      setDataLoaded(prev => ({ ...prev, categories: true }));
      
      return defaultCategories;
    }
  };

  // Función para cargar proveedores
  const fetchSuppliers = async (): Promise<Supplier[]> => {
    try {
      console.log('Fetching suppliers...');
      const result = await makeRequest(`${API_BASE_URL}/api/suppliers`);
      
      let suppliersData: any[] = [];
      
      // Manejar diferentes formatos de respuesta
      if (result.success && Array.isArray(result.data)) {
        suppliersData = result.data;
      } else if (Array.isArray(result)) {
        suppliersData = result;
      } else if (result.suppliers && Array.isArray(result.suppliers)) {
        suppliersData = result.suppliers;
      } else if (result.items && Array.isArray(result.items)) {
        suppliersData = result.items;
      } else {
        console.warn('Formato de respuesta inesperado para proveedores:', result);
        suppliersData = [];
      }

      // Normalizar proveedores
      const normalizedSuppliers: Supplier[] = suppliersData
        .map((sup: any) => {
          const id = sup.id || sup.id_supplier || sup.supplierId;
          const name = sup.name || sup.nombre || sup.supplierName || `Proveedor ${id}`;
          const contact = sup.contact || sup.contacto || sup.email || sup.phone || '';
          
          return {
            id: Number(id),
            name: String(name),
            contact: String(contact)
          };
        })
        .filter(sup => !isNaN(sup.id) && sup.name.trim() !== '');

      console.log('Proveedores normalizados:', normalizedSuppliers);
      setSuppliers(normalizedSuppliers);
      setDataLoaded(prev => ({ ...prev, suppliers: true }));
      
      return normalizedSuppliers;
    } catch (error: any) {
      console.error('Error al cargar proveedores:', error);
      const errorMessage = `Error al cargar proveedores: ${error.message}`;
      setError(prev => prev ? `${prev} | ${errorMessage}` : errorMessage);
      
      // Proveedores por defecto en caso de error
      const defaultSuppliers: Supplier[] = [
        { id: 1, name: 'Proveedor General', contact: 'general@proveedor.com' },
        { id: 2, name: 'Distribuidora ABC', contact: 'ventas@abc.com' }
      ];
      
      setSuppliers(defaultSuppliers);
      setDataLoaded(prev => ({ ...prev, suppliers: true }));
      
      return defaultSuppliers;
    }
  };

  // Función para cargar productos
  const fetchProducts = async (): Promise<Product[]> => {
    try {
      console.log('Fetching products...');
      const result = await makeRequest(`${API_BASE_URL}/api/products`);
      
      let productsData: any[] = [];
      
      // Manejar diferentes formatos de respuesta
      if (result.success && Array.isArray(result.data)) {
        productsData = result.data;
      } else if (Array.isArray(result)) {
        productsData = result;
      } else if (result.products && Array.isArray(result.products)) {
        productsData = result.products;
      } else if (result.items && Array.isArray(result.items)) {
        productsData = result.items;
      } else {
        console.warn('Formato de respuesta inesperado para productos:', result);
        productsData = [];
      }

      // Mapear productos al formato del cliente
      const mappedProducts = productsData.map(mapServerToClient);
      console.log('Productos mapeados:', mappedProducts);
      
      setProductList(mappedProducts);
      setDataLoaded(prev => ({ ...prev, products: true }));
      
      return mappedProducts;
    } catch (error: any) {
      console.error('Error al cargar productos:', error);
      const errorMessage = `Error al cargar productos: ${error.message}`;
      setError(prev => prev ? `${prev} | ${errorMessage}` : errorMessage);
      
      setProductList([]);
      setDataLoaded(prev => ({ ...prev, products: true }));
      
      return [];
    }
  };

  // Cargar datos iniciales
  React.useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError('');
        setDataLoaded({ categories: false, suppliers: false, products: false });
        
        console.log('Starting data fetch...');
        
        // Cargar datos en paralelo pero con manejo individual de errores
        const [categoriesResult, suppliersResult, productsResult] = await Promise.allSettled([
          fetchCategories(),
          fetchSuppliers(),
          fetchProducts()
        ]);

        // Verificar resultados y manejar errores
        const errors: string[] = [];
        
        if (categoriesResult.status === 'rejected') {
          errors.push(`Categorías: ${categoriesResult.reason.message}`);
        }
        
        if (suppliersResult.status === 'rejected') {
          errors.push(`Proveedores: ${suppliersResult.reason.message}`);
        }
        
        if (productsResult.status === 'rejected') {
          errors.push(`Productos: ${productsResult.reason.message}`);
        }

        if (errors.length > 0) {
          const errorMessage = `Errores al cargar datos: ${errors.join(', ')}`;
          setError(errorMessage);
          console.error('Data loading errors:', errors);
        } else {
          console.log('All data loaded successfully');
        }
        
      } catch (error: any) {
        const errorMsg = error.message || 'Error desconocido al cargar datos';
        setError(errorMsg);
        console.error("Critical error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // Mapear datos del servidor al cliente
  const mapServerToClient = (serverProduct: any): Product => {
    console.log('Mapping server product to client:', serverProduct);
    
    return {
      id: serverProduct.id ? Number(serverProduct.id) : undefined,
      name: serverProduct.name || serverProduct.nombre || '',
      description: serverProduct.description || serverProduct.descripcion || '',
      price: parseFloat(serverProduct.price || serverProduct.precio) || 0,
      stock: parseInt(serverProduct.stock || serverProduct.cantidad) || 0,
      categoryId: serverProduct.category_id || serverProduct.categoryId || serverProduct.id_categoria ? 
        Number(serverProduct.category_id || serverProduct.categoryId || serverProduct.id_categoria) : null,
      supplierId: serverProduct.supplier_id || serverProduct.supplierId || serverProduct.id_proveedor ? 
        Number(serverProduct.supplier_id || serverProduct.supplierId || serverProduct.id_proveedor) : null,
      barcode: serverProduct.barcode || serverProduct.codigo_barras || '',
      sku: serverProduct.sku || serverProduct.codigo_sku || '',
      cost: parseFloat(serverProduct.cost || serverProduct.costo) || 0,
      min_stock: parseInt(serverProduct.min_stock || serverProduct.min_stock || serverProduct.stock_minimo) || 5,
      status: serverProduct.status !== undefined ? Boolean(serverProduct.status) : 
               serverProduct.status !== undefined ? Boolean(serverProduct.status) :
               serverProduct.activo !== undefined ? Boolean(serverProduct.activo) : true,
      imageUrl: serverProduct.image || serverProduct.imagen || serverProduct.imageUrl || ''
    };
  };

  // Mapear datos del cliente al formato del servidor
  const mapClientToServer = (clientProduct: Product) => {
    console.log('Mapping client product to server:', clientProduct);
    
    return {
      name: clientProduct.name,
      description: clientProduct.description || '',
      price: parseFloat(clientProduct.price.toString()) || 0,
      stock: parseInt(clientProduct.stock.toString()) || 0,
      category_id: clientProduct.categoryId || null,
      supplier_id: clientProduct.supplierId || null,
      barcode: clientProduct.barcode || '',
      sku: clientProduct.sku || '',
      cost: parseFloat(clientProduct.cost.toString()) || 0,
      min_stock: parseInt(clientProduct.min_stock.toString()) || 0,
      status: clientProduct.status !== undefined ? clientProduct.status : true,
      image: clientProduct.imageUrl || ''
    };
  };

  const handleRowAction = async (action: string, product: Product) => {
    try {
      setError(''); // Limpiar errores previos
      
      if (action === 'edit') {
        setSelectedProduct({...product});
        onOpen();
        
      } else if (action === 'view') {
        setSelectedProduct({...product, readOnly: true} as any);
        onOpen();
        
      } else if (action === 'delete') {
        if (confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
          await makeRequest(`${API_BASE_URL}/api/products/${product.id}`, {
            method: 'DELETE'
          });
          
          // Recargar productos después de eliminar
          await fetchProducts();
          console.log(`Producto "${product.name}" eliminado exitosamente`);
        }
      }
    } catch (error: any) {
      console.error(`Error in ${action} action:`, error);
      const errorMessage = `Error al ${action === 'delete' ? 'eliminar' : 'procesar'} el producto: ${error.message}`;
      setError(errorMessage);
    }
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      setSaveLoading(true);
      setError('');

      const serverData = mapClientToServer(productData);
      console.log('Saving product:', serverData);

      if (selectedProduct && selectedProduct.id) {
        // Actualizar producto existente
        await makeRequest(`${API_BASE_URL}/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(serverData)
        });
        console.log(`Producto "${productData.name}" actualizado exitosamente`);
      } else {
        // Crear nuevo producto
        await makeRequest(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          body: JSON.stringify(serverData)
        });
        console.log(`Producto "${productData.name}" creado exitosamente`);
      }

      // Recargar productos y cerrar modal
      await fetchProducts();
      onClose();
      setSelectedProduct(null);

    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = `Error al ${selectedProduct?.id ? 'actualizar' : 'crear'} el producto: ${error.message}`;
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedProduct(null);
    setError(''); // Limpiar errores al cerrar modal
  };

  // Formatear categorías y proveedores para el select
  const categoryOptions = React.useMemo(() => {
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }));
  }, [categories]);

  const supplierOptions = React.useMemo(() => {
    return suppliers.map(sup => ({
      value: sup.id,
      label: sup.name
    }));
  }, [suppliers]);

  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Categoría ID: ${categoryId}`;
  };

  // Obtener nombre de proveedor por ID
  const getSupplierName = (supplierId: number | null): string => {
    if (!supplierId) return 'Sin proveedor';
    const supplier = suppliers.find(sup => sup.id === supplierId);
    return supplier ? supplier.name : `Proveedor ID: ${supplierId}`;
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'name',
      label: 'Producto',
      renderCell: (product: Product) => (
        <div className="flex items-center gap-3">
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-foreground-500">SKU: {product.sku || 'N/A'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      renderCell: (product: Product) => (
        <Chip size="sm" variant="flat" color="primary">
          {getCategoryName(product.categoryId)}
        </Chip>
      )
    },
    {
      key: 'supplier',
      label: 'Proveedor',
      renderCell: (product: Product) => (
        <span className="text-foreground-600">
          {getSupplierName(product.supplierId)}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Precio',
      renderCell: (product: Product) => (
        <span className="font-medium">
          ${product.price.toLocaleString('es-CO', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}
        </span>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      renderCell: (product: Product) => {
        const isLowStock = product.stock <= product.min_stock;
        return (
          <Chip 
            size="sm" 
            variant="flat" 
            color={isLowStock ? 'warning' : 'success'}
          >
            {product.stock} unidades
          </Chip>
        );
      }
    },
    {
      key: 'status',
      label: 'Estado',
      renderCell: (product: Product) => (
        <Chip 
          size="sm" 
          variant="flat" 
          color={product.status ? 'success' : 'default'}
        >
          {product.status ? 'Activo' : 'Inactivo'}
        </Chip>
      )
    }
  ];

  // Verificar si todos los datos necesarios están cargados
  const allDataLoaded = dataLoaded.categories && dataLoaded.suppliers && dataLoaded.products;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Productos"
        description="Administre su inventario de productos"
        actionLabel="Nuevo Producto"
        onAction={handleNewProduct}
        disabled={!allDataLoaded}
      />

      {/* Mostrar errores si los hay */}
      {error && (
        <Card>
          <CardBody className="bg-danger-50 border-l-4 border-danger">
            <div className="flex items-start gap-3">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-danger mt-0.5" />
              <div>
                <p className="font-medium text-danger">Error de conexión</p>
                <p className="text-sm text-danger-600 mt-1">{error}</p>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="mt-2"
                  onPress={() => {
                    setError('');
                    // Recargar datos
                    const fetchAllData = async () => {
                      setLoading(true);
                      await Promise.allSettled([
                        fetchCategories(),
                        fetchSuppliers(),
                        fetchProducts()
                      ]);
                      setLoading(false);
                    };
                    fetchAllData();
                  }}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Información del estado de carga */}
      {!allDataLoaded && !loading && (
        <Card>
          <CardBody className="bg-warning-50 border-l-4 border-warning">
            <div className="flex items-start gap-3">
              <Icon icon="mdi:information" className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning">Carga parcial de datos</p>
                <div className="text-sm text-warning-600 mt-1">
                  <p>Estado de carga:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Categorías: {dataLoaded.categories ? '✓ Cargadas' : '✗ Pendientes'}</li>
                    <li>Proveedores: {dataLoaded.suppliers ? '✓ Cargados' : '✗ Pendientes'}</li>
                    <li>Productos: {dataLoaded.products ? '✓ Cargados' : '✗ Pendientes'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      {allDataLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-2">
                <Icon icon="mdi:package-variant" className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold">{productList.length}</p>
              <p className="text-sm text-foreground-500">Total Productos</p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mx-auto mb-2">
                <Icon icon="mdi:check-circle" className="w-6 h-6 text-success" />
              </div>
              <p className="text-2xl font-bold">
                {productList.filter(p => p.status).length}
              </p>
              <p className="text-sm text-foreground-500">Productos Activos</p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-lg mx-auto mb-2">
                <Icon icon="mdi:alert-triangle" className="w-6 h-6 text-warning" />
              </div>
              <p className="text-2xl font-bold">
                {productList.filter(p => p.stock <= p.min_stock).length}
              </p>
              <p className="text-sm text-foreground-500">Stock Bajo</p>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mx-auto mb-2">
                <Icon icon="mdi:tag-multiple" className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-foreground-500">Categorías</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tabla de productos */}
      <DataTable
        data={productList}
        columns={columns}
        onRowAction={handleRowAction}
        searchable
        searchPlaceholder="Buscar por nombre, SKU, código de barras..."
        isLoading={loading}
        emptyMessage={
          allDataLoaded 
            ? "No hay productos registrados. Haga clic en 'Nuevo Producto' para agregar el primero."
            : "Cargando productos..."
        }
      />

      {/* Modal de formulario */}
      <ProductForm
        isOpen={isOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categoryOptions}
        suppliers={supplierOptions}
        isLoading={saveLoading}
      />
    </div>
  );
};

export default Products;