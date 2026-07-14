'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '@/components/Modal';
import StockIndicator from '@/components/StockIndicator';
import { getProductById, updateProduct, deactivateProduct } from '@/lib/store';

export default function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [createdAt, setCreatedAt] = useState('');
  const [productId, setProductId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const product = getProductById(id);
    if (!product) {
      setNotFound(true);
      return;
    }
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setIsActive(product.isActive);
    setCreatedAt(product.createdAt);
    setProductId(product.id);
  }, [id]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio.';
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) newErrors.price = 'El precio debe ser mayor a Bs 0.';
    const stockNum = parseInt(stock, 10);
    if (stock === '' || isNaN(stockNum) || stockNum < 0) newErrors.stock = 'El stock debe ser ≥ 0.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    setSuccessMsg('');
    if (!validate()) return;

    const result = updateProduct(id, {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    });
    if (result.success) {
      setSuccessMsg('Producto actualizado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setGlobalError(result.error || 'Error al actualizar.');
    }
  }

  const handleDeactivate = useCallback(() => {
    deactivateProduct(id);
    setShowModal(false);
    setIsActive(false);
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-lg">
        <Link href="/productos" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a productos
        </Link>
        <div className="mt-8 text-center">
          <p className="text-text-secondary text-lg">Producto no encontrado.</p>
          <Link href="/productos" className="btn btn-primary mt-4">Ir a productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link href="/productos" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a productos
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold font-display tracking-tight">Editar Producto</h1>
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
              isActive ? 'bg-accent-secondary/15 text-accent-secondary' : 'bg-alert/15 text-alert'
            }`}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="font-data text-xs text-text-tertiary mt-1" title={productId}>
          ID: {productId}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">
          Alta: {createdAt ? new Date(createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
        </p>
        {stock && <div className="mt-2"><StockIndicator stock={parseInt(stock, 10) || 0} /></div>}
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-alert/10 border border-alert/30 rounded text-alert text-sm">{globalError}</div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-accent-secondary/10 border border-accent-secondary/30 rounded text-accent-secondary text-sm">{successMsg}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">
            Nombre <span className="text-alert">*</span>
          </label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            className={`input-field ${errors.name ? 'input-error' : ''}`} />
          <p className={`text-xs mt-1 ${errors.name ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.name || 'Nombre del producto. Campo obligatorio.'}
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1.5">
            Descripción
          </label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} className="input-field resize-none" />
          <p className="text-xs mt-1 text-text-tertiary">Opcional.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-1.5">
              Precio <span className="text-alert">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-data text-sm">Bs</span>
              <input id="price" type="number" step="0.01" min="0.01" value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`input-field pl-9 font-data ${errors.price ? 'input-error' : ''}`} />
            </div>
            <p className={`text-xs mt-1 ${errors.price ? 'text-alert' : 'text-text-tertiary'}`}>
              {errors.price || 'Mayor a Bs 0.'}
            </p>
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-text-secondary mb-1.5">
              Stock <span className="text-alert">*</span>
            </label>
            <input id="stock" type="number" step="1" min="0" value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={`input-field font-data ${errors.stock ? 'input-error' : ''}`} />
            <p className={`text-xs mt-1 ${errors.stock ? 'text-alert' : 'text-text-tertiary'}`}>
              {errors.stock || 'Entero, ≥ 0.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
          <Link href="/productos" className="btn btn-secondary">Cancelar</Link>
          {isActive && (
            <button type="button" onClick={() => setShowModal(true)} className="btn btn-danger ml-auto">
              Desactivar
            </button>
          )}
        </div>
      </form>

      <Modal
        isOpen={showModal}
        title="Desactivar producto"
        message={`¿Desactivar "${name}"? No será eliminado, solo marcado como inactivo.`}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleDeactivate}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
}
