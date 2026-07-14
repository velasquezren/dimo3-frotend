import { Customer, Product, Order, OrderStatus, OrderItem } from './types';

// ═══════════════════════════════════════════
// Utilidad para generar GUIDs
// ═══════════════════════════════════════════

function guid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ═══════════════════════════════════════════
// Datos iniciales — Clientes
// ═══════════════════════════════════════════

let customers: Customer[] = [
  {
    id: 'c1a2b3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    fullName: 'Mariana Torres López',
    email: 'mariana.torres@industek.com',
    phone: '+52 55 1234 5678',
    isActive: true,
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'c2b3c4d5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    fullName: 'Roberto Ángel Vega',
    email: 'rvega@construcciones-del-norte.mx',
    phone: '+52 81 9876 5432',
    isActive: true,
    createdAt: '2025-02-20T14:15:00Z',
  },
  {
    id: 'c3c4d5e6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    fullName: 'Catalina Ramos Uribe',
    email: 'cramos@ferremax.com',
    phone: '',
    isActive: true,
    createdAt: '2025-03-10T09:00:00Z',
  },
  {
    id: 'c4d5e6f7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    fullName: 'Andrés Mendoza Ríos',
    email: 'amendoza@logistica-sur.com',
    phone: '+52 33 5544 3322',
    isActive: true,
    createdAt: '2025-04-05T16:45:00Z',
  },
  {
    id: 'c5e6f7a8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
    fullName: 'Elena Fuentes Paredes',
    email: 'efuentes@aceros-central.mx',
    phone: '+52 222 7788 9900',
    isActive: false,
    createdAt: '2024-11-22T11:20:00Z',
  },
  {
    id: 'c6f7a8b9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    fullName: 'Diego Salazar Montiel',
    email: 'dsalazar@quimicos-atlas.com',
    phone: '',
    isActive: true,
    createdAt: '2025-05-18T08:30:00Z',
  },
];

// ═══════════════════════════════════════════
// Datos iniciales — Productos
// ═══════════════════════════════════════════

let products: Product[] = [
  {
    id: 'p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
    name: 'Guantes de nitrilo industrial',
    description: 'Caja de 100 unidades. Resistencia química y mecánica. Talla L.',
    price: 285.50,
    stock: 48,
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'p2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
    name: 'Casco de seguridad tipo II',
    description: 'Casco con suspensión de 4 puntos. Certificación ANSI Z89.1. Color blanco.',
    price: 189.00,
    stock: 32,
    isActive: true,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'p3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e',
    name: 'Taladro percutor 800W',
    description: 'Motor de 800W, mandril de 13mm, velocidad variable. Incluye maletín.',
    price: 1_450.00,
    stock: 12,
    isActive: true,
    createdAt: '2025-02-15T10:30:00Z',
  },
  {
    id: 'p4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f',
    name: 'Cemento gris 50kg',
    description: 'Saco de cemento Portland tipo I. Resistencia 28 días: 40 MPa.',
    price: 215.00,
    stock: 150,
    isActive: true,
    createdAt: '2025-02-15T10:30:00Z',
  },
  {
    id: 'p5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
    name: 'Cable THW calibre 12',
    description: 'Rollo de 100m. Aislamiento de PVC. 600V. Color negro.',
    price: 890.00,
    stock: 3,
    isActive: true,
    createdAt: '2025-03-01T14:00:00Z',
  },
  {
    id: 'p6f7a8b9-c0d1-4e2f-3a4b-5c6d7e8f9a0b',
    name: 'Lámina galvanizada cal. 26',
    description: 'Lámina de acero galvanizado. Medida: 1.22m x 2.44m. Calibre 26.',
    price: 520.00,
    stock: 25,
    isActive: true,
    createdAt: '2025-03-01T14:00:00Z',
  },
  {
    id: 'p7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c',
    name: 'Arnés de cuerpo completo',
    description: 'Arnés de seguridad con 3 puntos de anclaje. Certificado para trabajos en altura.',
    price: 1_780.00,
    stock: 8,
    isActive: true,
    createdAt: '2025-04-10T09:00:00Z',
  },
  {
    id: 'p8b9c0d1-e2f3-4a4b-5c6d-7e8f9a0b1c2d',
    name: 'Pintura esmalte blanco 4L',
    description: 'Pintura de esmalte alquídico. Acabado brillante. Interior/exterior.',
    price: 345.00,
    stock: 0,
    isActive: false,
    createdAt: '2025-04-10T09:00:00Z',
  },
  {
    id: 'p9c0d1e2-f3a4-4b5c-6d7e-8f9a0b1c2d3e',
    name: 'Tubo PVC hidráulico 2"',
    description: 'Tubo de PVC cédula 40. Longitud 6m. Para instalaciones hidráulicas.',
    price: 95.50,
    stock: 67,
    isActive: true,
    createdAt: '2025-05-01T12:00:00Z',
  },
  {
    id: 'pa0b1c2d-3e4f-4a5b-6c7d-8e9f0a1b2c3d',
    name: 'Soldadora inversor 200A',
    description: 'Soldadora de arco MMA/TIG. Electrodo de 1.6 a 4mm. Ciclo de trabajo 60%.',
    price: 4_250.00,
    stock: 5,
    isActive: true,
    createdAt: '2025-05-01T12:00:00Z',
  },
];

