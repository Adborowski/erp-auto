import { useState } from 'react'
import { ChevronRight, ChevronDown, Layers, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/data/partsCatalog'

interface CategoryTreeProps {
  catalog: Category[]
  selectedId: string | null
  onSelect: (id: string, type: 'category' | 'subcategory') => void
  initialExpanded?: Set<string>
}

export function CategoryTree({ catalog, selectedId, onSelect, initialExpanded }: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded ?? new Set([catalog[0]?.id]))

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <nav className="space-y-0.5">
      {catalog.map(category => {
        const isExpanded = expanded.has(category.id)
        const isSelected = selectedId === category.id
        const totalParts = category.subcategories.reduce((n, s) => n + s.parts.length, 0)

        return (
          <div key={category.id}>
            {/* Category row */}
            <button
              onClick={() => { toggle(category.id); onSelect(category.id, 'category') }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors text-left',
                isSelected
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100',
              )}
            >
              <span className="flex-shrink-0">
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5" />
                  : <ChevronRight className="h-3.5 w-3.5" />
                }
              </span>
              <Layers className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              <span className="flex-1 font-medium leading-snug">{category.name}</span>
              <span className={cn(
                'text-[10px] font-semibold rounded-full px-1.5',
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}>
                {totalParts}
              </span>
            </button>

            {/* Subcategories */}
            {isExpanded && (
              <div className="ml-4 mt-0.5 space-y-0.5 animate-in fade-in duration-150">
                {category.subcategories.map(sub => {
                  const isSubSelected = selectedId === sub.id
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelect(sub.id, 'subcategory')}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left',
                        isSubSelected
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100',
                      )}
                    >
                      <Tag className="h-3 w-3 flex-shrink-0 opacity-50" />
                      <span className="flex-1 leading-snug">{sub.name}</span>
                      <span className={cn(
                        'text-[10px] font-semibold rounded-full px-1.5',
                        isSubSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
                      )}>
                        {sub.parts.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
