'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { fetchCustomerById, apiUpdateCustomer, apiDeactivateCustomer } from '@/lib/api';

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [createdAt, setCreatedAt] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCustomerById(id)
      .then((customer) => {
        setFullName(customer.fullName);
        setEmail(customer.email);
        setPhone(customer.phone);
        setIsActive(customer.isActive);
        setCreatedAt(customer.createdAt);
        setCustomerId(customer.id);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'El nombre completo es obligatorio.';
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email no válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    setSuccessMsg('');
    if (!validate()) return;

    try {
      await apiUpdateCustomer(id, { fullName, email, phone });
      setSuccessMsg('Cliente actualizado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setGlobalError(err.message || 'Error al actualizar.');
    }
  }

  const handleDeactivate = useCallback(async () => {
    try {
      await apiDeactivateCustomer(id);
      setShowModal(false);
      setIsActive(false);
    } catch (err: any) {
      setGlobalError(err.message || 'Error al desactivar.');
      setShowModal(false);
    }
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-lg">
        <Link href="/clientes" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a clientes
        </Link>
        <div className="mt-8 text-center">
          <p className="text-text-secondary text-lg">Cliente no encontrado.</p>
          <Link href="/clientes" className="btn btn-primary mt-4">
            Ir a clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/clientes" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a clientes
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold font-display tracking-tight">Editar Cliente</h1>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
              isActive
                ? 'bg-accent-secondary/15 text-accent-secondary'
                : 'bg-alert/15 text-alert'
            }`}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="font-data text-xs text-text-tertiary mt-1" title={customerId}>
          ID: {customerId}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">
          Alta: {createdAt ? new Date(createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
        </p>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-alert/10 border border-alert/30 rounded text-alert text-sm">
          {globalError}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-accent-secondary/10 border border-accent-secondary/30 rounded text-accent-secondary text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1.5">
            Nombre completo <span className="text-alert">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`input-field ${errors.fullName ? 'input-error' : ''}`}
          />
          <p className={`text-xs mt-1 ${errors.fullName ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.fullName || 'Nombre completo del cliente. Campo obligatorio.'}
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
            Email <span className="text-alert">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`input-field ${errors.email ? 'input-error' : ''}`}
          />
          <p className={`text-xs mt-1 ${errors.email ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.email || 'Debe ser único en el sistema.'}
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1.5">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
          <p className="text-xs mt-1 text-text-tertiary">Opcional. Formato libre.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
          <Link href="/clientes" className="btn btn-secondary">Cancelar</Link>
          {isActive && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="btn btn-danger ml-auto"
            >
              Desactivar
            </button>
          )}
        </div>
      </form>

      <Modal
        isOpen={showModal}
        title="Desactivar cliente"
        message={`¿Desactivar a "${fullName}"? No será eliminado, solo marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}
