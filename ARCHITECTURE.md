# Architecture Decisions

A living record of key technology choices made in this project, including alternatives considered and why they were rejected.

---

## 1. Framework: React + TypeScript

**Chosen:** React 19 with TypeScript (strict mode)

React was the natural choice given the requirement for component-based architecture and reusable UI across multiple ERP modules. TypeScript strict mode pays for itself immediately in a domain-heavy codebase — the `ServiceOrder`, `Vehicle`, `Customer` types catch entire classes of bugs at compile time rather than at runtime in a demo.

**Not chosen: Vue.js**
Vue was listed as an alternative in the job description, but React has a larger ecosystem for ERP-adjacent UI patterns (data tables, form libraries, charting). More importantly: faking Vue.js experience in a technical interview is a liability, not an asset.

---

## 2. Build Tool: Vite

**Chosen:** Vite 8

Sub-second HMR and a zero-config TypeScript setup made Vite the obvious choice for a rapid-development context. The `@` path alias is configured once in both `vite.config.ts` and `tsconfig.app.json` so imports stay clean across a growing file tree.

**Not chosen: Next.js**
Next.js would have added SSR, file-based routing, and server components — none of which are relevant to an ERP application that runs behind a login and needs no SEO. The added complexity (server vs. client components, hydration) would cost time without adding anything visible in a demo.

---

## 3. Styling: Tailwind CSS v4 + shadcn/ui

**Chosen:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin) combined with shadcn/ui components

Tailwind enables rapid iteration without context-switching between files. The v4 `@import "tailwindcss"` approach removes the need for a separate config file. shadcn/ui is not a component library — it's a collection of copy-paste components that live in the codebase. This means full control over markup and styling, no runtime dependency, and components that can be adapted to domain needs (e.g. `StatusBadge`, `PriorityBadge`) without fighting a library's opinions.

**Not chosen: Ant Design / MUI**
Both are full component libraries with their own design language. They produce polished output quickly, but customizing them to match a specific visual identity is often harder than building from primitives. In an interview context, "I used Ant Design" is less interesting than "I built a component system on top of Tailwind primitives."

---

## 4. Routing: React Router v7

**Chosen:** `react-router-dom` v7

Declarative `<Routes>` / `<Route>` composition, `useParams`, `useNavigate`, `useSearchParams` — all the primitives needed for a multi-page ERP module without overhead. The nested layout pattern (Sidebar + `<main>`) maps cleanly to the ERP shell structure.

**Not chosen: TanStack Router**
TanStack Router offers fully type-safe routes (route params inferred from the tree), which is genuinely useful in large codebases. However, it requires more upfront setup and the mental model is less familiar in interviews. React Router v7 is recognisable to any React developer and demonstrates the same architectural thinking.

---

## 5. Mock Data: Static TypeScript Modules

**Chosen:** Plain `.ts` files in `src/data/` exporting typed arrays

The data layer is intentionally thin. All domain entities (`ServiceOrder`, `Vehicle`, `Customer`, `LaborItem`, `PartItem`) are defined as TypeScript interfaces in `src/data/types.ts`, and the mock data conforms to those types. This means the entire data layer can be replaced with real API calls (React Query + fetch) by changing one import per page — the component tree doesn't change.

**Not chosen: Mock Service Worker (MSW)**
MSW intercepts network requests and simulates a real API, which is valuable for testing async behavior, loading states, and error handling. For a demo with no async requirements, it adds setup complexity (service worker registration, handler definitions) without any visible benefit.

---

## 6. Charts: Recharts

**Chosen:** Recharts

Recharts renders via SVG, composes as React components, and integrates naturally with Tailwind color tokens. The `<ResponsiveContainer>` wrapper handles resize without additional logic.

**Not chosen: Chart.js (via react-chartjs-2)**
Chart.js uses an imperative, canvas-based API that requires refs and manual cleanup. It works, but it feels like a foreign object inside a React component tree. Recharts' declarative API (`<BarChart><Bar dataKey="count" /></BarChart>`) reads like React and is easier to reason about in a code review.

---

## 7. Icons: Lucide React

**Chosen:** `lucide-react`

