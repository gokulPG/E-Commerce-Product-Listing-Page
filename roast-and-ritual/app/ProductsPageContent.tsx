"use client";

import { LoadMoreButton } from "@/components/product/LoadMoreButton";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { RatingFilter } from "@/components/filters/RatingFilter";
import { SortDropdown } from "@/components/filters/SortDropdown";
import type { SortOption } from "@/hooks/useProductFilters";
import styles from "./page.module.css";

export default function ProductsPageContent() {
  const { filters, setFilter, clearFilters } = useProductFilters();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useProducts(filters);

  // Selector pattern: we're ubscribing to that one slice, not the whole store.
  const favoriteIdsArray = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const favoriteIds = new Set(favoriteIdsArray);

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main>
      <h1 className={styles.title}>Roast &amp; Ritual</h1>

      <div className={styles.filterBar}>
        <div className={styles.filterRow}>
          <CategoryFilter
            value={filters.category}
            onChange={(v) => setFilter("category", v)}
          />
          <SortDropdown
            value={filters.sort}
            onChange={(v: SortOption | null) => setFilter("sort", v)}
          />
        </div>
        <RatingFilter
          value={filters.minRating}
          onChange={(v) => setFilter("minRating", v)}
        />
      </div>

      <ProductGrid
        products={allItems}
        isLoading={isLoading}
        isError={isError}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onResetFilters={clearFilters}
        onRetry={() => refetch()}
      />

      <LoadMoreButton
        onClick={() => fetchNextPage()}
        isLoading={isFetchingNextPage}
        hasMore={!!hasNextPage}
      />
    </main>
  );
}