// ═══════════════════════════════════════════
// Datos iniciales — Pedidos
// ═══════════════════════════════════════════

let orders: Order[] = [
  {
    id: 'o1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
    customerId: 'c1a2b3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    customerName: 'Mariana Torres López',
    orderDate: '2025-06-01T10:00:00Z',
    status: 'Delivered',
    items: [
      { productId: 'p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', productName: 'Guantes de nitrilo industrial', quantity: 5, unitPrice: 285.50, subtotal: 1427.50 },
      { productId: 'p2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', productName: 'Casco de seguridad tipo II', quantity: 10, unitPrice: 189.00, subtotal: 1890.00 },
    ],
    total: 3317.50,
  },
  {
    id: 'o2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d',
    customerId: 'c2b3c4d5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
    customerName: 'Roberto Ángel Vega',
    orderDate: '2025-06-10T14:30:00Z',
    status: 'Confirmed',
    items: [
      { productId: 'p4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f', productName: 'Cemento gris 50kg', quantity: 50, unitPrice: 215.00, subtotal: 10750.00 },
      { productId: 'p6f7a8b9-c0d1-4e2f-3a4b-5c6d7e8f9a0b', productName: 'Lámina galvanizada cal. 26', quantity: 10, unitPrice: 520.00, subtotal: 5200.00 },
    ],
    total: 15950.00,
  },
  {
    id: 'o3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e',
    customerId: 'c3c4d5e6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    customerName: 'Catalina Ramos Uribe',
    orderDate: '2025-06-15T09:15:00Z',
    status: 'Pending',
    items: [
      { productId: 'p3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', productName: 'Taladro percutor 800W', quantity: 3, unitPrice: 1450.00, subtotal: 4350.00 },
      { productId: 'p7a8b9c0-d1e2-4f3a-4b5c-6d7e8f9a0b1c', productName: 'Arnés de cuerpo completo', quantity: 2, unitPrice: 1780.00, subtotal: 3560.00 },
    ],
    total: 7910.00,
  },
  {
    id: 'o4d5e6f7-a8b9-4c0d-1e2f-3a4b5c6d7e8f',
    customerId: 'c4d5e6f7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    customerName: 'Andrés Mendoza Ríos',
    orderDate: '2025-06-20T16:00:00Z',
    status: 'Cancelled',
    items: [
      { productId: 'p5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', productName: 'Cable THW calibre 12', quantity: 2, unitPrice: 890.00, subtotal: 1780.00 },
    ],
    total: 1780.00,
  },
  {
    id: 'o5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
    customerId: 'c6f7a8b9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
    customerName: 'Diego Salazar Montiel',
    orderDate: '2025-07-01T11:45:00Z',
    status: 'Pending',
    items: [
      { productId: 'pa0b1c2d-3e4f-4a5b-6c7d-8e9f0a1b2c3d', productName: 'Soldadora inversor 200A', quantity: 1, unitPrice: 4250.00, subtotal: 4250.00 },
      { productId: 'p9c0d1e2-f3a4-4b5c-6d7e-8f9a0b1c2d3e', productName: 'Tubo PVC hidráulico 2"', quantity: 20, unitPrice: 95.50, subtotal: 1910.00 },
      { productId: 'p1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', productName: 'Guantes de nitrilo industrial', quantity: 3, unitPrice: 285.50, subtotal: 856.50 },
    ],
    total: 7016.50,
  },
];

// ═══════════════════════════════════════════
// CRUD — Clientes
// ═══════════════════════════════════════════

export function getCustomers(search?: string): Customer[] {
  let result = [...customers];
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function createCustomer(data: { fullName: string; email: string; phone: string }): { success: boolean; error?: string; customer?: Customer } {
  if (!data.fullName.trim()) {
    return { success: false, error: 'El nombre completo es obligatorio.' };
  }
  if (!data.email.trim()) {
    return { success: false, error: 'El email es obligatorio.' };
  }
  if (customers.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, error: 'Ya existe un cliente con este email.' };
  }
  const customer: Customer = {
    id: guid(),
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || '',
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  customers = [customer, ...customers];
  return { success: true, customer };
}

export function updateCustomer(id: string, data: { fullName: string; email: string; phone: string }): { success: boolean; error?: string } {
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false, error: 'Cliente no encontrado.' };
  if (!data.fullName.trim()) return { success: false, error: 'El nombre completo es obligatorio.' };
  if (!data.email.trim()) return { success: false, error: 'El email es obligatorio.' };
  const duplicate = customers.find((c) => c.email.toLowerCase() === data.email.toLowerCase() && c.id !== id);
  if (duplicate) return { success: false, error: 'Ya existe otro cliente con este email.' };
  customers[idx] = {
    ...customers[idx],
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || '',
  };
  return { success: true };
}