Lucide is the icon set used internally by shadcn/ui, so icons are visually consistent with all UI primitives. Every icon is a standalone React component, fully tree-shakeable — only imported icons end up in the bundle.

**Not chosen: Heroicons**
Heroicons has a smaller set and is tied to the Tailwind UI design language. Lucide has broader coverage (important for domain-specific icons like `Wrench`, `Car`, `Package`) and is the more natural pairing with shadcn.

---

## 8. Component Architecture: `ui/` vs `domain/`

**Chosen:** Two-layer component structure

```
src/components/
  ui/       ← shadcn primitives: Button, Card, Badge, Table, Separator
  domain/   ← business components: StatusBadge, StatusPipeline, Sidebar, CategoryTree
```

`ui/` components know nothing about the ERP domain. `domain/` components import from `ui/` and from `src/data/types.ts`. This separation means that swapping out the design system (e.g. replacing shadcn with an internal company library) only touches `ui/` — the domain logic stays intact.

**Not chosen: Flat `components/` folder**
A single flat folder works until it doesn't. In a multi-module ERP with shared domain components, the distinction between "this is a generic button" and "this is a service order status badge" becomes load-bearing. Making it explicit from day one is cheaper than refactoring later.

---

## 9. State Management: Local React State + Context

**Chosen:** `useState` / `useReducer` for local state; React Context for genuinely shared state (`ServiceOrdersContext`)

Filter state (status tab, search query) is local to the page component that owns it. The orders array — which must be shared across Dashboard, Service Orders list, and detail pages — lives in Context, initialized from the static fixture.

**Not chosen: Zustand / Redux Toolkit**
Both are excellent for managing async server state or complex cross-component state. In this codebase, adding either would be pure ceremony. The right time to introduce Zustand would be when there are multiple independent state slices that cross-cut many components — for example, a notification count, active user session, and per-module filters all needing to share state simultaneously.

---

## 10. Optimistic UI: Local Status State

**Decision:** Service Order status is held in `useState` local to `ServiceOrderDetail`, initialized from the context. Advancing status calls `setStatus(nextStatus)` immediately — no async wait, no rollback.

This is the correct pattern for a demo, and also the correct pattern for a real optimistic update: mutate local state first, fire the network request in parallel, and only roll back if the request fails. Since there is no backend here, the rollback path is simply absent. When a real API is wired in, the call site becomes `setStatus(nextStatus); await api.advanceStatus(id, nextStatus)` with a `catch` that calls `setStatus(previousStatus)`.

**Not chosen: Mutating the source array**
Updating the object inside the orders array would produce the same visual result but would be a side effect on shared state — meaning the change would persist across navigation within the same session in a misleading way. Local state resets on unmount, which is the honest behaviour.

---

## 11. URL-Driven Filter State

**Decision:** The active status tab (`status`) and search query (`q`) in Service Orders are stored in URL search params via React Router's `useSearchParams`, not in `useState`. Sort direction stays in `useState` — it's a session preference, not something meaningful to share in a link.

This means `/service-orders?status=in_progress` bookmarks the filtered view, the back button works as expected after drilling into a detail, and a manager can paste a link to a colleague that opens to the right filter. These are table-stakes ERP behaviours that users never notice when present and always complain about when absent.

Two details matter for correctness:
- Each filter update uses the functional `setSearchParams(prev => ...)` form to preserve params independently — changing the status tab doesn't clear the search query and vice versa.
- The search input uses `{ replace: true }` so each keystroke replaces the current history entry rather than pushing a new one. Without this, pressing back after a search would replay every character typed.

**Not chosen: Syncing sort to URL**
Sort direction is a view preference, not a filter. A link to `/service-orders?status=in_progress&sortKey=total&sortDir=desc` has no obvious utility — the recipient likely wants to sort by their own preference. Keeping sort local avoids polluting the URL with state that doesn't serve shareability.

---

## 12. Client-Side Table Sorting

**Decision:** Sort state (`sortKey`, `sortDir`) lives in `useState` local to the `ServiceOrders` page. The sorted array is derived via `useMemo` from the already-filtered list — filter first, then sort, so the sort only operates on the visible subset.

