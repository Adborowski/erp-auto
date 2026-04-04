import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { partsCatalog, getAllParts } from '@/data/partsCatalog'
import type { CatalogPart, StockStatus } from '@/data/partsCatalog'
import { useCart } from '@/context/CartContext'
import { formatCurrency, cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Search, ShoppingCart, CheckCircle2, AlertTriangle, XCircle,
  Wrench, Building2, Tag, Layers,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// ─── Stock config ─────────────────────────────────────────────────────────────

const STOCK_CONFIG: Record<StockStatus, { label: string; icon: typeof CheckCircle2; color: string; pill: string }> = {
  in_stock:     { label: 'In Stock',     icon: CheckCircle2,  color: 'text-green-600', pill: 'bg-green-50 text-green-700' },
  low_stock:    { label: 'Low Stock',    icon: AlertTriangle, color: 'text-amber-600', pill: 'bg-amber-50 text-amber-700' },
  out_of_stock: { label: 'Out of Stock', icon: XCircle,       color: 'text-red-500',   pill: 'bg-red-50 text-red-600' },
}

function StockBadge({ status }: { status: StockStatus }) {
  const { label, icon: Icon, pill } = STOCK_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', pill)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  )
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ part }: { part: CatalogPart }) {
  const { addItem, items } = useCart()
  const inCart = items.find(i => i.part.id === part.id)
  const unavailable = part.stockStatus === 'out_of_stock'

  function handleAdd() {
    addItem(part)
    toast.success(`Added to cart`, {
      description: part.name,
    })
  }

  return (
    <div className="flex flex-col rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Product image placeholder */}
      <div className="flex h-36 items-center justify-center bg-slate-50 border-b">
        <Wrench className="h-12 w-12 text-slate-200" />
      </div>

      <div className="flex flex-1 flex-col p-4 gap-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{part.name}</p>
            <StockBadge status={part.stockStatus} />
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">{part.partNumber}</p>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 flex-1">{part.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Building2 className="h-3.5 w-3.5" />
          {part.supplier}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(part.unitCost)}</p>
            <p className="text-[11px] text-slate-400">per unit</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={unavailable}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
              unavailable
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : inCart
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-900 text-white hover:bg-slate-700',
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {unavailable ? 'Unavailable' : inCart ? `In cart (${inCart.quantity})` : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Category sidebar ─────────────────────────────────────────────────────────

type CategoryFilter = string | null // category or subcategory id, null = all

function CategorySidebar({
  selected,
  onSelect,
}: {
  selected: CategoryFilter
  onSelect: (id: CategoryFilter) => void
}) {
  return (
    <nav className="space-y-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left font-medium',
          selected === null ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
        )}
      >
        All Parts
      </button>

      {partsCatalog.map(cat => (
        <div key={cat.id}>
          <button
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left',
              selected === cat.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100',
            )}
          >
            <Layers className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
            <span className="font-medium">{cat.name}</span>
          </button>
          <div className="ml-3 mt-0.5 space-y-0.5">
            {cat.subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors text-left',
                  selected === sub.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100',
                )}
              >
                <Tag className="h-3 w-3 flex-shrink-0 opacity-50" />
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

// ─── Stock filter ─────────────────────────────────────────────────────────────

type StockFilter = 'all' | 'available' | 'low_stock'

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('q') ?? ''

  const [search, setSearch]           = useState(initialSearch)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(null)
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')

  const allParts = useMemo(() => getAllParts(partsCatalog), [])

  const filtered = useMemo(() => {
    let parts = allParts

    // Category / subcategory filter
    if (categoryFilter) {
      const cat = partsCatalog.find(c => c.id === categoryFilter)
      if (cat) {
        parts = cat.subcategories.flatMap(s => s.parts)
      } else {
        // Try subcategory
        for (const c of partsCatalog) {
          const sub = c.subcategories.find(s => s.id === categoryFilter)
          if (sub) { parts = sub.parts; break }
        }
      }
    }

    // Stock filter
    if (stockFilter === 'available') {
      parts = parts.filter(p => p.stockStatus !== 'out_of_stock')
    } else if (stockFilter === 'low_stock') {
      parts = parts.filter(p => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock')
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      parts = parts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.partNumber.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.compatibility.some(c => c.toLowerCase().includes(q)),
      )
    }

    return parts
  }, [allParts, categoryFilter, stockFilter, search])

  function handleSearch(value: string) {
    setSearch(value)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      value ? next.set('q', value) : next.delete('q')
      return next
    }, { replace: true })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Category sidebar */}
      <aside className="flex w-56 flex-col border-r bg-white overflow-y-auto flex-shrink-0">
        <div className="border-b px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Categories</p>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <CategorySidebar selected={categoryFilter} onSelect={id => { setCategoryFilter(id) }} />
        </div>

        {/* Stock filter */}
        <div className="border-t p-3 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Availability</p>
          {([
            ['all',        'All items'],
            ['available',  'In / low stock'],
            ['low_stock',  'Needs restocking'],
          ] as [StockFilter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStockFilter(value)}
              className={cn(
                'flex w-full items-center rounded-md px-3 py-1.5 text-xs transition-colors text-left',
                stockFilter === value ? 'bg-slate-900 text-white font-medium' : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-white px-6 py-4 flex items-center gap-4">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">{filtered.length}</span> parts
          </p>
          <div className="relative ml-auto w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search parts, suppliers, vehicles…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Wrench className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">No parts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filtered.map(part => (
                <ProductCard key={part.id} part={part} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
