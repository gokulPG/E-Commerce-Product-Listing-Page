import styles from "./LoadMoreButton.module.css";

type LoadMoreButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
};

export function LoadMoreButton({ onClick, isLoading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={onClick} disabled={isLoading}>
        {isLoading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}