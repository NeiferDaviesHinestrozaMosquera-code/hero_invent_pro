import React from 'react';
import { useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Checkbox } from '@heroui/react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Customers {
  id: number;
  first_name: string;
  last_name: string;
  cc: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  active: boolean;
}

interface FormData {
  first_name: string;
  last_name: string;
  cc: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  active: boolean;
}

export const Customers: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customersList, setCustomersList] = React.useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [formData, setFormData] = React.useState<FormData>({ 
    first_name: '', 
    last_name: '',
    cc: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    active: true
  });
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/customers`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCustomersList(data);
    } catch (error: any) {
      setError(`Error al cargar clientes: ${error.message}`);
      console.error("Error al buscar clientes:", error);
      setCustomersList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleRowAction = async (action: string, customer: Customer) => {
    if (action === 'edit') {
      setSelectedCustomer(customer);
      setFormData({ 
        first_name: customer.first_name, 
        last_name: customer.last_name || '',
        cc: customer.cc || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postal_code: customer.postal_code || '',
        active: customer.active
      });
      onOpen();
    } else if (action === 'delete') {
      if (confirm('¿Está seguro de que desea eliminar a este cliente?')) {
        try {
          setError('');
          const response = await fetch(`${API_BASE_URL}/api/customers/${customer.id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al borrar un cliente');
          }
          
          await fetchCustomers();
        } catch (error: any) {
          setError(`Borrar error: ${error.message}`);
          console.error("Error al borrar cliente:", error);
        }
      }
    } else if (action === 'view') {
      setSelectedCustomer(customer);
      setFormData({ 
        first_name: customer.first_name, 
        last_name: customer.last_name || '',
        cc: customer.cc || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postal_code: customer.postal_code || '',
        active: customer.active
      });
      onOpen();
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData({ 
      first_name: '', 
      last_name: '',
      cc: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      active: true
    });
    setError('');
    onOpen();
  };

  const handleSaveCustomer = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Nombre y apellidos obligatorios');
      return;
    }
    
    try {
      setSaveLoading(true);
      setError('');
      
      const url = selectedCustomer 
        ? `${API_BASE_URL}/api/customers/${selectedCustomer.id}` 
        : `${API_BASE_URL}/api/customers`;
      
      const method = selectedCustomer ? 'PUT' : 'POST';
      
      const dataToSend: any = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        active: formData.active
      };
      
      if (formData.cc.trim()) dataToSend.cc = formData.cc.trim();
      if (formData.phone.trim()) dataToSend.phone = formData.phone.trim();
      if (formData.email.trim()) dataToSend.email = formData.email.trim();
      if (formData.address.trim()) dataToSend.address = formData.address.trim();
      if (formData.city.trim()) dataToSend.city = formData.city.trim();
      if (formData.state.trim()) dataToSend.state = formData.state.trim();
      if (formData.postal_code.trim()) dataToSend.postal_code = formData.postal_code.trim();
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }
      
      await fetchCustomers();
      onClose();
    } catch (error: any) {
      setError(`Guardar error: ${error.message}`);
      console.error("Error al guardar el cliente:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre', 
      sortable: true,
      renderCell: (customer: Customer) => `${customer.first_name} ${customer.last_name}`
    },
    { 
      key: 'cc', 
      label: 'CC',
      renderCell: (customer: Customer) => customer.cc || '-'
    },
    { 
      key: 'email', 
      label: 'Correo Electronico', 
      renderCell: (customer: Customer) => customer.email ? (
        <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
          {customer.email}
        </a>
      ) : '-'
    },
    { 
      key: 'phone', 
      label: 'Celular', 
      renderCell: (customer: Customer) => customer.phone ? (
        <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
          {customer.phone}
        </a>
      ) : '-'
    },
    { 
      key: 'active', 
      label: 'Estado', 
      renderCell: (customer: Customer) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          customer.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {customer.active ? 'Activo' : 'Inactivo'}
        </span>
      )
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
        title="Clientes" 
        description="Gestión de clientes" 
        actionLabel="Nuevo Cliente" 
        onAction={handleAddCustomer} 
      />
      
      <DataTable 
        data={customersList} 
        columns={columns} 
        onRowAction={handleRowAction}
        searchable 
        searchPlaceholder="Busqueda de clientes..."
        isLoading={loading}
        emptyMessage={error ? "Error al cargar los datos" : "No hay clientes registrados"}
      />
      
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl">
                  {selectedCustomer ? 'Editar cliente' : 'Nuevo cliente'}
                </h2>
              </ModalHeader>
              
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {error && (
                    <div className="col-span-2 p-3 text-red-700 bg-red-100 rounded-lg border border-red-200 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Input 
                    label="Nombre*" 
                    placeholder="John"
                    value={formData.first_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, first_name: value }))} 
                    isRequired 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Apellido *" 
                    placeholder="Doe"
                    value={formData.last_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, last_name: value }))} 
                    isRequired 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Numero de CC" 
                    placeholder="123456789"
                    value={formData.cc} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cc: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Correo Electronico" 
                    placeholder="john@example.com"
                    type="email" 
                    value={formData.email} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, email: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Celular" 
                    placeholder="+57 300 123 4567"
                    value={formData.phone} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, phone: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Cuidad" 
                    placeholder="Bogotá"
                    value={formData.city} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Departamento" 
                    placeholder="Cundinamarca"
                    value={formData.state} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))} 
                    variant="bordered"
                  />
                  
                  <Input 
                    label="Codigo Postal" 
                    placeholder="110111"
                    value={formData.postal_code} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, postal_code: value }))} 
                    variant="bordered"
                  />
                  
                  <div className="col-span-2">
                    <Textarea 
                      label="Direccion" 
                      placeholder="Full address"
                      value={formData.address} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, address: value }))} 
                      variant="bordered"
                      minRows={2}
                    />
                  </div>
                  
                  <div className="col-span-2 pt-2">
                    <Checkbox
                      isSelected={formData.active}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, active: value }))}
                    >
                      Usuario Activo
                    </Checkbox>
                  </div>
                </div>
              </ModalBody>
              
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={onClose}
                  isDisabled={saveLoading}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSaveCustomer}
                  isLoading={saveLoading}
                >
                  {selectedCustomer ? 'Actualizar' : 'Crear'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};