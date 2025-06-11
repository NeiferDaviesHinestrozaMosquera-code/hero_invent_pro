import React from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Selection,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';

interface DataTableProps<T> {
  data?: T[];
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    renderCell?: (item: T) => React.ReactNode;
  }[];
  onRowAction?: (key: string, item: T) => void;
  actionLabel?: string;
  selectionMode?: 'single' | 'multiple' | 'none';
  onSelectionChange?: (keys: Selection) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data = [],
  columns,
  onRowAction,
  actionLabel = 'Acciones',
  selectionMode = 'none',
  onSelectionChange,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  isLoading = false
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const rowsPerPage = 10;

  const filteredData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    if (!searchTerm) return data;
    
    return data.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        
        // Manejar objetos y arrays
        if (typeof value === 'object') {
          return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm]);

  const pages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [page, filteredData, rowsPerPage]);

  const tableColumns = React.useMemo(() => {
    const cols = [...columns];
    if (onRowAction) {
      cols.push({
        key: "actions",
        label: actionLabel
      });
    }
    return cols;
  }, [columns, onRowAction, actionLabel]);

  const renderCell = (item: T, columnKey: string) => {
    if (columnKey === "actions" && onRowAction) {
      return (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light">
              <Icon icon="lucide:more-vertical" className="text-default-400" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Acciones">
            <DropdownItem onPress={() => onRowAction('view', item)}>
              Ver
            </DropdownItem>
            <DropdownItem onPress={() => onRowAction('edit', item)}>
              Editar
            </DropdownItem>
            <DropdownItem onPress={() => onRowAction('delete', item)} className="text-danger">
              Eliminar
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    }
    
    const column = columns.find(col => col.key === columnKey);
    if (column?.renderCell) {
      return column.renderCell(item);
    }
    
    // Acceso seguro a propiedades
    const value = (item as any)[columnKey];
    return value !== null && value !== undefined ? value.toString() : '-';
  };

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex justify-between items-center">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            className="w-full sm:max-w-xs"
          />
        </div>
      )}
      
      <Table
        removeWrapper
        aria-label="Data table"
        selectionMode={selectionMode}
        onSelectionChange={onSelectionChange}
        bottomContent={
          pages > 1 && !isLoading ? (
            <div className="flex justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[400px]",
          table: "min-w-full",
        }}
      >
        <TableHeader columns={tableColumns}>
          {(column) => (
            <TableColumn key={column.key} allowsSorting={column.sortable}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody 
          items={isLoading ? [] : items}
          emptyContent={
            isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="lg" />
              </div>
            ) : "No hay datos disponibles"
          }
        >
          {(item) => (
            <TableRow key={`row-${item.id}`}>
              {(columnKey) => (
                <TableCell key={`cell-${item.id}-${columnKey}`}>
                  {renderCell(item, columnKey.toString())}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}