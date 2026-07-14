'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '@/lib/store';

export default function NuevoProductoPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio.';
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'El precio debe ser un número mayor a Bs 0.';
    }
    const stockNum = parseInt(stock, 10);
    if (stock === '' || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
    } else if (!Number.isInteger(Number(stock))) {
      newErrors.stock = 'El stock debe ser un número entero.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    const result = createProduct({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    });
    if (result.success) {
      router.push('/productos');
    } else {
      setGlobalError(result.error || 'Error al crear el producto.');
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/productos" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight mt-2">Nuevo Producto</h1>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-alert/10 border border-alert/30 rounded text-alert text-sm">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
            Nombre <span className="text-alert">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`input-field ${errors.name ? 'input-error' : ''}`}
            placeholder="Ej: Guantes de nitrilo industrial"
          />
          <p className={`text-xs mt-1 ${errors.name ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.name || 'Nombre del producto. Campo obligatorio.'}
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1.5">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Descripción detallada del producto..."
          />
          <p className="text-xs mt-1 text-text-tertiary">
            Opcional. Especificaciones, medidas, material, etc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-1.5">
              Precio <span className="text-alert">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-data text-sm">Bs</span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`input-field pl-9 font-data ${errors.price ? 'input-error' : ''}`}
                placeholder="0.00"
              />
            </div>
            <p className={`text-xs mt-1 ${errors.price ? 'text-alert' : 'text-text-tertiary'}`}>
              {errors.price || 'Debe ser mayor a Bs 0. Usa punto decimal.'}
            </p>
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-text-secondary mb-1.5">
              Stock <span className="text-alert">*</span>
            </label>
            <input
              id="stock"
              type="number"
              step="1"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={`input-field font-data ${errors.stock ? 'input-error' : ''}`}
              placeholder="0"
            />
            <p className={`text-xs mt-1 ${errors.stock ? 'text-alert' : 'text-text-tertiary'}`}>
              {errors.stock || 'Cantidad entera, mínimo 0.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">Crear Producto</button>
          <Link href="/productos" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
