Roast & Ritual — Ecommerce Product Listing Page

A specialty coffee & home-brew equipment storefront.

I picked a concrete product domain (coffee) instead of a generic placeholder catalog so that filters, copy, and design decisions had real substance behind them, rather than being arbitrary.


Quick start
cd roast-and-ritual
npm install
npm run dev

Visit http://localhost:3000.

Stack:

- Next.js (App Router) Framework Chosen specifically for SEO — Server Components let the page shell render without waiting on client JS, and real paginated URLs keep listings crawlable. TypeScript to add static type safety, TanStack Query Server state-fetching, caching, loading/error/retry semantics for the product API, without hand-rolling any of it.

- URL search params: Filter/sort/page state. The source of truth for "what view is the user looking at" — shareable, back-button-safe, refresh-safe, with zero custom sync code.

- Zustand + persistClient stateFavorites — genuinely client-owned, needs to survive a page reload, needed in distant components.
- ZodValidationOne schema generates both the Product TypeScript type and runtime validation, so they can never drift apart.
- CSS Modules Styling Scoped, plain CSS per component — no utility-class framework, kept intentionally simple.


The core architectural decision: three kinds of state, one tool each

Most state-management problems come from treating all states the same way. This project deliberately splits the state into three categories, each owned by the tool actually designed for it:

a) Product data (fetched from a server)TanStack Query has its own lifecycle — loading, caching, staleness, and retries — that a plain state library doesn't model. 

b) Filters, sort, current pageURL search params. Defines "what is the user looking at right now" — should be shareable and survive a refresh. 

c) Favorites - Zustand + persist Client-owned, needs to persist to localStorage, needed in distant components (any product card, anywhere).

This isn't just a design choice on paper — it's demonstrated live in the app:

Editing the URL by hand (e.g.,?category=brewers&sort=price_desc) correctly filters and sorts with zero component code involved.
The browser's back button correctly restores the previous filter state, because it's real browser history, not a custom state.
Favoriting a product and then hard-refreshing the page keeps it favorited, because Zustand's persist middleware wrote it to localStorage.
