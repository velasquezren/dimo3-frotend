'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCustomers, fetchProducts, fetchOrders } from '@/lib/api';

interface Counts {
  customers: number;
  activeCustomers: number;
  products: number;
  activeProducts: number;
  orders: number;
  pendingOrders: number;
}

export default function HomePage() {
  const [counts, setCounts] = useState<Counts>({
    customers: 0, activeCustomers: 0,
    products: 0, activeProducts: 0,
    orders: 0, pendingOrders: 0,
  });

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchProducts(), fetchOrders()])
      .then(([customers, products, orders]) => {
        setCounts({
          customers: customers.length,
          activeCustomers: customers.filter((c) => c.isActive).length,
          products: products.length,
          activeProducts: products.filter((p) => p.isActive).length,
          orders: orders.length,
          pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
        });
      })
      .catch(console.error);
  }, []);

  const cards = [
    {
      title: 'Clientes',
      href: '/clientes',
      count: counts.customers,
      detail: `${counts.activeCustomers} activos`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Productos',
      href: '/productos',
      count: counts.products,
      detail: `${counts.activeProducts} activos`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      title: 'Pedidos',
      href: '/pedidos',
      count: counts.orders,
      detail: `${counts.pendingOrders} pendientes`,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">
          Centro de Control
        </h1>
        <p className="text-text-secondary mt-1 text-sm">
          Gestión de clientes, productos y pedidos en un solo lugar.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-4 p-5 bg-bg-surface border border-border rounded-lg hover:border-border-hover hover:bg-bg-surface-hover transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary group-hover:text-accent-primary transition-colors">
                {card.icon}
              </span>
              <svg
                className="text-text-tertiary group-hover:text-text-secondary transition-colors"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold font-display text-text-primary">
                {card.title}
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-data text-accent-primary">
                  {card.count}
                </span>
                <span className="text-xs text-text-tertiary">{card.detail}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
