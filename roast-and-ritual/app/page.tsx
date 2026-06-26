import { Suspense } from "react";
import ProductsPageContent from "./ProductsPageContent";

export default function Home() {
  return (
    <Suspense fallback={<p style={{ padding: 16 }}>Loading…</p>}>
      <ProductsPageContent />
    </Suspense>
  );
}