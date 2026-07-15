'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { fetchOrderById, apiUpdateOrderStatus } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';

const allStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [animateStamp, setAnimateStamp] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchOrderById(id)
      .then((o) => setOrder(o))
      .catch((err) => {
        console.error(err);
        setNotFound(true);
      });
  }, [id]);

  async function handleStatusChange(newStatus: OrderStatus) {
    if (!order || order.status === newStatus) return;

    try {
      const updated = await apiUpdateOrderStatus(id, newStatus);
      setOrder(updated);
      setAnimateStamp(true);
      setStatusMessage(`Estado cambiado a "${statusLabels[newStatus]}".`);
      setTimeout(() => {
        setAnimateStamp(false);
        setStatusMessage('');
      }, 2000);
    } catch (err: any) {
      console.error(err);
    }
  }

  if (notFound) {
    return (
      <div className="max-w-2xl">
        <Link href="/pedidos" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a pedidos
        </Link>
        <div className="mt-8 text-center">
          <p className="text-text-secondary text-lg">Pedido no encontrado.</p>
          <Link href="/pedidos" className="btn btn-primary mt-4">Ir a pedidos</Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link href="/pedidos" className="text-text-tertiary hover:text-text-secondary text-sm transition-colors">
          ← Volver a pedidos
        </Link>
      </div>

      {/* Order header */}
      <div className="bg-bg-surface border border-border rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Detalle de Pedido</h1>
            <p className="font-data text-xs text-text-tertiary mt-1" title={order.id}>
              ID: {order.id}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
              <div className="text-sm text-text-secondary">
                <span className="text-text-tertiary">Cliente:</span>{' '}
                <span className="font-medium text-text-primary">{order.customerName}</span>
              </div>
              <span className="hidden sm:inline text-text-tertiary">·</span>
              <div className="text-sm text-text-secondary">
                <span className="text-text-tertiary">Fecha:</span>{' '}
                <span className="font-data text-xs">
                  {new Date(order.orderDate).toLocaleDateString('es-BO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Status stamp */}
          <div className="flex flex-col items-center gap-2">
            <StatusBadge status={order.status} animate={animateStamp} large />
          </div>
        </div>
      </div>

      {/* Status change */}
      <div className="bg-bg-surface border border-border rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Cambiar Estado
        </h2>
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={order.status === s}
              className={`btn btn-sm ${
                order.status === s
                  ? 'btn-primary opacity-100 cursor-default'
                  : 'btn-secondary'
              }`}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
        {statusMessage && (
          <p className="text-xs text-accent-secondary mt-2">{statusMessage}</p>
        )}
      </div>

      {/* Items table */}
      <div className="border border-border rounded-lg overflow-hidden mb-6">
        <table className="data-table w-full text-sm">
          <thead>
            <tr>
              <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider">Producto</th>
              <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider text-right w-28">P. Unitario</th>
              <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider text-center w-20">Cant.</th>
              <th className="text-text-secondary font-semibold text-xs uppercase tracking-wider text-right w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId}>
                <td className="text-text-primary font-medium">{item.productName}</td>
                <td className="font-data text-text-secondary text-right">
                  Bs {item.unitPrice.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </td>
                <td className="font-data text-text-primary text-center">{item.quantity}</td>
                <td className="font-data text-text-primary font-semibold text-right">
                  Bs {item.subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-4 bg-bg-surface-hover border-t border-border">
          <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Total del Pedido</span>
          <span className="font-data text-xl font-bold text-accent-primary">
            Bs {order.total.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
