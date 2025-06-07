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
import { Card, CardBody, CardHeader } from '@heroui/react';

interface SalesData {
  name: string;
  ventas: number;
  compras: number;
}

interface SalesChartProps {
  data: SalesData[];
  title: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, title }) => {
  return (
    <Card className="border border-divider">
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
        <h4 className="font-semibold text-large">{title}</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
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
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="ventas"
              stroke="hsl(var(--heroui-primary))"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="compras" stroke="hsl(var(--heroui-secondary))" />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};