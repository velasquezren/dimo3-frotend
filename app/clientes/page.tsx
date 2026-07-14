'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { getCustomers, deactivateCustomer } from '@/lib/store';
import type { Customer } from '@/lib/types';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalTarget, setModalTarget] = useState<Customer | null>(null);

  const data = getCustomers(search);

  const handleDeactivate = useCallback(() => {
    if (modalTarget) {
      deactivateCustomer(modalTarget.id);
      setModalTarget(null);
      setRefreshKey((k) => k + 1);
    }
  }, [modalTarget]);

  const columns = [
    {
      key: 'fullName',
      label: 'Nombre',
      render: (_: any, row: any) => (
        <Link
          href={`/clientes/${row.id}`}
          className="text-text-primary hover:text-accent-primary transition-colors font-medium"
        >
          {row.fullName}
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (_: any, row: any) => (
        <span className="font-data text-xs text-text-secondary">{row.email}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (_: any, row: any) => (
        <span className="text-text-secondary text-sm">
          {row.phone || '—'}
        </span>
      ),
      className: 'hidden md:table-cell',
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
      key: 'createdAt',
      label: 'Alta',
      render: (_: any, row: any) => (
        <span className="font-data text-xs text-text-tertiary">
          {new Date(row.createdAt).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
      className: 'hidden lg:table-cell',
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/clientes/${row.id}`}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Clientes</h1>
          <p className="text-text-tertiary text-sm mt-0.5">
            {data.length} registro{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/clientes/nuevo" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Cliente
        </Link>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por nombre o email..."
        onSearch={setSearch}
        emptyMessage="No hay clientes registrados."
        emptyActionLabel="Registrar primer cliente"
        emptyActionHref="/clientes/nuevo"
      />

      {/* Deactivation modal */}
      <Modal
        isOpen={!!modalTarget}
        title="Desactivar cliente"
        message={`¿Desactivar a "${modalTarget?.fullName}"? El cliente no será eliminado, solo marcado como inactivo. Podrás reactivarlo después.`}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setModalTarget(null)}
      />
    </div>
  );
}
