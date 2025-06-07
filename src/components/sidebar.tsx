import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Tooltip } from '@heroui/react';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isOpen }) => {
  return (
    <Tooltip 
      content={label}
      placement="right"
      isDisabled={isOpen}
    >
      <NavLink
        to={to}
        className={({ isActive }) => 
          `flex items-center px-4 py-3 rounded-md transition-colors ${
            isActive ? 'sidebar-active' : 'text-foreground-600 hover:bg-default-100'
          }`
        }
      >
        <Icon 
          icon={icon} 
          className={`text-xl ${isOpen ? 'mr-3' : ''} sidebar-icon`} 
        />
        {isOpen && <span>{label}</span>}
      </NavLink>
    </Tooltip>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside 
      className={`bg-content1 border-r border-divider transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } flex flex-col`}
    >
      <div className={`h-16 flex items-center px-4 border-b border-divider ${isOpen ? 'justify-start' : 'justify-center'}`}>
        {isOpen ? (
          <h1 className="text-xl font-semibold text-primary">InvenPro</h1>
        ) : (
          <Icon icon="lucide:box" className="text-2xl text-primary" />
        )}
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        <NavItem to="/" icon="lucide:layout-dashboard" label="Dashboard" isOpen={isOpen} />
        <NavItem to="/products" icon="lucide:package" label="Productos" isOpen={isOpen} />
        <NavItem to="/categories" icon="lucide:tag" label="Categorías" isOpen={isOpen} />
        <NavItem to="/inventory" icon="lucide:boxes" label="Inventario" isOpen={isOpen} />
        <NavItem to="/sales" icon="lucide:shopping-cart" label="Ventas" isOpen={isOpen} />
        <NavItem to="/purchases" icon="lucide:shopping-bag" label="Compras" isOpen={isOpen} />
        <NavItem to="/suppliers" icon="lucide:truck" label="Proveedores" isOpen={isOpen} />
        <NavItem to="/reports" icon="lucide:bar-chart-2" label="Reportes" isOpen={isOpen} />
        <NavItem to="/accounting" icon="lucide:calculator" label="Contabilidad" isOpen={isOpen} />
        <NavItem to="/customer" icon="lucide:user" label="Clientes" isOpen={isOpen} />
        <NavItem to="" icon="lucide:check" label="Factura Electronica" isOpen={isOpen} />
      </nav>
    </aside>
  );
};