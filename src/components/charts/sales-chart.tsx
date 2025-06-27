import React from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
interface SalesData {
  name: string;
  ventas: number;
  compras: number;
}
interface SalesChartProps {
  data: SalesData[];
  title: string;
  loading?: boolean;
  error?: string | null;
}
export const SalesChart: React.FC<SalesChartProps> = ({ data, title, loading = false, error = null }) => {
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
          <Icon icon="lucide:bar-chart-3" className="text-foreground-300 text-4xl mb-2" />
          <p className="text-foreground-600">No hay datos disponibles</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => `$${new Intl.NumberFormat('es-CO', { 
              notation: 'compact', 
              maximumFractionDigits: 1 
            }).format(value)}`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${new Intl.NumberFormat('es-CO').format(value)}`,
              name === 'ventas' ? 'Ventas' : 'Compras'
            ]}
            labelFormatter={(label) => `Período: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="ventas"
            stroke="hsl(var(--heroui-primary))"
            activeDot={{ r: 8 }}
            name="Ventas"
          />
          <Line 
            type="monotone" 
            dataKey="compras" 
            stroke="hsl(var(--heroui-secondary))" 
            name="Compras"
          />
        </LineChart>
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