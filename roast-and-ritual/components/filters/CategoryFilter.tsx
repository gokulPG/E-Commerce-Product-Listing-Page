"use client";

import clsx from "clsx";
import styles from "./CategoryFilter.module.css";

type CategoryFilterProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

const CATEGORIES = [
  { value: null, label: "All" },
  { value: "beans", label: "Beans" },
  { value: "brewers", label: "Brewers" },
  { value: "grinders", label: "Grinders" },
  { value: "accessories", label: "Accessories" },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className={styles.list} role="group" aria-label="Filter by category">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          className={clsx(styles.button, value === cat.value && styles.buttonActive)}
          onClick={() => onChange(cat.value)}
          aria-pressed={value === cat.value}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}