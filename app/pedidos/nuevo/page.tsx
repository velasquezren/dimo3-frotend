'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchCustomers, fetchProducts, apiCreateOrder } from '@/lib/api';
import type { Customer, Product } from '@/lib/types';

interface LineItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  subtotal: number;
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [activeCustomers, setActiveCustomers] = useState<Customer[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers().then((cs) => setActiveCustomers(cs.filter((c) => c.isActive))).catch(console.error);
    fetchProducts().then((ps) => setActiveProducts(ps.filter((p) => p.isActive))).catch(console.error);
  }, []);

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  function addItem() {
    if (!selectedProduct) return;
    const product = activeProducts.find((p) => p.id === selectedProduct);
    if (!product) return;

    // Check if already added
    if (items.some((i) => i.productId === selectedProduct)) {
      setErrors((prev) => ({ ...prev, product: 'Este producto ya fue agregado. Modifica la cantidad existente.' }));
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrors((prev) => ({ ...prev, quantity: 'La cantidad debe ser mayor a 0.' }));
      return;
    }
    if (qty > product.stock) {
      setErrors((prev) => ({
        ...prev,
        quantity: `Sin stock disponible (disponible: ${product.stock}).`,
      }));
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: qty,
        maxStock: product.stock,
        subtotal: Math.round(product.price * qty * 100) / 100,
      },
    ]);
    setSelectedProduct('');
    setQuantity('1');
    setErrors({});
  }

  function updateItemQuantity(productId: string, newQty: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const qty = Math.max(1, Math.min(newQty, item.maxStock));
        return {
          ...item,
          quantity: qty,
          subtotal: Math.round(item.unitPrice * qty * 100) / 100,
        };
      })
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    const newErrors: Record<string, string> = {};

    if (!customerId) newErrors.customer = 'Selecciona un cliente.';
    if (items.length === 0) newErrors.items = 'Agrega al menos un producto al pedido.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await apiCreateOrder({
        customerId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      router.push('/pedidos');
    } catch (err: any) {
      setGlobalError(err.message || 'Error al crear el pedido.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/pedidos" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a pedidos
        </Link>
        <h1 className="text-2xl font-bold font-display tracking-tight mt-2">Nuevo Pedido</h1>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-alert/10 border border-alert/30 rounded text-alert text-sm">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer selection */}
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-text-secondary mb-1.5">
            Cliente <span className="text-alert">*</span>
          </label>
          <select
            id="customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={`input-field select-field ${errors.customer ? 'input-error' : ''}`}
          >
            <option value="">Seleccionar cliente...</option>
            {activeCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.email}
              </option>
            ))}
          </select>
          <p className={`text-xs mt-1 ${errors.customer ? 'text-alert' : 'text-text-tertiary'}`}>
            {errors.customer || 'Solo clientes activos. El cliente debe existir en el sistema.'}
          </p>
        </div>

        {/* Add products */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Agregar Productos <span className="text-alert">*</span>
          </label>
          <div className="flex gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setErrors((prev) => ({ ...prev, product: '', quantity: '' }));
              }}
              className="input-field select-field flex-1"
            >
              <option value="">Seleccionar producto...</option>
              {activeProducts
                .filter((p) => p.stock > 0)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Bs {p.price.toFixed(2)} (stock: {p.stock})
                  </option>
                ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setErrors((prev) => ({ ...prev, quantity: '' }));
              }}
              className="input-field w-20 font-data text-center"
              placeholder="Cant."
              aria-label="Cantidad"
            />
            <button
              type="button"
              onClick={addItem}
              className="btn btn-secondary"
              disabled={!selectedProduct}
            >
              Agregar
            </button>
          </div>
          {(errors.product || errors.quantity) && (
            <p className="text-xs mt-1 text-alert">
              {errors.product || errors.quantity}
            </p>
          )}
          {errors.items && (
            <p className="text-xs mt-1 text-alert">{errors.items}</p>
          )}
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div className="border border-border rounded overflow-hidden">
            <table className="data-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider">Producto</th>
                  <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider w-28">P. Unitario</th>
                  <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider w-24">Cantidad</th>
                  <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider w-28">Subtotal</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId}>
                    <td className="text-text-primary font-medium">{item.productName}</td>
                    <td className="font-data text-text-secondary">
                      Bs {item.unitPrice.toFixed(2)}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max={item.maxStock}
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value, 10))}
                        className="input-field w-16 font-data text-center text-sm py-1"
                        aria-label={`Cantidad de ${item.productName}`}
                      />
                    </td>
                    <td className="font-data text-text-primary font-semibold">
                      Bs {item.subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-text-tertiary hover:text-alert transition-colors p-1"
                        aria-label={`Quitar ${item.productName}`}
                        title="Quitar producto"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex items-center justify-between px-4 py-3 bg-bg-surface-hover border-t border-border">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Total</span>
              <span className="font-data text-lg font-bold text-accent-primary">
                Bs {total.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={items.length === 0 || !customerId}
          >
            Crear Pedido
          </button>
          <Link href="/pedidos" className="btn btn-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
