import React from 'react';
import { 
  Navbar, 
  NavbarContent, 
  NavbarItem, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Avatar, 
  Button 
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTheme } from '@heroui/use-theme';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Navbar className="border-b border-divider bg-content1">
      <NavbarContent className="sm:hidden">
        <Button isIconOnly variant="light" onPress={toggleSidebar}>
          <Icon icon="lucide:menu" className="text-xl" />
        </Button>
      </NavbarContent>
      
      <NavbarContent className="hidden sm:flex">
        <Button isIconOnly variant="light" onPress={toggleSidebar}>
          <Icon icon="lucide:menu" className="text-xl" />
        </Button>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button 
            isIconOnly 
            variant="light" 
            onPress={toggleTheme}
            aria-label="Toggle theme"
          >
            <Icon 
              icon={isDark ? "lucide:sun" : "lucide:moon"} 
              className="text-xl" 
            />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button 
            isIconOnly 
            variant="light" 
            aria-label="Notifications"
          >
            <Icon icon="lucide:bell" className="text-xl" />
          </Button>
        </NavbarItem>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color="primary"
              name="John Doe"
              size="sm"
              src="https://img.heroui.chat/image/avatar?w=150&h=150&u=1"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Conectado como</p>
              <p className="font-semibold">john.doe@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">Mi Perfil</DropdownItem>
            <DropdownItem key="configurations">Configuración</DropdownItem>
            <DropdownItem key="logout" color="danger">
              Cerrar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};