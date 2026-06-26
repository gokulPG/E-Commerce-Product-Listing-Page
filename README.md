Roast & Ritual — Ecommerce Product Listing Page

A specialty coffee & home-brew equipment storefront.

I picked a concrete product domain (coffee) instead of a generic placeholder catalog so that filters, copy, and design decisions had real substance behind them, rather than being arbitrary.


HLD: https://github.com/gokulPG/E-Commerce-Product-Listing-Page/blob/main/HLD.md

(0) Quick start

cd roast-and-ritual

npm install

npm run dev

Visit http://localhost:3000.

(1) Stack:

- Next.js (App Router) Framework Chosen specifically for SEO — Server Components let the page shell render without waiting on client JS, and real paginated URLs keep listings crawlable. TypeScript to add static type safety, TanStack Query Server state-fetching, caching, loading/error/retry semantics for the product API, without hand-rolling any of it.

- URL search params: Filter/sort/page state. The source of truth for "what view is the user looking at" — shareable, back-button-safe, refresh-safe, with zero custom sync code.

- Zustand + persistClient state - Favorites — genuinely client-owned, needs to survive a page reload, needed in distant components.
- ZodValidationOne schema generates both the Product TypeScript type and runtime validation, so they can never drift apart.
- CSS Modules Styling Scoped, plain CSS per component — no utility-class framework, kept intentionally simple.


(2) Core architectural decision: Three kinds of state, one tool each

Most state-management problems come from treating all states the same way. This project deliberately splits the state into three categories, each owned by the tool actually designed for it:

a) Product data (fetched from a server)TanStack Query has its own lifecycle — loading, caching, staleness, and retries — that a plain state library doesn't model. 

b) Filters, sort, current pageURL search params. Defines "what is the user looking at right now" — should be shareable and survive a refresh. 

c) Favorites - Zustand + persist Client-owned, needs to persist to localStorage, needed in distant components (any product card, anywhere).

Editing the URL by hand (e.g.,?category=brewers&sort=price_desc) correctly filters and sorts with zero component code involved.
The browser's back button correctly restores the previous filter state, because it's real browser history, not a custom state.
Favoriting a product and then hard-refreshing the page keeps it favorited, because Zustand's persist middleware wrote it to localStorage.

(3) Performance optimizations:

1. Lazy-loaded images via next/image

Every product image uses next/image instead of a plain <img> tag. Images below the visible viewport aren't downloaded until the user scrolls near them — this is next/image's default behavior, no custom code needed.

2. Priority on above-the-fold images only

In ProductGrid, the first 4 cards (priority={index < 4}) get eager-loaded since they're visible the instant the page loads. Everything after that stays lazy. This is the deliberate other half of the lazy-loading story — marking everything priority would defeat the purpose entirely.

3. Responsive image sizing (sizes prop)

Each <Image> has sizes="(max-width: 600px) 100vw, 25vw" — tells the browser to fetch an appropriately-sized image for the viewport rather than always downloading the largest version and scaling it down in CSS.
4. React Query caching

Revisiting a filter/sort combination you've already fetched serves from cache (staleTime: 60s) instead of re-hitting the API. Switching from "Beans" → "Brewers" → back to "Beans" doesn't refetch the second time, within that window.

5. CSS Grid auto-fill, minmax() for responsive layout

grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) — the browser computes column count natively. Zero JavaScript, zero media query breakpoints to maintain, no resize listeners.

6. position: sticky filter bar

Pure CSS positioning, no scroll-event JavaScript polling to keep it pinned.

7. Cursor-based pagination ("Load More") instead of loading everything up front

useInfiniteQuery only fetches page 1 initially; later pages load on demand, keeping the initial payload and initial render small.

