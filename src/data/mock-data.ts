// Products
export const products = [
  {
    id: '1',
    name: 'Laptop HP Pavilion',
    description: 'Laptop HP Pavilion 15.6" Intel Core i5, 8GB RAM, 512GB SSD',
    price: 12999.99,
    cost: 9500.00,
    stock: 15,
    minStock: 5,
    categoryId: '1',
    supplierId: '1',
    sku: 'LAP-HP-001',
    barcode: '7501234567890',
    isActive: true,
    image: 'https://img.heroui.chat/image/ai?w=300&h=300&u=laptop1'
  },
  {
    id: '2',
    name: 'Monitor LG 24"',
    description: 'Monitor LG 24" Full HD IPS',
    price: 3499.99,
    cost: 2200.00,
    stock: 25,
    minStock: 8,
    categoryId: '1',
    supplierId: '2',
    sku: 'MON-LG-001',
    barcode: '7501234567891',
    isActive: true,
    image: 'https://img.heroui.chat/image/ai?w=300&h=300&u=monitor1'
  },
  {
    id: '3',
    name: 'Teclado Mecánico Logitech',
    description: 'Teclado mecánico Logitech G Pro X con switches GX Blue',
    price: 1899.99,
    cost: 1200.00,
    stock: 30,
    minStock: 10,
    categoryId: '2',
    supplierId: '3',
    sku: 'TEC-LOG-001',
    barcode: '7501234567892',
    isActive: true,
    image: 'https://img.heroui.chat/image/ai?w=300&h=300&u=keyboard1'
  },
  {
    id: '4',
    name: 'Mouse Inalámbrico HP',
    description: 'Mouse inalámbrico HP con receptor USB',
    price: 299.99,
    cost: 150.00,
    stock: 50,
    minStock: 15,
    categoryId: '2',
    supplierId: '1',
    sku: 'MOU-HP-001',
    barcode: '7501234567893',
    isActive: true,
    image: 'https://img.heroui.chat/image/ai?w=300&h=300&u=mouse1'
  },
  {
    id: '5',
    name: 'Impresora Multifuncional Epson',
    description: 'Impresora multifuncional Epson EcoTank L3150',
    price: 4999.99,
    cost: 3500.00,
    stock: 8,
    minStock: 3,
    categoryId: '3',
    supplierId: '4',
    sku: 'IMP-EP-001',
    barcode: '7501234567894',
    isActive: true,
    image: 'https://img.heroui.chat/image/ai?w=300&h=300&u=printer1'
  },
  {
    id: '6',
    name: 'Disco Duro Externo Seagate 1TB',
    description: 'Disco duro externo Seagate 1TB USB 3.0',
    price: 1299.99,
    cost: 800.00,
    stock: 20,
    minStock: 7,
    categoryId: '4',
    supplierId: '5',
    sku: 'HDD-SEA-001',
    barcode: '7501234567895',
    isActive: true,
    image: 'https://img.heroui.chat/image/ai?w=300&h=300&u=harddrive1'
  }
];

// Categories
export const categories = [
  { id: '1', name: 'Computadoras y Monitores', description: 'Laptops, desktops y monitores' },
  { id: '2', name: 'Periféricos', description: 'Teclados, mouse, auriculares' },
  { id: '3', name: 'Impresoras', description: 'Impresoras y escáneres' },
  { id: '4', name: 'Almacenamiento', description: 'Discos duros, SSDs, memorias USB' },
  { id: '5', name: 'Redes', description: 'Routers, switches, cables de red' }
];

// Suppliers
export const suppliers = [
  {
    id: '1',
    name: 'HP México',
    contact: 'Juan Pérez',
    email: 'juan.perez@hp.com',
    phone: '55 1234 5678',
    address: 'Av. Insurgentes Sur 1602, CDMX'
  },
  {
    id: '2',
    name: 'LG Electronics',
    contact: 'María Rodríguez',
    email: 'maria.rodriguez@lg.com',
    phone: '55 8765 4321',
    address: 'Paseo de la Reforma 222, CDMX'
  },
  {
    id: '3',
    name: 'Logitech México',
    contact: 'Carlos González',
    email: 'carlos.gonzalez@logitech.com',
    phone: '55 2468 1357',
    address: 'Av. Santa Fe 505, CDMX'
  },
  {
    id: '4',
    name: 'Epson México',
    contact: 'Ana Martínez',
    email: 'ana.martinez@epson.com',
    phone: '55 1357 2468',
    address: 'Av. Ejército Nacional 579, CDMX'
  },
  {
    id: '5',
    name: 'Seagate Technology',
    contact: 'Roberto Sánchez',
    email: 'roberto.sanchez@seagate.com',
    phone: '55 9876 5432',
    address: 'Av. Paseo de las Palmas 405, CDMX'
  }
];

