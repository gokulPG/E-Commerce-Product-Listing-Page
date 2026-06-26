"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortOption = "price_asc" | "price_desc" | "newest";

export type ProductFilters = {
  category: string | null;
  minRating: number | null;
  sort: SortOption | null;
  page: number;
};

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL is the single source of truth
  const filters: ProductFilters = useMemo(() => {
    return {
      category: searchParams.get("category"),
      minRating: searchParams.get("minRating")
        ? Number(searchParams.get("minRating"))
        : null,
      sort: (searchParams.get("sort") as SortOption) || null,
      page: Number(searchParams.get("page") ?? "1"),
    };
  }, [searchParams]);

  // updates ONE param in the URL, keeping the rest intact.
  const setFilter = useCallback(
    (key: string, value: string | number | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      if (key !== "page") {
        params.delete("page");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, clearFilters };
}