Clicking a header that is already active toggles `asc ↔ desc`. Clicking a new header always starts `asc`. Default is `created desc` (newest first), which matches how most ERP users expect to land on an orders list.

Columns that aren't meaningfully sortable (Vehicle, Customer — multi-field composites) render as plain `TableHead` with no sort control. Adding a sort indicator to a column that isn't being sorted creates confusion about what the current sort actually is.

**Not chosen: A generic `useSort` hook**
Extracting sort logic into a reusable hook would be the right call if three or more tables needed sorting. For one table, the abstraction adds a layer of indirection with no concrete benefit yet. The rule: extract when you have a second consumer, not before.

---

## 13. Cross-Module Navigation: Parts Requisition Deep Link

**Decision:** Part numbers in Service Order detail are `<Link>` elements pointing to `/parts-catalog?part=PART-NUMBER`. The Parts Catalog reads the `?part=` param on mount and initializes `selectedId`, `selectedType`, and `selectedPart` state from it — placing the user directly on the right subcategory with the part expanded and the summary panel open. The URL is also kept in sync as the user interacts: selecting a part writes `?part=PART-NUMBER` to the URL (via `replace: true`), and deselecting removes it. This makes any selected part shareable as a direct link, regardless of how the user arrived at it.

The `linkedPart` resolution runs inside a `useMemo` with an intentionally empty dependency array. This is the right pattern here: we only want to resolve the linked part once on mount to seed initial state, not on every render. After mount, all state is owned by the component and driven by user interaction.

The `initialExpanded` prop on `CategoryTree` ensures the correct category is open when arriving via deep link. Without it, the tree would show the linked subcategory as selected (highlighted) but the parent category would be collapsed — the selection would be invisible to the user.

**Not chosen: Linking only catalog-matched part numbers**
An alternative would be to import `findPartByNumber` into `ServiceOrderDetail` and only render a link when the part exists in the catalog. This avoids dead-end navigations (parts used in an order but not stocked in the catalog). The tradeoff is coupling the orders view to catalog data. For now, all part number links are rendered — unmatched ones land on the catalog in its default state, which is an acceptable degradation.

---

## 14. Customers Module: Derived Data vs. Separate Dataset

**Decision:** The Customers module derives its data entirely from `serviceOrders` — no separate customer fixture file. `getCustomers()` in `src/data/customers.ts` iterates the orders once, groups by `customer.id`, and accumulates order lists, total spend, and vehicle counts in a single pass.

This keeps cross-module integrity automatic: any new service order with an existing customer ID automatically appears in that customer's order history. There is no risk of the two datasets drifting apart because there is only one dataset.

A private `calcOrderTotal` function lives in `customers.ts` rather than importing from `lib/utils`. The data layer should not depend on the utility/formatting layer — that dependency direction is wrong. Both call the same arithmetic; duplication here is cheaper than a bad dependency.

**Not chosen: A separate `customers.ts` fixture with denormalised data**
A separate file would let us add customer-specific fields (since date, loyalty tier, notes) that aren't derivable from orders. That's the right move once those fields exist. For now, deriving from orders avoids maintaining two sources of truth for the same facts.

---

## 15. Workshop Schedule View: Pure CSS Gantt Without a Library

**Decision:** The schedule grid is built with CSS flexbox (day columns) and `position: absolute` blocks, driven entirely by date arithmetic. No Gantt chart library was introduced.

Each order block's `left` and `width` are percentages of the 7-day row width, computed from `(dayOffset / 7) * 100`. Blocks are clamped to the visible week so orders that start before or end after the window are still shown partially. The minimum block width is 1 day to avoid zero-width invisible blocks for single-day orders.

**Not chosen: A Gantt chart library (e.g. `dhtmlx-gantt`, `react-gantt-chart`)**
Gantt libraries are large, opinionated, and often require a commercial licence for production use. For a schedule view with 3–4 rows and 7 columns, the entire geometry is ~20 lines of arithmetic. Building it directly produces a result that's visually consistent with the rest of the app (Tailwind tokens, same border radius, same colours) and has no new dependencies.

**Not chosen: Moving ScheduleView to a separate route**
The schedule is a second view on the same data as the dashboard KPIs. Keeping both under `/` with a tab switcher avoids adding a navigation item for something that contextually belongs to the dashboard.

