"use client";

import type { Product } from "@/lib/schemas/product";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onResetFilters: () => void;
  onRetry: () => void;
};

export function ProductGrid({
  products,
  isLoading,
  isError,
  favoriteIds,
  onToggleFavorite,
  onResetFilters,
  onRetry,
}: ProductGridProps) {
  if (isLoading) {
    return <p className={styles.message}>Loading products…</p>;
  }

  if (isError) {
    return (
      <div className={styles.errorMessage}>
        <p>Something went wrong loading products.</p>
        <button className={styles.retryButton} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.message}>
        <p>No products match your filters.</p>
        <button className={styles.resetButton} onClick={onResetFilters}>
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorited={favoriteIds.has(product.id)}
          onToggleFavorite={onToggleFavorite}
          priority={index < 4}
        />
      ))}
    </div>
  );
}