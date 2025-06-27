import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string; // Agregar soporte para mensajes alternativos
}

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async <T>(endpoint: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        // Manejar códigos de estado HTTP específicos
        const status = response.status;
        let errorMessage = `HTTP error! status: ${status}`;
        
        // Mensajes personalizados para errores comunes
        if (status === 401) errorMessage = "No autorizado - Por favor inicie sesión";
        if (status === 403) errorMessage = "Acceso prohibido - Sin permisos suficientes";
        if (status === 404) errorMessage = "Recurso no encontrado";
        if (status >= 500) errorMessage = "Error del servidor - Intente nuevamente más tarde";
        
        throw new Error(errorMessage);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        // Usar diferentes propiedades para mensajes de error
        const errorMsg = result.error || result.message || 'API request failed';
        throw new Error(errorMsg);
      }
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('API Error:', errorMessage, 'Endpoint:', endpoint);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchData, loading, error, setError }; // Exponer setError para reset
};
