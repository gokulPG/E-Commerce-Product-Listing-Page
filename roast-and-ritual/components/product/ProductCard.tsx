import Image from "next/image";
import clsx from "clsx";
import type { Product } from "@/lib/schemas/product";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  priority?: boolean;
};

export function ProductCard({
   product,
  isFavorited,
  onToggleFavorite,
  priority = false,
}: ProductCardProps) {
  const displayPrice = `₹${product.price.toLocaleString("en-IN")}`;

  return (
    <div
      className={clsx(
        styles.card,
        !product.inStock && styles.outOfStock,
        isFavorited && styles.cardFavorited
      )}
    >
      <div className={styles.imageWrapper}>
        <Image
          src={product.images[0].url}
          alt={product.images[0].alt}
          fill
          className={styles.image}
          sizes="(max-width: 600px) 100vw, 25vw"
          priority={priority}
        />
        <button
          onClick={() => onToggleFavorite(product.id)}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorited}
          className={styles.favoriteButton}
        >
          {isFavorited ? "♥" : "♡"}
        </button>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{displayPrice}</p>
        <p className={styles.rating}>
          ★ {product.rating.toFixed(1)} ({product.ratingCount})
        </p>
        {!product.inStock && <p className={styles.stockLabel}>Out of stock</p>}
      </div>
    </div>
  );
}