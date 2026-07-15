import { Customer, Product, Order, OrderStatus } from './types';

// Centralizamos las llamadas a la API traduciendo los nombres de las propiedades
// para mantener compatibilidad entre el snake_case del backend y el camelCase del frontend.

// ═══════════════════════════════════════════
// Clientes (Customers)
// ═══════════════════════════════════════════

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : '/api/customers';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener clientes');
  const data = await res.json();
  
  // Mapeamos snake_case -> camelCase
  return data.map((c: any) => ({
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone || '',
    isActive: c.is_active,
    createdAt: c.created_at,
  }));
}

export async function fetchCustomerById(id: string): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`);
  if (!res.ok) throw new Error('Cliente no encontrado');
  const c = await res.json();
  return {
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone || '',
    isActive: c.is_active,
    createdAt: c.created_at,
  };
}

export async function apiCreateCustomer(data: { fullName: string; email: string; phone: string }): Promise<Customer> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear cliente');
  }
  const c = await res.json();
  return {
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone || '',
    isActive: c.is_active,
    createdAt: c.created_at,
  };
}

export async function apiUpdateCustomer(id: string, data: { fullName: string; email: string; phone: string }): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar cliente');
  }
  const c = await res.json();
  return {
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone || '',
    isActive: c.is_active,
    createdAt: c.created_at,
  };
}

export async function apiDeactivateCustomer(id: string): Promise<Customer> {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al desactivar cliente');
  }
  const c = await res.json();
  return {
    id: c.id,
    fullName: c.full_name,
    email: c.email,
    phone: c.phone || '',
    isActive: c.is_active,
    createdAt: c.created_at,
  };
}

// ═══════════════════════════════════════════
// Productos (Products)
// ═══════════════════════════════════════════

export async function fetchProducts(search?: string): Promise<Product[]> {
  const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener productos');
  const data = await res.json();
  
  return data.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    stock: p.stock,
    isActive: p.is_active,
    createdAt: p.created_at,
  }));
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Producto no encontrado');
  const p = await res.json();
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    stock: p.stock,
    isActive: p.is_active,
    createdAt: p.created_at,
  };
}

export async function apiCreateProduct(data: { name: string; description: string; price: number; stock: number }): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear producto');
  }
  const p = await res.json();
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    stock: p.stock,
    isActive: p.is_active,
    createdAt: p.created_at,
  };
}

export async function apiUpdateProduct(id: string, data: { price: number; stock: number }): Promise<Product> {
  // Nota: De acuerdo a Swagger, PATCH /products/{id} solo acepta price y stock
  const res = await fetch(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar producto');
  }
  const p = await res.json();
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    stock: p.stock,
    isActive: p.is_active,
    createdAt: p.created_at,
  };
}

export async function apiDeactivateProduct(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al desactivar producto');
  }
  const p = await res.json();
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    stock: p.stock,
    isActive: p.is_active,
    createdAt: p.created_at,
  };
}

// ═══════════════════════════════════════════
// Pedidos (Orders)
// ═══════════════════════════════════════════

export async function fetchOrders(search?: string): Promise<Order[]> {
  const url = search ? `/api/orders?search=${encodeURIComponent(search)}` : '/api/orders';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al obtener pedidos');
  const data = await res.json();
  
  return data.map((o: any) => ({
    id: o.id,
    customerId: o.customer_id,
    customerName: o.customer_name || 'Desconocido', // Swagger indica customer_id. El backend a veces resuelve o no.
    orderDate: o.order_date,
    status: o.status,
    total: Number(o.total),
    items: (o.items || []).map((i: any) => ({
      productId: i.product_id,
      productName: i.product_name || 'Producto',
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    })),
  }));
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error('Pedido no encontrado');
  const o = await res.json();
  return {
    id: o.id,
    customerId: o.customer_id,
    customerName: o.customer_name || 'Desconocido',
    orderDate: o.order_date,
    status: o.status,
    total: Number(o.total),
    items: (o.items || []).map((i: any) => ({
      productId: i.product_id,
      productName: i.product_name || 'Producto',
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    })),
  };
}

export async function apiCreateOrder(data: { customerId: string; items: { productId: string; quantity: number }[] }): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al crear pedido');
  }
  const o = await res.json();
  return {
    id: o.id,
    customerId: o.customer_id,
    customerName: o.customer_name || 'Desconocido',
    orderDate: o.order_date,
    status: o.status,
    total: Number(o.total),
    items: (o.items || []).map((i: any) => ({
      productId: i.product_id,
      productName: i.product_name || 'Producto',
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    })),
  };
}

export async function apiUpdateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar estado del pedido');
  }
  const o = await res.json();
  return {
    id: o.id,
    customerId: o.customer_id,
    customerName: o.customer_name || 'Desconocido',
    orderDate: o.order_date,
    status: o.status,
    total: Number(o.total),
    items: (o.items || []).map((i: any) => ({
      productId: i.product_id,
      productName: i.product_name || 'Producto',
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    })),
  };
}