---

## 16. Key Dependencies

A summary of every production dependency and why it was chosen.

| Package | Version | Role | Why |
|---|---|---|---|
| `react` + `react-dom` | 19 | UI framework | Component model, concurrent features, hooks |
| `react-router-dom` | 7 | Client-side routing | Declarative routes, `useParams`, `useSearchParams`, `useNavigate` |
| `tailwindcss` | 4 | Utility CSS | Rapid layout iteration, no CSS files to maintain |
| `@tailwindcss/vite` | 4 | Tailwind v4 Vite plugin | Replaces PostCSS setup; integrates directly into the Vite pipeline |
| `shadcn/ui` (copy-paste) | latest | UI primitives | Button, Card, Badge, Table, Separator, Sonner — owned by the codebase, not a runtime dep |
| `class-variance-authority` | — | Variant styling | Powers shadcn component variants (e.g. badge colors) without manual string concatenation |
| `clsx` + `tailwind-merge` | — | Class merging | `cn()` utility: merges Tailwind classes correctly, resolving conflicts (e.g. `text-sm` vs `text-xs`) |
| `lucide-react` | latest | Icons | Tree-shakeable; same set shadcn uses internally — visual consistency guaranteed |
| `recharts` | 2 | Charts | Declarative SVG, React-native API, `ResponsiveContainer` for resize |
| `sonner` | latest | Toast notifications | Lightweight, production-quality; shadcn wraps it as `<Toaster>` |
| `tw-animate-css` | — | Tailwind animation utilities | Provides `animate-in`, `fade-in`, `duration-*` — used for expand/collapse animations |

---

---

## 18. Shop Surface: Platform Architecture in Practice

**Decision:** The Parts Shop is a second product surface built on top of the same platform layer as the ERP, demonstrating the "component and platform approach" explicitly.

The layer separation is structural:

```
src/components/
  ui/       ← platform — Button, Card, Badge, Separator, Sonner (shared by both surfaces)
  domain/   ← ERP surface — StatusBadge, StatusPipeline, CategoryTree, Sidebar
  shop/     ← (future) shop-specific components — ProductCard, CartDrawer live in layouts for now
src/layouts/
  ERPLayout.tsx   ← sidebar shell
  ShopLayout.tsx  ← top-bar shell with cart drawer
```

`domain/` and shop components never import from each other. Both import from `ui/`. Swapping the design system touches only `ui/` — both surfaces update.

The shop reuses `partsCatalog.ts` data directly — the ERP catalog and the shop sell the same parts. This is the cross-module link the JD asks for: a parts manager sees low-stock items in the ERP catalog with an "Order from shop →" link; the shop is the channel through which those parts are restocked.

`CartContext` is shop-only state. It sits inside `CartProvider` which wraps only the shop routes, making it impossible for ERP pages to accidentally depend on cart state.

**Not chosen: Separate repository / micro-frontend**
A separate repo would make the shared-platform story invisible — an interviewer can't see the `ui/` layer being shared if the code lives elsewhere. A micro-frontend architecture (Module Federation) adds significant build complexity with no benefit at this scale. The monorepo approach with layout-level route splitting is the right tradeoff: one codebase, clearly separated surfaces.

---

## 19. Shop Checkout: State Passed via Router, Not Context

**Decision:** The order confirmation page receives its data (`orderNumber`, `total`, `items`) via React Router's location state (`navigate('/shop/order-confirmed', { state: { ... } })`), not via a separate context or global store.

This is the correct pattern for one-time, transitional state — data that is meaningful at exactly one point in a user journey and has no reason to persist beyond it. Once the user leaves the confirmation page, the data is gone. If they navigate back, they're redirected to the shop. This is honest: an order that has been placed and cleared from the cart should not be reconstructable from frontend state.

The alternative — storing the last order in a `LastOrderContext` — would require remembering to clear it, deciding when it expires, and handling the edge case of a user opening two tabs and placing two orders. Routing state sidesteps all of that.

The checkout's `clearCart()` call happens before navigation, so there's no race between the cart clearing and the confirmation page reading the items. The items snapshot passed to the confirmation page is taken from the cart at submit time.

