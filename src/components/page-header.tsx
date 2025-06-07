import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon = 'lucide:plus'
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-foreground-500 mt-1">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button 
          color="primary" 
          onPress={onAction}
          startContent={<Icon icon={actionIcon} />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};