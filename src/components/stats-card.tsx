import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change }) => {
  const bgColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-500`;

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