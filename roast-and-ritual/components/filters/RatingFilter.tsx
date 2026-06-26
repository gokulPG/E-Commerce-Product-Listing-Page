"use client";

import clsx from "clsx";
import styles from "./RatingFilter.module.css";

type RatingFilterProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

const THRESHOLDS = [4, 3, 2];

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  return (
    <div className={styles.list} role="group" aria-label="Filter by minimum rating">
      <button
        className={clsx(styles.button, value === null && styles.buttonActive)}
        onClick={() => onChange(null)}
        aria-pressed={value === null}
      >
        Any rating
      </button>
      {THRESHOLDS.map((threshold) => (
        <button
          key={threshold}
          className={clsx(styles.button, value === threshold && styles.buttonActive)}
          onClick={() => onChange(threshold)}
          aria-pressed={value === threshold}
        >
          ★ {threshold}+ 
        </button>
      ))}
    </div>
  );
}