**Not chosen: Dedicated order history state**
A real e-commerce system would persist completed orders in a database and expose an order history page. In this demo there's no backend, and adding a frontend-only order history (accumulated in context) would be misleading — it would reset on refresh and suggest persistence that doesn't exist. The confirmation page is deliberately the end of the road.

---

# Plans for the Future

This section describes how each demo-specific decision would evolve in a production system — what technologies would be introduced, why, and what would change in the codebase.

---

## F1. Server Data Fetching: React Query

**Current state:** All data is imported from static `.ts` modules. `ServiceOrdersContext` holds the orders array in `useState`.

**Production approach:** Replace static imports with **TanStack Query (React Query v5)**.

Each page's data dependency becomes a typed query hook:

```ts
// src/hooks/useServiceOrders.ts
export function useServiceOrders() {
  return useQuery({
    queryKey: ['service-orders'],
    queryFn: () => api.get<ServiceOrder[]>('/service-orders'),
  })
}

// src/hooks/useServiceOrder.ts
export function useServiceOrder(id: string) {
  return useQuery({
    queryKey: ['service-orders', id],
    queryFn: () => api.get<ServiceOrder>(`/service-orders/${id}`),
  })
}
```

The component tree doesn't change. `ServiceOrdersContext` is removed — React Query's cache is the shared state layer. Loading and error states are handled once at the hook level, not scattered across components.

Mutations (status advancement, new order creation) use `useMutation` with `onMutate` for optimistic updates and `onError` for rollback:

```ts
const advanceStatus = useMutation({
  mutationFn: (nextStatus: ServiceOrderStatus) =>
    api.patch(`/service-orders/${id}/status`, { status: nextStatus }),
  onMutate: (nextStatus) => {
    // optimistic update — already implemented in the demo as local useState
    queryClient.setQueryData(['service-orders', id], old => ({ ...old, status: nextStatus }))
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['service-orders', id], context.previousOrder)
  },
})
```

**Why React Query over SWR or Apollo:**
React Query is framework-agnostic (not tied to GraphQL like Apollo), has better devtools, and the v5 API is more explicit about query keys. SWR is lighter but has a smaller ecosystem and less expressive cache invalidation.

---

## F2. API Layer: Typed HTTP Client with Zod Validation

**Current state:** No HTTP layer exists.

**Production approach:** A thin typed API client wrapping `fetch`, with **Zod** for runtime response validation at the boundary.

