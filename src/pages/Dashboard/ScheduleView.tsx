import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useServiceOrders } from '@/context/ServiceOrdersContext'
import { STATUS_CONFIG } from '@/lib/utils'
import type { ServiceOrder, ServiceOrderStatus } from '@/data/types'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Colour map for schedule blocks ──────────────────────────────────────────

const BLOCK_COLORS: Record<ServiceOrderStatus, string> = {
  received:      'bg-slate-200 text-slate-700 border-slate-300',
  diagnosed:     'bg-blue-100 text-blue-800 border-blue-200',
  in_progress:   'bg-amber-100 text-amber-800 border-amber-200',
  quality_check: 'bg-purple-100 text-purple-800 border-purple-200',
  ready:         'bg-green-100 text-green-800 border-green-200',
  delivered:     'bg-slate-100 text-slate-400 border-slate-200',
}

// ─── Date helpers (no external deps) ─────────────────────────────────────────

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function mondayOf(d: Date): Date {
  const x = startOfDay(d)
  const day = x.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day
  return addDays(x, diff)
}

function formatDay(d: Date): { weekday: string; date: string } {
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    date:    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
  }
}

function formatWeekRange(start: Date): string {
  const end = addDays(start, 6)
  const s = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const e = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${s} – ${e}`
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

// ─── Block geometry ───────────────────────────────────────────────────────────

function computeBlock(
  order: ServiceOrder,
  weekStart: Date,
): { left: number; width: number; visible: boolean } {
  const weekEnd  = addDays(weekStart, 7)
  const start    = startOfDay(new Date(order.createdAt))
  const end      = startOfDay(new Date(order.estimatedCompletion))

  // Not in this week at all
  if (end < weekStart || start >= weekEnd) return { left: 0, width: 0, visible: false }

  const clamped_start = start < weekStart ? weekStart : start
  const clamped_end   = end   > weekEnd   ? weekEnd   : end

  const startOffset = (clamped_start.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
  const endOffset   = (clamped_end.getTime()   - weekStart.getTime()) / (24 * 60 * 60 * 1000)
  const span        = Math.max(endOffset - startOffset, 1) // min 1 day wide

  return {
    left:    (startOffset / 7) * 100,
    width:   (span        / 7) * 100,
    visible: true,
  }
}

// ─── Derive schedule rows from orders ────────────────────────────────────────

interface ScheduleRow {
  name:      string
  initials:  string
  orders:    ServiceOrder[]
}

function buildRows(orders: ServiceOrder[]): ScheduleRow[] {
  const map = new Map<string, ServiceOrder[]>()

  for (const order of orders) {
    const techs = Array.from(new Set(order.laborItems.map(l => l.technicianName)))
    if (techs.length === 0) {
      const key = '__unassigned__'
      map.set(key, [...(map.get(key) ?? []), order])
    } else {
      for (const tech of techs) {
        map.set(tech, [...(map.get(tech) ?? []), order])
      }
    }
  }

  const rows: ScheduleRow[] = []

  // Named technicians first (stable order by first appearance)
  for (const [name, techOrders] of map.entries()) {
    if (name === '__unassigned__') continue
    const parts    = name.split(' ')
    const initials = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase()
    rows.push({ name, initials, orders: techOrders })
  }

  // Unassigned last
  const unassigned = map.get('__unassigned__')
  if (unassigned?.length) {
    rows.push({ name: 'Unassigned', initials: '—', orders: unassigned })
  }

  return rows
}

// ─── Component ────────────────────────────────────────────────────────────────

// Default to the week of 18 Mar 2024 — the busiest week in the mock data
const DEFAULT_WEEK = mondayOf(new Date('2024-03-18'))

export default function ScheduleView() {
  const { orders } = useServiceOrders()
  const [weekStart, setWeekStart] = useState<Date>(DEFAULT_WEEK)

  const today = startOfDay(new Date())
  const days  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const rows  = buildRows(orders)

  // Today marker position (0–100%) — null if outside current week
  const weekEnd = addDays(weekStart, 7)
  const todayPct = today >= weekStart && today < weekEnd
    ? ((today.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 100
    : null

  const LABEL_W = 176 // px — matches w-44

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(w => addDays(w, -7))}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="text-sm font-medium text-slate-700 w-52 text-center">
            {formatWeekRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekStart(w => addDays(w, 7))}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
        <button
          onClick={() => setWeekStart(mondayOf(today))}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          This week
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        {/* Header row */}
        <div className="flex border-b bg-slate-50">
          <div className="flex-shrink-0 border-r px-4 py-3" style={{ width: LABEL_W }}>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Technician</span>
          </div>
          <div className="flex flex-1">
            {days.map((day, i) => {
              const { weekday, date } = formatDay(day)
              const isToday = isSameDay(day, today)
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 border-r last:border-r-0 py-3 text-center',
                    isToday && 'bg-blue-50',
                  )}
                >
                  <p className={cn('text-[11px] font-semibold uppercase tracking-wide', isToday ? 'text-blue-600' : 'text-slate-400')}>{weekday}</p>
                  <p className={cn('text-xs mt-0.5', isToday ? 'text-blue-700 font-semibold' : 'text-slate-600')}>{date}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Technician rows */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <AlertCircle className="h-6 w-6 mb-2" />
            <p className="text-sm">No orders in this period</p>
          </div>
        ) : (
          rows.map((row, rowIdx) => {
            const visibleOrders = row.orders.filter(o => computeBlock(o, weekStart).visible)
            return (
              <div key={row.name} className={cn('flex border-b last:border-b-0', rowIdx % 2 === 1 && 'bg-slate-50/50')}>
                {/* Technician label */}
                <div
                  className="flex flex-shrink-0 items-center gap-3 border-r px-4 py-4"
                  style={{ width: LABEL_W }}
                >
                  <div className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    row.name === 'Unassigned'
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-slate-200 text-slate-700',
                  )}>
                    {row.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 leading-tight truncate">{row.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {visibleOrders.length} order{visibleOrders.length !== 1 ? 's' : ''} this week
                    </p>
                  </div>
                </div>

                {/* Day cells + order blocks */}
                <div className="relative flex flex-1" style={{ minHeight: 72 }}>
                  {/* Day grid lines */}
                  {days.map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 border-r last:border-r-0',
                        isSameDay(day, today) && 'bg-blue-50/40',
                      )}
                    />
                  ))}

                  {/* Today vertical marker */}
                  {todayPct !== null && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10 pointer-events-none"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}

                  {/* Order blocks */}
                  {row.orders.map(order => {
                    const { left, width, visible } = computeBlock(order, weekStart)
                    if (!visible) return null
                    const colors = BLOCK_COLORS[order.status]
                    return (
                      <Link
                        key={order.id}
                        to={`/service-orders/${order.id}`}
                        title={`${order.orderNumber} · ${order.vehicle.make} ${order.vehicle.model} · ${STATUS_CONFIG[order.status].label}`}
                        style={{ left: `calc(${left}% + 4px)`, width: `calc(${width}% - 8px)` }}
                        className={cn(
                          'absolute top-3 h-10 rounded-md border px-2 flex flex-col justify-center overflow-hidden transition-opacity hover:opacity-80',
                          colors,
                        )}
                      >
                        <p className="text-[11px] font-semibold leading-tight truncate">{order.orderNumber}</p>
                        <p className="text-[10px] leading-tight truncate opacity-75">
                          {order.vehicle.make} {order.vehicle.model}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.entries(BLOCK_COLORS) as [ServiceOrderStatus, string][]).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded-sm border', colors)} />
            <span className="text-[11px] text-slate-500">{STATUS_CONFIG[status].label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
