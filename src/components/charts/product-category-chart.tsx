import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardBody, CardHeader } from '@heroui/react';

interface CategoryData {
  name: string;
  value: number;
}

interface ProductCategoryChartProps {
  data: CategoryData[];
  title: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ProductCategoryChart: React.FC<ProductCategoryChartProps> = ({ data, title }) => {
  return (
    <Card className="border border-divider">
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
        <h4 className="font-semibold text-large">{title}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
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
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};