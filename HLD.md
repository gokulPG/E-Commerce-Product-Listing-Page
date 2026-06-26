# High-Level Design — Roast & Ritual (E-Commerce Product Listing Page)

This is the as-built system design document — it reflects what was actually shipped, including the deviations made along the way and why.

---

## 1. Problem Statement

Build a Product Listing Page (PLP) that:
- Lists products (image, name, price, category, rating)
- Filters by category and rating
- Sorts by price (ascending/descending)
- Supports favoriting, with a visible highlight on favorited products, persisted across sessions
- Is responsive, with lazy-loaded images and a sticky filter/sort bar
- Supports pagination (stretch goal)

**Product domain:** Roast & Ritual — a specialty coffee & home-brew equipment store. A concrete domain produces sharper, more defensible filter and data-model decisions than a generic placeholder catalog, and gives the UI a real point of view.

---

## 2. System Context

```
                    ┌────────────────────────────────────────
                    │           Browser (Client)            │
                    │                                       │
                    │   Next.js App Router (RSC + CSR)      │
                    │   ┌─────────────────────────────┐     │
                    │   │  TanStack Query             │     │
                    │   │  (server-state cache)       │     │
                    │   └──────────────┬──────────────┘     │
                    │                  │                    │
                    │   ┌──────────────▼──────────────┐     │
                    │   │  Zustand (favorites store,  │     │
                    │   │  persisted to localStorage) │     │
                    │   └─────────────────────────────┘     │ 
                    │                                       │
                    │   URL search params = filter/sort/    │
                    │   page state (source of truth)        │
                    └────────────────┬──────────────────────┘
                                     │ fetch()
                    ┌────────────────▼───────────────────────┐
                    │  Next.js Route Handler                 │
                    │  GET /api/products                     │
                    │  — filters, sorts, paginates           │
                    │  — Zod-validates seed data at startup  │
                    │  — artificial latency (honest loading  │
                    │    states, not faked)                  │
                    │  — backed by static JSON "DB"          │
                    └────────────────────────────────────────┘
```

---

## 3. Why Next.js, specifically

| Capability | Why it matters here |
|---|---|
| App Router + Server Components | The page shell renders without waiting on client JS — directly serves SEO, which is the explicit reason Next.js was chosen over a plain React SPA. |
| Route Handlers | A real API boundary (`/api/products`) without a separate backend service. |
| `next/image` | Automatic lazy-loading, responsive sizing, layout-shift prevention — satisfies the "lazy-loading images" requirement via the framework rather than a hand-rolled `IntersectionObserver`. |
| `useSearchParams` / `usePathname` | Backing store for filter/sort/page state that's shareable and crawlable. |

**Real cost incurred, not just a theoretical one:** the App Router enforces a hard distinction between what can run at build time (static prerendering) and what needs request-time data. `useSearchParams()` falls in the second category — using it without a `<Suspense>` boundary fails the production build outright (`next build`), not just a lint warning. This was hit and fixed during implementation (see Section 8).

---

## 4. The Three State Domains (the architectural core)

| State domain | Examples | Owner | Why this owner |
|---|---|---|---|
| **Server state** | Product list | **TanStack Query** | Has its own lifecycle — staleness, caching, retries — that a plain state library doesn't model. |
| **URL state** | Category, rating, sort, page | **`useSearchParams` / `router.push`** | Defines "what view is the user looking at" — shareable, back-button-safe, refresh-safe by construction, with no custom sync code. |
| **Client/persisted state** | Favorites | **Zustand + `persist` middleware** | Genuinely client-owned, needs to survive a reload, read from distant components. |

No state lives in more than one of these. Favorites are never put in the URL; product data is never put in Zustand; filters are never duplicated into component state. This separation was proven, not just designed:
- Editing the URL bar by hand correctly filters/sorts with zero component code touched.
- The browser back button correctly restores prior filter state, because it's native history.
- Favoriting, then hard-refreshing, preserves favorited state, because `persist` actually wrote to `localStorage`.

---

## 5. Pagination Strategy

**Decision: "Load More" button, backed by `useInfiniteQuery`.**

Initial instinct was infinite scroll (more technically flashy), but it directly conflicts with the SEO rationale behind choosing Next.js in the first place: JS-driven infinite scroll isn't reliably crawled, and loses scroll position on back-navigation. A discrete "Load More" button keeps the same technical substance (cursor-based fetching, cache merging across pages via `useInfiniteQuery`) while staying aligned with the project's own stated priorities.

`getNextPageParam` reads a `hasMore` flag returned by the API, so the client never needs to guess whether more data exists.

---

## 6. Data Model & API Contract

