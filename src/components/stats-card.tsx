import React from 'react';
import { Card, CardBody, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  change?: {
    value: number | string;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change, loading = false }) => {
  const bgColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-500`;

  if (loading) {
    return (
      <Card className="border border-divider">
        <CardBody>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton className="w-20 h-4 mb-2" />
              <Skeleton className="w-16 h-8 mb-2" />
              <Skeleton className="w-12 h-3" />
            </div>
            <Skeleton className="w-10 h-10 rounded-md" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border border-divider">
      <CardBody>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-foreground-500">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">{value}</h3>
            {change && (
              <div className="flex items-center mt-2">
                <Icon 
                  icon={change.isPositive ? "lucide:trending-up" : "lucide:trending-down"} 
                  className={`mr-1 ${change.isPositive ? 'text-success' : 'text-danger'}`} 
                />
                <span className={`text-xs ${change.isPositive ? 'text-success' : 'text-danger'}`}>
                  {change.isPositive ? '+' : ''}{change.value}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-md ${bgColorClass}`}>
            <Icon icon={icon} className={`text-xl ${textColorClass}`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};