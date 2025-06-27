import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';

interface InventoryData {
  name: string;
  stock: number;
  minimo: number;
}

interface InventoryChartProps {
  data: InventoryData[];
  title: string;
  loading?: boolean;
  error?: string | null;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data, title, loading = false, error = null }) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-[300px] text-center">
          <Icon icon="lucide:alert-circle" className="text-danger text-4xl mb-2" />
          <p className="text-foreground-600">Error al cargar datos</p>
          <p className="text-foreground-400 text-sm">{error}</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-[300px] text-center">
          <Icon icon="lucide:package" className="text-foreground-300 text-4xl mb-2" />
          <p className="text-foreground-600">No hay datos de inventario disponibles</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => [
              value,
              name === 'stock' ? 'Stock Actual' : 'Stock Mínimo'
            ]}
            labelFormatter={(label) => `Producto: ${label}`}
          />
          <Legend />
          <Bar
            dataKey="stock"
            fill="hsl(var(--heroui-primary))"
            name="Stock Actual"
          />
          <Bar
            dataKey="minimo"
            fill="hsl(var(--heroui-danger))"
            name="Stock Mínimo"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="border border-divider">
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
        <h4 className="font-semibold text-large">{title}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        {renderContent()}
      </CardBody>
    </Card>
  );
};