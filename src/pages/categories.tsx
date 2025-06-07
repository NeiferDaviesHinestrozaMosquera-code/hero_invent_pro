import React from 'react';
import { 
  useDisclosure, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Textarea 
} from '@heroui/react';
import { PageHeader } from '../components/page-header';
import { DataTable } from '../components/data-table';

// Configura esto según tu entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface Category {
  id: string;
  name: string;
  description?: string;
  products?: any[];
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const Categories: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categoryList, setCategoryList] = React.useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [formData, setFormData] = React.useState({ 
    name: '', 
    description: '' 
  });
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Función para obtener categorías desde la API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // El backend devuelve { success: true, data: [...], message: '...' }
      if (result.success) {
        setCategoryList(result.data || []);
        setError('');
      } else {
        throw new Error(result.message || 'Error al obtener categorías');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error de conexión con el servidor';
      setError(errorMessage);
      console.error("Error fetching categories:", error);
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener categorías al cargar el componente
  React.useEffect(() => {
    fetchCategories();
  }, []);

  const handleRowAction = async (action: string, category: Category) => {
    if (action === 'edit') {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
      setError(''); // Limpiar errores previos
      onOpen();
    } 
    else if (action === 'delete') {
      if (confirm('¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
        try {
          setError('');
          
          const response = await fetch(`${API_BASE_URL}/api/categories/${category.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.message || `Error HTTP: ${response.status}`);
          }

          if (result.success) {
            // Recargar la lista después de eliminar
            await fetchCategories();
            setError('');
          } else {
            throw new Error(result.message || 'Error al eliminar categoría');
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Error al eliminar la categoría';
          setError(errorMessage);
          console.error("Error deleting category:", error);
        }
      }
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setError(''); // Limpiar errores previos
    onOpen();
  };

  const handleSaveCategory = async () => {
    // Validación en el frontend
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setSaveLoading(true);
      setError('');
      
      const url = selectedCategory 
        ? `${API_BASE_URL}/api/categories/${selectedCategory.id}`
        : `${API_BASE_URL}/api/categories`;
      
      const method = selectedCategory ? 'PUT' : 'POST';
      
      console.log('Enviando datos:', formData);
      console.log('URL:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error HTTP: ${response.status}`);
      }
      
      if (result.success) {
        // Recargar los datos después de guardar
        await fetchCategories();
        onClose();
        // Limpiar el formulario
        setFormData({ name: '', description: '' });
        setSelectedCategory(null);
      } else {
        throw new Error(result.message || 'Error al guardar categoría');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error al guardar la categoría';
      setError(errorMessage);
      console.error("Error saving category:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModal = () => {
    setError(''); // Limpiar errores al cerrar
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
    onClose();
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre', 
      sortable: true 
    },
    { 
      key: 'description', 
      label: 'Descripción',
      renderCell: (category: Category) => (
        <span className={category.description ? '' : 'text-foreground-500'}>
          {category.description || 'Sin descripción'}
        </span>
      )
    },
    { 
      key: 'productCount', 
      label: 'Productos', 
      renderCell: (category: Category) => (
        <span className="text-foreground-500">
          {category.product_count !== undefined ? category.product_count : 
           (category.products ? category.products.length : 0)}
        </span>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Mostrar errores */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <PageHeader 
        title="Categorías" 
        description="Gestión de categorías de productos" 
        actionLabel="Nueva Categoría" 
        onAction={handleAddCategory} 
      />
      
      <DataTable 
        data={categoryList}
        columns={columns}
        onRowAction={handleRowAction}
        searchable
        searchPlaceholder="Buscar categorías..."
        isLoading={loading}
        loadingContent="Cargando categorías..."
        emptyContent="No hay categorías registradas"
      />
      
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </ModalHeader>
              
              <ModalBody>
                <div className="space-y-4">
                  {/* Mostrar errores del modal */}
                  {error && (
                    <div className="p-3 text-red-700 bg-red-100 border border-red-300 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Input
                    label="Nombre"
                    placeholder="Nombre de la categoría"
                    value={formData.name}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, name: value }));
                      // Limpiar error si el usuario empieza a escribir
                      if (error && error.includes('requerido')) {
                        setError('');
                      }
                    }}
                    isRequired
                    isInvalid={!formData.name.trim() && error.includes('requerido')}
                    color={!formData.name.trim() && error.includes('requerido') ? 'danger' : 'default'}
                  />
                  
                  <Textarea
                    label="Descripción"
                    placeholder="Descripción de la categoría (opcional)"
                    value={formData.description}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      description: value 
                    }))}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              
              <ModalFooter>
                <Button 
                  variant="flat" 
                  onPress={handleCloseModal} 
                  isDisabled={saveLoading}
                >
                  Cancelar
                </Button>
                
                <Button 
                  color="primary" 
                  onPress={handleSaveCategory}
                  isLoading={saveLoading}
                  loadingContent="Guardando..."
                >
                  {selectedCategory ? 'Actualizar' : 'Crear'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};