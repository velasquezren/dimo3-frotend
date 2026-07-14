'use client';

import { useState } from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { getOrders } from '@/lib/store';
import type { Order } from '@/lib/types';

export default function PedidosPage() {
  const [search, setSearch] = useState('');

  const data = getOrders(search);

  const columns = [
    {
      key: 'id',
      label: 'N° Pedido',
      render: (_: any, row: any) => (
        <Link
          href={`/pedidos/${row.id}`}
          className="font-data text-xs text-text-secondary hover:text-accent-primary transition-colors"
          title={row.id}
        >
          {row.id.substring(0, 8)}…
        </Link>
      ),
    },
    {
      key: 'customerName',
      label: 'Cliente',
      render: (_: any, row: any) => (
        <span className="text-text-primary font-medium text-sm">{row.customerName}</span>
      ),
    },
    {
      key: 'orderDate',
      label: 'Fecha',
      render: (_: any, row: any) => (
        <span className="font-data text-xs text-text-tertiary">
          {new Date(row.orderDate).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
      className: 'hidden md:table-cell',
    },
    {
      key: 'status',
      label: 'Estado',
      render: (_: any, row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'total',
      label: 'Total',
      render: (_: any, row: any) => (
        <span className="font-data text-sm text-text-primary font-semibold">
          Bs {row.total.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <Link href={`/pedidos/${row.id}`} className="btn btn-secondary btn-sm">
          Ver detalle
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Pedidos</h1>
          <p className="text-text-tertiary text-sm mt-0.5">
            {data.length} registro{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/pedidos/nuevo" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Pedido
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por cliente, ID o estado..."
        onSearch={setSearch}
        emptyMessage="No hay pedidos registrados."
        emptyActionLabel="Crear primer pedido"
        emptyActionHref="/pedidos/nuevo"
      />
    </div>
  );
}
