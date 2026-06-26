"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProductFilters } from "./useProductFilters";
import type { Product } from "@/lib/schemas/product";

type ProductsResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
};

async function fetchProducts(
  filters: ProductFilters,
  page: number
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.minRating) params.set("minRating", String(filters.minRating));
  if (filters.sort) params.set("sort", filters.sort);
  params.set("page", String(page));
  params.set("pageSize", "8");

  const res = await fetch(`/api/products?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return res.json();
}

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    // React Query serves cached data instantly if it's still fresh.
    queryKey: ["products", filters.category, filters.minRating, filters.sort],
    queryFn: ({ pageParam }) => fetchProducts(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}