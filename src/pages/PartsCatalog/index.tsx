import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { partsCatalog, getAllParts, findSubcategory, findPartByNumber } from '@/data/partsCatalog'
import type { CatalogPart, StockStatus } from '@/data/partsCatalog'
import { CategoryTree } from '@/components/domain/CategoryTree'
import { formatCurrency, cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Search, Package, AlertTriangle, XCircle, CheckCircle2, ChevronRight, Building2, Clock } from 'lucide-react'

const STOCK_CONFIG: Record<StockStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  in_stock:     { label: 'In Stock',     icon: CheckCircle2,   color: 'text-green-600' },
  low_stock:    { label: 'Low Stock',    icon: AlertTriangle,  color: 'text-amber-600' },
  out_of_stock: { label: 'Out of Stock', icon: XCircle,        color: 'text-red-500' },
}

function StockBadge({ status }: { status: StockStatus }) {
  const { label, icon: Icon, color } = STOCK_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', color)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function CompatibilityTags({ models }: { models: string[] }) {
  const show = models.slice(0, 3)
  const rest = models.length - show.length
  return (
    <div className="flex flex-wrap gap-1">
      {show.map(m => (
        <span key={m} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{m}</span>
      ))}
      {rest > 0 && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">+{rest} more</span>
      )}
    </div>
  )
}

export default function PartsCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const linkedPart = useMemo(() => {
    const pn = searchParams.get('part')
    return pn ? findPartByNumber(partsCatalog, pn) : null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty: only resolve on mount for initial state

  const [selectedId, setSelectedId] = useState<string | null>(
    linkedPart?.subcategoryId ?? partsCatalog[0]?.id ?? null,
  )
  const [selectedType, setSelectedType] = useState<'category' | 'subcategory'>(
    linkedPart ? 'subcategory' : 'category',
  )
  const [search, setSearch] = useState('')
  const [selectedPart, setSelectedPart] = useState<CatalogPart | null>(linkedPart?.part ?? null)

  const allParts = useMemo(() => getAllParts(partsCatalog), [])

  const visibleParts = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase()
      return allParts.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.supplier.toLowerCase().includes(q) ||
          p.compatibility.some(c => c.toLowerCase().includes(q)),
      )
    }

    if (!selectedId) return allParts

    if (selectedType === 'subcategory') {
      return findSubcategory(partsCatalog, selectedId)?.parts ?? []
    }

    const category = partsCatalog.find(c => c.id === selectedId)
    return category ? category.subcategories.flatMap(s => s.parts) : allParts
  }, [selectedId, selectedType, search, allParts])

  function selectPart(part: CatalogPart | null) {
    setSelectedPart(part)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      part ? next.set('part', part.partNumber) : next.delete('part')
      return next
    }, { replace: true })
  }

  function handleSelect(id: string, type: 'category' | 'subcategory') {
    setSelectedId(id)
    setSelectedType(type)
    selectPart(null)
    setSearch('')
  }

  const breadcrumb = useMemo(() => {
    if (search.trim()) return `Search results for "${search}"`
    if (!selectedId) return 'All Parts'
    if (selectedType === 'subcategory') {
      for (const cat of partsCatalog) {
        const sub = cat.subcategories.find(s => s.id === selectedId)
        if (sub) return `${cat.name} › ${sub.name}`
      }
    }
    return partsCatalog.find(c => c.id === selectedId)?.name ?? 'All Parts'
  }, [selectedId, selectedType, search])

  return (
    <div className="flex flex-1 overflow-hidden bg-slate-50">
      {/* Left: category tree */}
      <aside className="flex w-56 flex-col border-r bg-white overflow-y-auto">
        <div className="border-b px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Parts Catalog</p>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <CategoryTree
            catalog={partsCatalog}
            selectedId={selectedId}
            onSelect={handleSelect}
            initialExpanded={
              linkedPart
                ? new Set([linkedPart.categoryId, partsCatalog[0]?.id])
                : undefined
            }
          />
        </div>
      </aside>

      {/* Center: parts list */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-white px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 min-w-0">
            <Package className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{breadcrumb}</span>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-slate-900 font-medium">{visibleParts.length} parts</span>
          </div>
          <div className="relative ml-auto w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search parts, suppliers…"
              value={search}
              onChange={e => { setSearch(e.target.value); selectPart(null) }}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Parts list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {visibleParts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Package className="h-8 w-8 mb-2" />
              <p className="text-sm">No parts found</p>
            </div>
          ) : (
            visibleParts.map(part => {
              const isSelected = selectedPart?.id === part.id
              return (
                <div
                  key={part.id}
                  onClick={() => selectPart(isSelected ? null : part)}
                  className={cn(
                    'rounded-lg border bg-white p-4 cursor-pointer transition-all',
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{part.name}</p>
                        <StockBadge status={part.stockStatus} />
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{part.partNumber}</p>
                      {!isSelected && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">{part.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-slate-900">{formatCurrency(part.unitCost)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">per unit</p>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isSelected && (
                    <div className="mt-4 space-y-3 animate-in fade-in duration-150">
                      <Separator />
                      <p className="text-sm text-slate-700">{part.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-medium">Supplier</p>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {part.supplier}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-medium">Stock</p>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <StockBadge status={part.stockStatus} />
                            {part.stockLevel > 0 && (
                              <span className="text-slate-400 text-xs">({part.stockLevel} units)</span>
                            )}
                          </div>
                          {part.stockStatus === 'out_of_stock' && part.leadTimeDays && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Clock className="h-3 w-3" />
                              {part.leadTimeDays}d lead time
                            </div>
                          )}
                          {(part.stockStatus === 'low_stock' || part.stockStatus === 'out_of_stock') && (
                            <Link
                              to={`/shop?q=${encodeURIComponent(part.partNumber)}`}
                              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              Order from shop →
                            </Link>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-medium">Compatibility</p>
                          <CompatibilityTags models={part.compatibility} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right summary panel when a part is selected */}
      {selectedPart && (
        <aside className="w-64 border-l bg-white overflow-y-auto flex-shrink-0">
          <Card className="border-0 rounded-none shadow-none h-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-sm font-semibold text-slate-700">Part Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{selectedPart.name}</p>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedPart.partNumber}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Unit cost</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedPart.unitCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier</span>
                  <span className="text-slate-700">{selectedPart.supplier}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Availability</span>
                  <StockBadge status={selectedPart.stockStatus} />
                </div>
                {selectedPart.stockLevel > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">In stock</span>
                    <span className="text-slate-700">{selectedPart.stockLevel} units</span>
                  </div>
                )}
                {selectedPart.leadTimeDays && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lead time</span>
                    <span className="text-slate-700">{selectedPart.leadTimeDays} days</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Compatible with</p>
                <div className="space-y-1">
                  {selectedPart.compatibility.map(m => (
                    <p key={m} className="text-xs text-slate-600">{m}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      )}
    </div>
  )
}
