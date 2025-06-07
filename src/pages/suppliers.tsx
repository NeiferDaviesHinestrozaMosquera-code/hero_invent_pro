import React from 'react';
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Interfaz para el proveedor
interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface FormData {
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

export const Suppliers: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [suppliersList, setSuppliersList] = React.useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  const [formData, setFormData] = React.useState<FormData>({ 
    name: '', 
    contact: '', 
    email: '', 
    phone: '', 
    address: '' 
  });
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Función para cargar proveedores (reutilizable)
  const fetchSuppliers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/suppliers`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setSuppliersList(data);
    } catch (error: any) {
      setError(`Error al cargar proveedores: ${error.message}`);
      console.error("Error fetching suppliers:", error);
      setSuppliersList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proveedores al montar el componente
  React.useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleRowAction = async (action: string, supplier: Supplier) => {
    if (action === 'edit') {
      setSelectedSupplier(supplier);
      setFormData({ 
        name: supplier.name || '', 
        contact: supplier.contact || '', 
        email: supplier.email || '', 
        phone: supplier.phone || '', 
        address: supplier.address || '' 
      });
      onOpen();
    } else if (action === 'delete') {
      if (confirm('¿Está seguro de eliminar este proveedor?')) {
        try {
          setError('');
          
          const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplier.id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar proveedor');
          }
          
          // Recargar proveedores después de eliminar
          await fetchSuppliers();
        } catch (error: any) {
          setError(`Error al eliminar: ${error.message}`);
          console.error("Error deleting supplier:", error);
        }
      }
    } else if (action === 'view') {
      setSelectedSupplier(supplier);
      setFormData({ 
        name: supplier.name || '', 
        contact: supplier.contact || '', 
        email: supplier.email || '', 
        phone: supplier.phone || '', 
        address: supplier.address || '' 
      });
      onOpen();
    }
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setFormData({ 
      name: '', 
      contact: '', 
      email: '', 
      phone: '', 
      address: '' 
    });
    setError('');
    onOpen();
  };

  const handleSaveSupplier = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    
    try {
      setSaveLoading(true);
      setError('');
      
      const url = selectedSupplier 
        ? `${API_BASE_URL}/api/suppliers/${selectedSupplier.id}` 
        : `${API_BASE_URL}/api/suppliers`;
      
      const method = selectedSupplier ? 'PUT' : 'POST';
      
      // Preparar datos para enviar (solo incluir campos no vacíos)
      const dataToSend: any = {
        name: formData.name.trim()
      };
      
      if (formData.contact.trim()) dataToSend.contact = formData.contact.trim();
      if (formData.email.trim()) dataToSend.email = formData.email.trim();
      if (formData.phone.trim()) dataToSend.phone = formData.phone.trim();
      if (formData.address.trim()) dataToSend.address = formData.address.trim();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP: ${response.status}`);
      }
      
      // Recargar proveedores después de guardar
      await fetchSuppliers();
      onClose();
    } catch (error: any) {
      setError(`Error al guardar: ${error.message}`);
      console.error("Error saving supplier:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre', 
      sortable: true 
    },
    { 
      key: 'contact', 
      label: 'Contacto',
      renderCell: (supplier: Supplier) => supplier.contact || '-'
    },
    { 
      key: 'email', 
      label: 'Email', 
      renderCell: (supplier: Supplier) => supplier.email ? (
        <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
          {supplier.email}
        </a>
      ) : '-'
    },
    { 
      key: 'phone', 
      label: 'Teléfono', 
      renderCell: (supplier: Supplier) => supplier.phone ? (
        <a href={`tel:${supplier.phone}`} className="text-primary hover:underline">
          {supplier.phone}
        </a>
      ) : '-'
    }
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
          <div className="flex items-center">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}
      
      <PageHeader 
        title="Proveedores" 
        description="Gestión de proveedores" 
        actionLabel="Nuevo Proveedor" 
        onAction={handleAddSupplier} 
      />
      
      <DataTable 
        data={suppliersList} 
        columns={columns} 
        onRowAction={handleRowAction}
        searchable 
        searchPlaceholder="Buscar proveedores..."
        isLoading={loading}
        emptyMessage={error ? "Error al cargar datos" : "No hay proveedores registrados"}
      />
      
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl">
                  {selectedSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
              </ModalHeader>
              
              <ModalBody>
                <div className="space-y-4">
                  {error && (
                    <div className="p-3 text-red-700 bg-red-100 rounded-lg border border-red-200 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Input 
                    label="Nombre *" 
                    placeholder="Nombre del proveedor" 
                    value={formData.name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))} 
                    isRequired 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Persona de contacto" 
                    placeholder="Nombre del contacto" 
                    value={formData.contact} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, contact: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Email" 
                    placeholder="correo@ejemplo.com" 
                    type="email" 
                    value={formData.email} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, email: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Teléfono" 
                    placeholder="+57 300 123 4567" 
                    value={formData.phone} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, phone: value }))} 
                    variant="bordered"
                  />
                  
                  <Textarea 
                    label="Dirección" 
                    placeholder="Dirección completa del proveedor" 
                    value={formData.address} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, address: value }))} 
                    variant="bordered"
                    minRows={3}
                  />
                </div>
              </ModalBody>
              
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={onClose}
                  isDisabled={saveLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSaveSupplier}
                  isLoading={saveLoading}
                >
                  {selectedSupplier ? 'Actualizar' : 'Crear'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};