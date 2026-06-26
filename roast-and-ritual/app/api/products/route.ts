import { NextRequest, NextResponse } from "next/server";
import { ProductSchema, type Product } from "@/lib/schemas/product";
import seedData from "@/data/seed-products.json";

// Validate our seed data ONCE, at module load time, against our schema.
const allProducts: Product[] = seedData.map((p) => ProductSchema.parse(p));

// Simulating real-world network latency
function simulateLatency() {
  const delay = 300 + Math.random() * 500;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function GET(request: NextRequest) {
  await simulateLatency();

  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const minRating = params.get("minRating");
  const sort = params.get("sort");
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "8");

  let results = [...allProducts];

  // Filtering
  if (category) {
    results = results.filter((p) => p.category === category);
  }
  if (minRating) {
    results = results.filter((p) => p.rating >= Number(minRating));
  }

  // Sorting
  if (sort === "price_asc") {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === "newest") {
    results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const totalItems = results.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const items = results.slice(start, start + pageSize);

  return NextResponse.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
    hasMore: page < totalPages,
  });
}