"use client";

import { useProductFilters } from "@/hooks/useProductFilters";
import { useProducts } from "@/hooks/useProducts";

export default function Home() {
  const { filters } = useProductFilters();
  const { data, isLoading, isError, error } = useProducts(filters);

  if (isLoading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (isError) return <p style={{ padding: 20 }}>Error: {String(error)}</p>;

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <pre style={{ padding: 20, fontSize: 13 }}>
      {JSON.stringify(allItems.map((p) => ({ name: p.name, price: p.price })), null, 2)}
    </pre>
  );
}