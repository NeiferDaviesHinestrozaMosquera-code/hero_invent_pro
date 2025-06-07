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
import { Card, CardBody, CardHeader } from '@heroui/react';

interface InventoryData {
  name: string;
  stock: number;
  minimo: number;
}

interface InventoryChartProps {
  data: InventoryData[];
  title: string;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ data, title }) => {
  return (
    <Card className="border border-divider">
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
        <h4 className="font-semibold text-large">{title}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
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
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="hsl(var(--heroui-primary))" />
            <Bar dataKey="minimo" fill="hsl(var(--heroui-danger))" />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};