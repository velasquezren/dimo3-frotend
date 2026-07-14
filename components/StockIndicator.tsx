interface StockIndicatorProps {
  stock: number;
  maxStock?: number;
}

export default function StockIndicator({ stock, maxStock = 100 }: StockIndicatorProps) {
  const percentage = Math.min((stock / maxStock) * 100, 100);
  const height = Math.max(percentage, 8); // minimum visible height

  let color: string;
  if (stock === 0) {
    color = 'var(--alert)';
  } else if (stock < 5) {
    color = 'var(--alert)';
  } else if (stock <= 20) {
    color = 'var(--accent-primary)';
  } else {
    color = 'var(--accent-secondary)';
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-data text-sm">
      <span
        className="stock-bar"
        title={`${stock} en stock`}
        aria-label={`Nivel de stock: ${stock}`}
      >
        <span
          className="stock-bar-fill"
          style={{
            height: `${height}%`,
            backgroundColor: color,
          }}
        />
      </span>
      <span style={{ color }}>{stock}</span>
    </span>
  );
}
