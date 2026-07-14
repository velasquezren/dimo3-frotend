'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCustomer } from '@/lib/store';

export default function NuevoClientePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    const result = createCustomer({ fullName, email, phone });
    if (result.success) {
      router.push('/clientes');
    } else {
      setGlobalError(result.error || 'Error al crear el cliente.');
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/clientes" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a clientes
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight mt-2">Nuevo Cliente</h1>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-alert/10 border border-alert/30 rounded text-alert text-sm">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
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
            placeholder="Ej: María González Pérez"
          />
          <p className={`text-xs mt-1 ${errors.fullName ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.fullName || 'Nombre completo del cliente. Campo obligatorio.'}
          </p>
        </div>

        {/* Email */}
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
            placeholder="correo@empresa.com"
          />
          <p className={`text-xs mt-1 ${errors.email ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.email || 'Debe ser único en el sistema. Se usa como identificador de contacto.'}
          </p>
        </div>

        {/* Phone */}
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
            placeholder="+591 712 34567"
          />
          <p className="text-xs mt-1 text-text-tertiary">
            Opcional. Formato libre.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            Crear Cliente
          </button>
          <Link href="/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