// Sales
export const sales = [
  {
    id: '1',
    date: '2023-05-15',
    customer: 'Cliente Mostrador',
    total: 13299.98,
    status: 'completed',
    items: [
      { productId: '1', quantity: 1, price: 12999.99 },
      { productId: '4', quantity: 1, price: 299.99 }
    ]
  },
  {
    id: '2',
    date: '2023-05-16',
    customer: 'Empresa ABC',
    total: 17999.95,
    status: 'completed',
    items: [
      { productId: '1', quantity: 1, price: 12999.99 },
      { productId: '2', quantity: 1, price: 3499.99 },
      { productId: '3', quantity: 1, price: 1899.99 }
    ]
  },
  {
    id: '3',
    date: '2023-05-17',
    customer: 'Juan López',
    total: 4999.99,
    status: 'completed',
    items: [
      { productId: '5', quantity: 1, price: 4999.99 }
    ]
  },
  {
    id: '4',
    date: '2023-05-18',
    customer: 'Distribuidora XYZ',
    total: 6499.95,
    status: 'pending',
    items: [
      { productId: '2', quantity: 1, price: 3499.99 },
      { productId: '6', quantity: 1, price: 1299.99 },
      { productId: '3', quantity: 1, price: 1899.99 }
    ]
  },
  {
    id: '5',
    date: '2023-05-19',
    customer: 'María González',
    total: 1599.98,
    status: 'completed',
    items: [
      { productId: '4', quantity: 2, price: 299.99 },
      { productId: '6', quantity: 1, price: 1299.99 }
    ]
  }
];

// Purchases
export const purchases = [
  {
    id: '1',
    date: '2023-05-01',
    supplierId: '1',
    total: 95000.00,
    status: 'received',
    items: [
      { productId: '1', quantity: 10, cost: 9500.00 }
    ]
  },
  {
    id: '2',
    date: '2023-05-02',
    supplierId: '2',
    total: 22000.00,
    status: 'received',
    items: [
      { productId: '2', quantity: 10, cost: 2200.00 }
    ]
  },
  {
    id: '3',
    date: '2023-05-03',
    supplierId: '3',
    total: 12000.00,
    status: 'received',
    items: [
      { productId: '3', quantity: 10, cost: 1200.00 }
    ]
  },
  {
    id: '4',
    date: '2023-05-04',
    supplierId: '1',
    total: 1500.00,
    status: 'pending',
    items: [
      { productId: '4', quantity: 10, cost: 150.00 }
    ]
  },
  {
    id: '5',
    date: '2023-05-05',
    supplierId: '4',
    total: 17500.00,
    status: 'received',
    items: [
      { productId: '5', quantity: 5, cost: 3500.00 }
    ]
  }
];

// Chart data
export const salesChartData = [
  { name: 'Ene', ventas: 15000, compras: 10000 },
  { name: 'Feb', ventas: 18000, compras: 12000 },
  { name: 'Mar', ventas: 22000, compras: 15000 },
  { name: 'Abr', ventas: 25000, compras: 18000 },
  { name: 'May', ventas: 30000, compras: 20000 },
  { name: 'Jun', ventas: 28000, compras: 19000 },
  { name: 'Jul', ventas: 32000, compras: 22000 },
  { name: 'Ago', ventas: 35000, compras: 25000 },
  { name: 'Sep', ventas: 38000, compras: 28000 },
  { name: 'Oct', ventas: 40000, compras: 30000 },
  { name: 'Nov', ventas: 42000, compras: 32000 },
  { name: 'Dic', ventas: 45000, compras: 35000 }
];

export const categoryChartData = [
  { name: 'Computadoras y Monitores', value: 40 },
  { name: 'Periféricos', value: 30 },
  { name: 'Impresoras', value: 15 },
  { name: 'Almacenamiento', value: 10 },
  { name: 'Redes', value: 5 }
];

export const inventoryChartData = [
  { name: 'Laptop HP', stock: 15, minimo: 5 },
  { name: 'Monitor LG', stock: 25, minimo: 8 },
  { name: 'Teclado', stock: 30, minimo: 10 },
  { name: 'Mouse HP', stock: 50, minimo: 15 },
  { name: 'Impresora', stock: 8, minimo: 3 },
  { name: 'Disco Duro', stock: 20, minimo: 7 }
];

// Accounting data
export const accountingData = {
  income: [
    { id: '1', date: '2023-05-15', description: 'Ventas del día', amount: 13299.98, category: 'Ventas' },
    { id: '2', date: '2023-05-16', description: 'Ventas del día', amount: 17999.95, category: 'Ventas' },
    { id: '3', date: '2023-05-17', description: 'Ventas del día', amount: 4999.99, category: 'Ventas' },
    { id: '4', date: '2023-05-19', description: 'Ventas del día', amount: 1599.98, category: 'Ventas' }
  ],
  expenses: [
    { id: '1', date: '2023-05-01', description: 'Compra de inventario', amount: 95000.00, category: 'Inventario' },
    { id: '2', date: '2023-05-02', description: 'Compra de inventario', amount: 22000.00, category: 'Inventario' },
    { id: '3', date: '2023-05-03', description: 'Compra de inventario', amount: 12000.00, category: 'Inventario' },
    { id: '4', date: '2023-05-05', description: 'Compra de inventario', amount: 17500.00, category: 'Inventario' },
    { id: '5', date: '2023-05-10', description: 'Pago de renta', amount: 15000.00, category: 'Operación' },
    { id: '6', date: '2023-05-15', description: 'Pago de servicios', amount: 3500.00, category: 'Servicios' }
  ]
};