```ts
// src/lib/api.ts
const api = {
  get: async <T>(path: string, schema: ZodType<T>): Promise<T> => {
    const res  = await fetch(`${import.meta.env.VITE_API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) throw new ApiError(res.status, await res.json())
    return schema.parse(await res.json())
  },
}
```

Zod schemas are derived from the existing TypeScript interfaces in `src/data/types.ts` — the types don't change, they gain a runtime validator alongside them. This means any drift between the API contract and the frontend types is caught at the network boundary, not at render time when the bug is hard to trace.

**Why Zod over io-ts or pure TypeScript:**
Zod's API is the closest to TypeScript's type syntax — a developer already familiar with the interfaces can write a Zod schema with minimal friction. io-ts is more principled but significantly more verbose.

---

## F3. Authentication: Token-Based Auth with a Protected Layout

**Current state:** No authentication. The app is fully public.

**Production approach:** JWT-based auth with a protected route wrapper.

The implementation has two parts:

1. **Auth context** — stores the token and current user, exposes `login()` / `logout()`. Token is persisted in `localStorage` (or `sessionStorage` for stricter security) and included in every API request header.

2. **Protected layout** — a route wrapper that reads from auth context and redirects to `/login` if unauthenticated:

```tsx
function ProtectedLayout() {
  const { token } = useAuth()
  return token ? <Outlet /> : <Navigate to="/login" replace />
}
```

All existing routes nest under `ProtectedLayout`. The Sidebar footer (currently showing a hard-coded "Klaus Weber") becomes dynamic from the auth context — `user.name`, `user.role`, `user.avatar`.

Role-based access is a natural extension: a `technician` role sees only their own orders in the schedule view; a `manager` role sees all. This is enforced at the API level but the frontend can also conditionally render actions (e.g. the "Advance Status" button).

---

## F4. Real-Time Updates: WebSockets or Server-Sent Events

**Current state:** Status changes are optimistic and local — other users in the workshop don't see them.

**Production approach:** Push updates via **Server-Sent Events (SSE)** for read-heavy streams, or **WebSockets** if bidirectional communication is needed.

SSE is the right default for an ERP: the server pushes order status changes, new orders, and technician assignments to all connected clients. The client doesn't need to send data over the same channel (mutations go through the REST API).

Integration with React Query: the SSE handler calls `queryClient.invalidateQueries(['service-orders'])` or uses `queryClient.setQueryData` for surgical updates when a status change event arrives. Components re-render automatically.

```ts
// src/hooks/useOrderUpdates.ts
export function useOrderUpdates() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const es = new EventSource('/api/events', { withCredentials: true })
    es.addEventListener('order:status_changed', e => {
      const { id, status } = JSON.parse(e.data)
      queryClient.setQueryData(['service-orders', id], old => ({ ...old, status }))
      queryClient.invalidateQueries({ queryKey: ['service-orders'] })
    })
    return () => es.close()
  }, [queryClient])
}
```

**Why SSE over WebSockets for this use case:**
SSE is HTTP/1.1 compatible, automatically reconnects, and is simpler to proxy through standard infrastructure. WebSockets require a separate upgrade handshake and stateful server connections. For a workshop ERP where the server pushes status changes and the client doesn't need to send a high-frequency stream back, SSE is the right tool.

---

## F5. Error Handling: Error Boundaries + Typed API Errors

**Current state:** No error handling. A missing order shows a simple "not found" message; no other failure modes are handled.

**Production approach:** Two layers.

**React Error Boundaries** catch render errors and display a fallback UI rather than crashing the whole app. Each module (Service Orders, Parts Catalog, Customers) gets its own boundary so a failure in one doesn't affect the others.

**API error handling** is centralised in the HTTP client (see F2). The `ApiError` class carries the HTTP status and a typed error body. React Query's `onError` callbacks handle specific cases:
- `401 Unauthorized` → clear auth token, redirect to login
- `403 Forbidden` → show "insufficient permissions" toast
- `422 Unprocessable Entity` → surface validation errors inline in the form that triggered the request
- `5xx` → show a generic "something went wrong, try again" toast with a retry button

---

## F6. Testing Strategy

**Current state:** No tests.

**Production approach:** Three layers, each with a clear purpose.

**Unit tests (Vitest):** Pure functions in `src/lib/utils.ts` and data derivation functions in `src/data/customers.ts`. Fast, no DOM needed.

**Component tests (React Testing Library + Vitest):** Domain components like `StatusPipeline`, `CategoryTree`, and `StatusBadge`. Tests verify rendered output given props, not implementation details.

**End-to-end tests (Playwright):** Critical user journeys: create a service order → advance it through the pipeline → verify it appears in the customer's order history. These run against a real browser and catch integration failures that unit tests miss. For a workshop ERP, the key journeys are short (3–5 steps) and highly deterministic — ideal for E2E coverage.

**Not planned: Snapshot tests**
Snapshot tests catch accidental visual regressions but create noise during intentional UI changes. For a rapidly evolving product, the maintenance cost outweighs the benefit until the design system is stable.

---

## F7. State Management Evolution: When to Add Zustand

**Current state:** Local `useState` + one Context for shared orders.

**The trigger:** When three or more of these exist simultaneously:
- Notifications that increment from WebSocket events and are read by both the Sidebar badge and a dropdown
- A "currently impersonating customer" state used by Service Orders, Customers, and the new order form
- Per-module filter preferences that should survive navigation (e.g. last-used status filter remembered across page visits)
- A shopping cart shared between the parts catalog and a checkout flow

At that point, prop drilling and multiple contexts become tangled. Zustand solves this with minimal boilerplate:

```ts
// src/store/notifications.ts
export const useNotificationStore = create<NotificationState>(set => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 })),
  clear:     () => set({ count: 0 }),
}))
```

Each slice is independent, composable, and trivially testable. The rest of the codebase doesn't change — only the components reading that specific slice are updated.