export function deactivateCustomer(id: string): { success: boolean; error?: string } {
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false, error: 'Cliente no encontrado.' };
  customers[idx] = { ...customers[idx], isActive: false };
  return { success: true };
}

// ═══════════════════════════════════════════
// CRUD — Productos
// ═══════════════════════════════════════════

export function getProducts(search?: string): Product[] {
  let result = [...products];
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function createProduct(data: { name: string; description: string; price: number; stock: number }): { success: boolean; error?: string; product?: Product } {
  if (!data.name.trim()) return { success: false, error: 'El nombre es obligatorio.' };
  if (data.price <= 0) return { success: false, error: 'El precio debe ser mayor a Bs 0.' };
  if (data.stock < 0 || !Number.isInteger(data.stock)) return { success: false, error: 'El stock debe ser un número entero mayor o igual a 0.' };
  const product: Product = {
    id: guid(),
    name: data.name.trim(),
    description: data.description?.trim() || '',
    price: Math.round(data.price * 100) / 100,
    stock: data.stock,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  products = [product, ...products];
  return { success: true, product };
}

export function updateProduct(id: string, data: { name: string; description: string; price: number; stock: number }): { success: boolean; error?: string } {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: 'Producto no encontrado.' };
  if (!data.name.trim()) return { success: false, error: 'El nombre es obligatorio.' };
  if (data.price <= 0) return { success: false, error: 'El precio debe ser mayor a Bs 0.' };
  if (data.stock < 0 || !Number.isInteger(data.stock)) return { success: false, error: 'El stock debe ser un número entero mayor o igual a 0.' };
  products[idx] = {
    ...products[idx],
    name: data.name.trim(),
    description: data.description?.trim() || '',
    price: Math.round(data.price * 100) / 100,
    stock: data.stock,
  };
  return { success: true };
}

export function deactivateProduct(id: string): { success: boolean; error?: string } {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: 'Producto no encontrado.' };
  products[idx] = { ...products[idx], isActive: false };
  return { success: true };
}

// ═══════════════════════════════════════════
// CRUD — Pedidos
// ═══════════════════════════════════════════

export function getOrders(search?: string): Order[] {
  let result = [...orders];
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (o) =>
        o.customerName.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term) ||
        o.status.toLowerCase().includes(term)
    );
  }
  return result.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(data: {
  customerId: string;
  items: { productId: string; quantity: number }[];
}): { success: boolean; error?: string; order?: Order } {
  const customer = customers.find((c) => c.id === data.customerId);
  if (!customer) return { success: false, error: 'Cliente no encontrado.' };
  if (!customer.isActive) return { success: false, error: 'El cliente no está activo.' };
  if (!data.items || data.items.length === 0) return { success: false, error: 'El pedido debe tener al menos 1 producto.' };

  const orderItems: OrderItem[] = [];
  for (const item of data.items) {
    if (item.quantity <= 0) return { success: false, error: 'La cantidad debe ser mayor a 0.' };
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { success: false, error: `Producto no encontrado: ${item.productId}` };
    if (!product.isActive) return { success: false, error: `El producto "${product.name}" no está activo.` };
    if (product.stock < item.quantity) {
      return { success: false, error: `Sin stock disponible para "${product.name}" (disponible: ${product.stock}, solicitado: ${item.quantity}).` };
    }
    orderItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: Math.round(product.price * item.quantity * 100) / 100,
    });
  }

  // Descontar stock
  for (const item of data.items) {
    const pIdx = products.findIndex((p) => p.id === item.productId);
    if (pIdx !== -1) {
      products[pIdx] = { ...products[pIdx], stock: products[pIdx].stock - item.quantity };
    }
  }

  const order: Order = {
    id: guid(),
    customerId: customer.id,
    customerName: customer.fullName,
    orderDate: new Date().toISOString(),
    status: 'Pending',
    items: orderItems,
    total: orderItems.reduce((sum, i) => sum + i.subtotal, 0),
  };
  orders = [order, ...orders];
  return { success: true, order };
}

export function updateOrderStatus(id: string, status: OrderStatus): { success: boolean; error?: string } {
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return { success: false, error: 'Pedido no encontrado.' };
  orders[idx] = { ...orders[idx], status };
  return { success: true };
}

// ═══════════════════════════════════════════
// Contadores para dashboard
// ═══════════════════════════════════════════

export function getCounts(): { customers: number; products: number; orders: number; activeCustomers: number; activeProducts: number; pendingOrders: number } {
  return {
    customers: customers.length,
    products: products.length,
    orders: orders.length,
    activeCustomers: customers.filter((c) => c.isActive).length,
    activeProducts: products.filter((p) => p.isActive).length,
    pendingOrders: orders.filter((o) => o.status === 'Pending').length,
  };
}

export function getActiveCustomers(): Customer[] {
  return customers.filter((c) => c.isActive);
}

export function getActiveProducts(): Product[] {
  return products.filter((p) => p.isActive);
}
