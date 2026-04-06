# AutoServ — Automotive Workshop ERP + Parts Shop

A frontend demo for an automotive ERP system and integrated parts shop, built as a Greenfield project to explore what a modern, component-driven multi-surface product looks like in React.

The project covers three distinct product surfaces sharing a single platform layer: **workshop service management** (service orders, technician workflow, customer vehicles), **parts & inventory** (hierarchical parts catalog with supplier and stock data), and a **customer-facing parts shop** (product grid, cart, checkout, order confirmation). This reflects the dual nature of automotive ERP — operational workshop tools, supply chain management, and a B2C/B2B sales channel sitting in the same product.

---

## What's built

### Service Orders module
The core of a workshop ERP. A service order tracks a vehicle from arrival to delivery.

- **Dashboard** — KPI cards (active orders, ready for pickup, revenue), orders-by-status chart, recent orders list, workshop schedule view (Gantt grid by technician)
- **Service Orders list** — searchable, filterable table; URL-driven filter state (`?status=in_progress`); sortable columns (order number, date, status, priority, total)
- **Service Order detail** — full order view with a visual status pipeline, vehicle & customer info, complaint/diagnosis, labor and parts line items, grand total. Advance-status action with live optimistic UI update
- **New Service Order wizard** — 4-step intake form: customer lookup/create → vehicle → complaint + priority → review & confirm. New orders appear live across all pages

### Customers module
Relational data across modules — every customer is derived from their order history.

- **Customer list** — searchable table with order count and total spent
- **Customer detail** — contact info, spend breakdown (labor vs. parts), vehicle list, full order history linking back to service order detail pages

### Parts Catalog module
A hierarchical browser for the workshop parts inventory.

- Two-panel layout: collapsible category tree on the left, parts list on the right
- Inline part detail with supplier, stock status, lead time, compatibility tags
- Third summary panel appears when a part is selected
- **Cross-module links:** part numbers in service orders link directly to the catalog with the part pre-selected. Low and out-of-stock parts show an "Order from shop →" link
- URL-synced selected part (`?part=PART-NUMBER`) — shareable deep links

### Workshop Schedule view
A Gantt-style grid on the dashboard, built without a chart library.

- Technician rows × 7-day columns; order blocks positioned by date arithmetic
- Week navigation (prev / next / this week), today marker, status colour legend
- Each block links to the service order detail page

### Parts Shop
A customer-facing shop built on the same platform layer as the ERP — different shell, shared design system.

- **Shop** (`/shop`) — product grid with category sidebar, availability filter ("needs restocking"), search (URL-synced). "Add to cart" with live in-cart quantity indicator
- **Cart** (`/shop/cart`) — editable quantities, remove, clear, line totals, VAT (19%), free shipping, grand total
- **Checkout** (`/shop/checkout`) — contact, shipping address, payment method selector (card / SEPA / invoice). Validates required fields before enabling Place Order
- **Order confirmation** (`/shop/order-confirmed`) — order number, item summary, total. Guards against direct navigation
- Cart drawer accessible from the shop top bar on every shop page

---

## Platform architecture

The ERP and the shop are two separate product surfaces sharing a single platform layer:

```
src/components/
  ui/       ← platform: Button, Card, Badge, Table, Separator (no domain knowledge)
  domain/   ← ERP surface: StatusBadge, StatusPipeline, CategoryTree, Sidebar
src/layouts/
  ERPLayout.tsx   ← sidebar shell
  ShopLayout.tsx  ← top-bar shell with cart drawer
```

`ui/` components know nothing about either surface. Swapping the design system touches only `ui/` — both the ERP and the shop update. This mirrors how a real platform team structures a component library at scale.

---

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. No backend, no environment variables — all data is static and typed.

---

## Project structure

```
src/
  components/
    ui/          # shadcn/ui primitives — Button, Card, Badge, Table, Separator, Sonner
    domain/      # ERP components — StatusBadge, StatusPipeline, CategoryTree, Sidebar
  context/
    ServiceOrdersContext.tsx  # Shared orders state (ERP-wide)
    CartContext.tsx            # Cart state (shop-only)
  layouts/
    ERPLayout.tsx   # Sidebar shell for all ERP routes
    ShopLayout.tsx  # Top-bar shell + cart drawer for all shop routes
  pages/
    Dashboard/            # KPI overview + workshop schedule tab
    ServiceOrders/        # Filterable, sortable orders list
    ServiceOrderDetail/   # Order detail + status pipeline
    NewServiceOrder/      # 4-step intake wizard
    Customers/            # Customer list
    CustomerDetail/       # Customer detail + order history
    PartsCatalog/         # Two-panel catalog browser
    Shop/                 # Product grid
    Shop/Cart/            # Cart page
    Shop/Checkout/        # Checkout form
    Shop/OrderConfirmed/  # Confirmation page
  data/
    types.ts          # All domain interfaces
    serviceOrders.ts  # 6 realistic mock orders with German market data
    partsCatalog.ts   # 20 parts across 4 categories, cross-referenced with order data
    customers.ts      # Derived from serviceOrders — no separate fixture
  lib/
    utils.ts     # Formatters, STATUS_CONFIG, PRIORITY_CONFIG, STATUS_STEPS, cn()
```

---

## Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 19 + TypeScript (strict) | Component architecture, type-safe domain models |
| Build | Vite 8 | Sub-second HMR, zero-config TS |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first speed; shadcn components live in the codebase, not a node_modules black box |
| Routing | React Router v7 | Declarative routing, `useSearchParams` for URL-driven filter state |
| Charts | Recharts | Declarative SVG, React-native API |
| Icons | Lucide React | Same icon set shadcn uses internally; tree-shakeable |
| Toasts | Sonner | Lightweight, production-quality |
| State | useState / Context | Local state for UI; Context for cross-page shared state (orders, cart) |

Full rationale for each decision, including alternatives considered and rejected, is in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## What was deliberately left out

**No real backend or async data fetching.** The data layer is a thin TypeScript module. Every component that reads data today can be pointed at a React Query hook tomorrow by changing one import — the component tree doesn't change. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full migration plan.

**No authentication.** Irrelevant to demonstrating component architecture and domain modelling.

**No mobile layout.** Desktop-first is correct for workshop ERP. Technicians work at a desk or a fixed terminal.

**No real payment processing.** The checkout form demonstrates the UX pattern; no payment gateway is integrated.

---

## What comes next in a real product

- Replace `src/data/*.ts` with React Query hooks against a real API
- JWT authentication with role-based access (workshop manager vs. technician)
- Real-time status updates via Server-Sent Events (WebSocket for bidirectional)
- Zod schema validation at the API boundary
- Vitest unit tests + Playwright E2E for critical journeys
- Vehicles module (currently stubbed in the sidebar)
