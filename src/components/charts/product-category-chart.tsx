import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';

interface CategoryData {
  name: string;
  value: number;
}

interface ProductCategoryChartProps {
  data: CategoryData[];
  title: string;
  loading?: boolean;
  error?: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ProductCategoryChart: React.FC<ProductCategoryChartProps> = ({ data, title, loading = false, error = null }) => {
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
          <Icon icon="lucide:pie-chart" className="text-foreground-300 text-4xl mb-2" />
          <p className="text-foreground-600">No hay datos disponibles</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Productos']}
          />
          <Legend />
        </PieChart>
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