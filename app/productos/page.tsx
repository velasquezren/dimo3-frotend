'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import StockIndicator from '@/components/StockIndicator';
import Modal from '@/components/Modal';
import { getProducts, deactivateProduct } from '@/lib/store';
import type { Product } from '@/lib/types';

export default function ProductosPage() {
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalTarget, setModalTarget] = useState<Product | null>(null);

  const data = getProducts(search);

  const handleDeactivate = useCallback(() => {
    if (modalTarget) {
      deactivateProduct(modalTarget.id);
      setModalTarget(null);
      setRefreshKey((k) => k + 1);
    }
  }, [modalTarget]);

  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      render: (_: any, row: any) => (
        <Link
          href={`/productos/${row.id}`}
          className="text-text-primary hover:text-accent-primary transition-colors font-medium"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (_: any, row: any) => (
        <span className="text-text-secondary text-sm line-clamp-1 max-w-xs">
          {row.description || '—'}
        </span>
      ),
      className: 'hidden lg:table-cell',
    },
    {
      key: 'price',
      label: 'Precio',
      render: (_: any, row: any) => (
        <span className="font-data text-sm text-text-primary">
          ${row.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (_: any, row: any) => <StockIndicator stock={row.stock} />,
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (_: any, row: any) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
            row.isActive
              ? 'bg-accent-secondary/15 text-accent-secondary'
              : 'bg-alert/15 text-alert'
          }`}
        >
          {row.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/productos/${row.id}`}
            className="btn btn-secondary btn-sm"
          >
            Editar
          </Link>
          {row.isActive && (
            <button
              onClick={() => setModalTarget(row)}
              className="btn btn-danger btn-sm"
            >
              Desactivar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl" key={refreshKey}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Productos</h1>
          <p className="text-text-tertiary text-sm mt-0.5">
            {data.length} registro{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/productos/nuevo" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por nombre o descripción..."
        onSearch={setSearch}
        emptyMessage="No hay productos registrados."
        emptyActionLabel="Registrar primer producto"
        emptyActionHref="/productos/nuevo"
      />

      <Modal
        isOpen={!!modalTarget}
        title="Desactivar producto"
        message={`¿Desactivar "${modalTarget?.name}"? No será eliminado, solo marcado como inactivo. No aparecerá disponible para nuevos pedidos.`}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setModalTarget(null)}
      />
    </div>
  );
}
