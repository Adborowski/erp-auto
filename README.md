# AutoServ — Automotive Workshop ERP

A frontend demo for an automotive ERP system, built as a Greenfield project to explore what a modern, component-driven ERP interface looks like in React.

The project covers two distinct ERP domains deliberately: **workshop service management** (service orders, technician workflow, customer vehicles) and **parts & inventory** (hierarchical parts catalog with supplier and stock data). This reflects the dual nature of automotive ERP — operational workshop tools and supply chain management sit in the same product.

---

## What's built

### Service Orders module
The core of a workshop ERP. A service order tracks a vehicle from arrival to delivery.

- **Dashboard** — KPI cards (active orders, ready for pickup, revenue), orders-by-status chart, recent orders list with urgent-priority indicators
- **Service Orders list** — searchable, filterable table across all orders; filter tabs by status with live counts
- **Service Order detail** — full order view with a visual status pipeline, vehicle & customer info, complaint/diagnosis, labor line items, parts line items, and grand total. Advance-status action with toast feedback.

The status pipeline (`Received → Diagnosed → In Progress → Quality Check → Ready → Delivered`) is the centrepiece of the detail view. It's the workflow that every workshop lives by.

### Parts Catalog module
A hierarchical browser for the workshop parts inventory.

- Two-panel layout: collapsible category tree (Category → Subcategory) on the left, parts list on the right
- Click any part to expand inline detail: supplier, stock status, lead time, compatibility tags
- A third panel appears on the right with a part summary when a part is selected
- Cross-module data integrity: part numbers in the catalog (e.g. `BMW-11-42-8-575-211`, `AUDI-06H-906-051-A`) match those used in service order line items

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
    domain/      # Business components — StatusBadge, StatusPipeline, CategoryTree, Sidebar
  pages/
    Dashboard/
    ServiceOrders/
    ServiceOrderDetail/
    PartsCatalog/
  data/
    types.ts          # All domain interfaces — ServiceOrder, Vehicle, Customer, CatalogPart...
    serviceOrders.ts  # 6 realistic mock orders with German market data
    partsCatalog.ts   # 20 parts across 4 categories, cross-referenced with service order data
  lib/
    utils.ts     # Formatters, STATUS_CONFIG, PRIORITY_CONFIG, STATUS_STEPS
```

The `ui/` vs `domain/` split is intentional. `ui/` components are design-system primitives with no knowledge of the ERP domain. `domain/` components import from `ui/` and from `data/types.ts`. This mirrors how a real platform team would structure a component library: the design system is stable, domain logic is layered on top.

---

## Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 19 + TypeScript (strict) | Component architecture, type-safe domain models |
| Build | Vite 8 | Sub-second HMR, zero-config TS |
| Styling | Tailwind CSS v4 + shadcn/ui | Utility-first speed; shadcn components live in the codebase, not a node_modules black box |
| Routing | React Router v7 | Standard declarative routing, no overhead |
| Charts | Recharts | Declarative SVG, React-native API |
| Icons | Lucide React | Same icon set shadcn uses internally; tree-shakeable |
| Toasts | Sonner | Lightweight, looks production-quality |
| State | useState / useMemo | No global state library needed — data is read-only |

Full rationale for each decision, including alternatives considered and rejected, is in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## What was deliberately left out

**No create/edit forms.** The detail view with a real workflow pipeline demonstrates ERP thinking more clearly than a generic CRUD form, and takes a fraction of the time to build well.

**No authentication.** Irrelevant to demonstrating component architecture and domain modelling.

**No real backend or async data fetching.** The data layer is a thin TypeScript module. Every component that reads data today can be pointed at a React Query hook tomorrow by changing one import — the component tree doesn't care.

**No mobile layout.** Desktop-first is correct for workshop ERP. Technicians work at a desk or a fixed terminal, not a phone.

**No global state library.** Filter state (tabs, search) is local to the page that owns it. There is no shared state between pages that would justify Zustand or Redux.

---

## What comes next in a real product

- Replace `src/data/*.ts` with React Query hooks against a real API
- Add form flows: new service order intake, parts requisition
- Role-based access: workshop manager vs. technician view different pipeline steps
- Real-time updates: service order status changes pushed via WebSocket
- Vehicles and Customers modules (currently stubbed in the sidebar)
