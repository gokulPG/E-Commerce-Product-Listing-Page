"use client";

import type { SortOption } from "@/hooks/useProductFilters";
import styles from "./SortDropdown.module.css";

type SortDropdownProps = {
  value: SortOption | null;
  onChange: (value: SortOption | null) => void;
};

const OPTIONS: { value: SortOption | ""; label: string }[] = [
  { value: "", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      className={styles.select}
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value as SortOption) || null)}
      aria-label="Sort products"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}