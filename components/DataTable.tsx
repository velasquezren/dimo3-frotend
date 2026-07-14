'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';

export interface Column {
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: any) => ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  emptyMessage?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}

export default function DataTable({
  columns,
  data,
  searchPlaceholder = 'Buscar...',
  onSearch,
  emptyMessage = 'No hay registros.',
  emptyActionLabel,
  emptyActionHref,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  function handleSearch(value: string) {
    setSearchTerm(value);
    onSearch?.(value);
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {onSearch && (
        <div className="relative max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-field input-field-search w-full"
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      {/* Table */}
      {data.length > 0 ? (
        <div className="overflow-x-auto rounded border border-border">
          <table className="data-table w-full text-sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-text-secondary font-semibold text-xs uppercase tracking-wider ${col.className || ''}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className || ''}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="text-text-tertiary mb-4"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="12" y2="14" />
          </svg>
          <p className="text-text-secondary mb-4">{emptyMessage}</p>
          {emptyActionLabel && emptyActionHref && (
            <Link href={emptyActionHref} className="btn btn-primary">
              {emptyActionLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