```ts
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;            // integer, smallest currency unit — avoids float rounding errors
  currency: 'INR';
  images: { url: string; alt: string; width: number; height: number }[];
  category: 'beans' | 'brewers' | 'grinders' | 'accessories';
  rating: number;            // 0–5
  ratingCount: number;
  roastLevel?: 'light' | 'medium' | 'dark'; // beans-specific
  inStock: boolean;
  createdAt: string;         // ISO date
};

// GET /api/products
// Query params: category?, minRating?, sort? ('price_asc'|'price_desc'|'newest'), page?, pageSize?
type ProductsResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
};
```

This single schema (defined once with Zod) generates **both** the TypeScript type and the runtime validation — they cannot drift apart, because one is derived from the other (`z.infer<typeof ProductSchema>`).

**Why price is an integer, not a float:** floating-point numbers can't represent all decimals exactly. Storing money as a whole-number smallest-unit value avoids an entire class of rounding bugs; conversion to a displayable amount happens only at the rendering edge.

---

## 7. Component Architecture

Presentational components own zero state and no data-fetching logic — they take props and render, full stop:

```
ProductCard       — image, name, price, rating, favorite toggle, out-of-stock & favorited states
ProductGrid        — responsive grid; owns loading/error/empty state rendering
CategoryFilter      — category selection, controlled via props
RatingFilter        — rating threshold selection, controlled via props
SortDropdown        — native <select>, controlled via props
LoadMoreButton      — pagination trigger, controlled via props
```

This was proven in practice, not just asserted: favorites were first implemented with a temporary `useState`, then swapped for the real Zustand store — with **zero changes** required in `ProductGrid` or `ProductCard`. Neither component knows or cares where its data comes from.

**Known, self-flagged duplication:** `CategoryFilter.module.css` and `RatingFilter.module.css` contain near-identical button styling. Left as-is given time constraints; the fix would be extracting a shared `FilterButton` component.

---

## 8. What Was Actually Debugged (real issues, real fixes)

| Issue | Root cause | Fix |
|---|---|---|
| `next build` failed: "useSearchParams() should be wrapped in a suspense boundary" | `useSearchParams()` reads request-time data; can't be statically prerendered | Split `page.tsx` into a static shell + `<Suspense>`-wrapped `ProductsPageContent` |
| `next/image` rejected remote images | Next.js refuses to optimize images from unlisted domains, by design (a real security/performance guard) | Allowlisted the image host via `images.remotePatterns` in `next.config.ts` |
| Favorites didn't survive a refresh on first attempt | Favorites were stored in a JS `Set`, which doesn't survive `JSON.stringify`/`parse` — exactly what `persist` middleware uses | Switched internal storage to an array (serializes correctly); converted to a `Set` only at the UI boundary for fast lookups |
| `next/font/google` failed at build time | No network access to Google's font CDN in a restricted environment | Switched to self-hosted fonts via Fontsource (npm packages) — arguably the better production choice regardless, since it avoids any external request or third-party tracking exposure |

---

## 9. Performance Strategy (as implemented)

| Technique | Where |
|---|---|
| `next/image` lazy-loading (default behavior) | All product images below the first row |
| `priority` prop on first-row images only | `ProductGrid` passes `priority={index < 4}` — eager-loads what's instantly visible, lazy-loads the rest |
| React Query caching | Revisiting a previously-fetched filter combination serves from cache instead of refetching |
| `position: sticky` filter bar | Stays accessible while scrolling, without JS scroll listeners |
| CSS Grid `auto-fill, minmax()` | Fully responsive column count with zero media queries and zero JS |

---

## 10. Known, Deliberate Gaps

- **No user-entered form.** This problem's brief is a listing page, not a CRUD form (that requirement belonged to a different problem in the original assignment set). Validation is demonstrated at the data layer: seed data is validated against the `Product` Zod schema at server startup.
- **No automated tests.** The architecture (pure filter logic, prop-driven presentational components) is structured to make this cheap, but the tests themselves weren't written given time constraints.
- **Placeholder product images**, not licensed product photography — a production version would use owned imagery on owned infrastructure.
- **No real backend** — the API contract is designed so a real database swaps in with zero frontend changes; that boundary is the actual point.

---

## 11. Decision Log

| Decision | Choice | Primary driver |
|---|---|---|
| Framework | Next.js (App Router) | SEO / SSR |
| Server state | TanStack Query | Caching/loading/error semantics for free |
| Client/persisted state | Zustand | Minimal boilerplate, built-in persistence |
| Filter/sort/page state | URL search params | Shareability, no sync bugs, SEO |
| Pagination | "Load More" (URL-paginated) over infinite scroll | Consistent with the SEO rationale; avoids known infinite-scroll UX problems |
| Validation | Zod | One schema, both type and runtime check |
| Styling | CSS Modules | No new framework syntax to learn alongside Next.js/React Query/Zustand |
| Images | `next/image` + self-hosted fonts (Fontsource) | Lazy-loading + CLS prevention; no external font CDN dependency |
| `npm audit` PostCSS advisory | Left unfixed | Transitive-only risk; suggested fix downgrades Next.js by 7 major versions |