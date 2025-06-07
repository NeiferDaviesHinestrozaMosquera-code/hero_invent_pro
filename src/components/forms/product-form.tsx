import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Checkbox
} from '@heroui/react';

interface Category {
  id: number | string;
  nombre: string;
  name?: string;
}

interface Supplier {
  id: number | string;
  nombre: string;
  name?: string;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: any;
  categories: Category[];
  suppliers: Supplier[];
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  suppliers,
  isLoading = false
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '5',
    currentStock: '',
    categoryId: '',
    supplierId: '',
    sku: '',
    barcode: '',
    isActive: true
  });

  React.useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        stock: product.stock?.toString() || '',
        minStock: product.minStock?.toString() || '5',
        currentStock: product.currentStock?.toString() || product.stock?.toString() || '',
        categoryId: product.categoryId?.toString() || '',
        supplierId: product.supplierId?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    } else if (isOpen) {
      // Reset form when opening for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '5',
        currentStock: '',
        categoryId: '',
        supplierId: '',
        sku: '',
        barcode: '',
        isActive: true
      });
    }
  }, [product, isOpen]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      currentStock: parseInt(formData.currentStock) || parseInt(formData.stock) || 0,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      id: product?.id || undefined
    };

    onSave(productData);
  };

  const isFormValid = formData.name.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isDismissable={!isLoading}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Nombre del producto"
                  value={formData.name}
                  onValueChange={(value) => handleChange('name', value)}
                  isRequired
                  variant="bordered"
                />
                <Input
                  label="SKU"
                  placeholder="SKU del producto"
                  value={formData.sku}
                  onValueChange={(value) => handleChange('sku', value)}
                  variant="bordered"
                />
                <Input
                  label="Código de barras"
                  placeholder="Código de barras"
                  value={formData.barcode}
                  onValueChange={(value) => handleChange('barcode', value)}
                  variant="bordered"
                />
                <Select
                  label="Categoría"
                  placeholder="Seleccionar categoría"
                  selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleChange('categoryId', value || '');
                  }}
                  variant="bordered"
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id.toString()} value={category.id.toString()}>
                      {category.nombre || category.name || `Categoría ${category.id}`}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Proveedor"
                  placeholder="Seleccionar proveedor"
                  selectedKeys={formData.supplierId ? [formData.supplierId] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleChange('supplierId', value || '');
                  }}
                  variant="bordered"
                >
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id.toString()} value={supplier.id.toString()}>
                      {supplier.nombre || supplier.name || `Proveedor ${supplier.id}`}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="number"
                  label="Precio de venta"
                  placeholder="0.00"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  value={formData.price}
                  onValueChange={(value) => handleChange('price', value)}
                  variant="bordered"
                />
                <Input
                  type="number"
                  label="Costo"
                  placeholder="0.00"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  value={formData.cost}
                  onValueChange={(value) => handleChange('cost', value)}
                  variant="bordered"
                />
                <Input
                  type="number"
                  label="Stock actual"
                  placeholder="0"
                  value={formData.stock}
                  onValueChange={(value) => {
                    handleChange('stock', value);
                    // Auto-sync currentStock if not manually set
                    if (!formData.currentStock) {
                      handleChange('currentStock', value);
                    }
                  }}
                  variant="bordered"
                />
                <Input
                  type="number"
                  label="Stock mínimo"
                  placeholder="5"
                  value={formData.minStock}
                  onValueChange={(value) => handleChange('minStock', value)}
                  variant="bordered"
                />
                <Textarea
                  label="Descripción"
                  placeholder="Descripción del producto"
                  value={formData.description}
                  onValueChange={(value) => handleChange('description', value)}
                  className="col-span-1 md:col-span-2"
                  variant="bordered"
                />
                <div className="col-span-1 md:col-span-2">
                  <Checkbox
                    isSelected={formData.isActive}
                    onValueChange={(value) => handleChange('isActive', value)}
                  >
                    Producto activo
                  </Checkbox>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="flat" 
                onPress={onClose}
                isDisabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={isLoading}
                isDisabled={!isFormValid}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};