import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatusBadge, PriorityBadge } from '@/components/domain/StatusBadge'
import { StatusPipeline } from '@/components/domain/StatusPipeline'
import type { ServiceOrderStatus, ServiceOrderPriority } from '@/data/types'
import { Trash2, Plus, Download } from 'lucide-react'

// ── Section shell ────────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <Card>
        <CardContent className="pt-6 space-y-5">
          {children}
        </CardContent>
      </Card>
    </section>
  )
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {label && (
        <span className="w-20 flex-shrink-0 text-[11px] font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────────────────

const ALL_STATUSES: ServiceOrderStatus[] = [
  'received', 'diagnosed', 'in_progress', 'quality_check', 'ready', 'delivered',
]

const ALL_PRIORITIES: ServiceOrderPriority[] = ['low', 'normal', 'high', 'urgent']

const BADGE_VARIANTS = ['default', 'secondary', 'destructive', 'outline', 'ghost'] as const

const SAMPLE_ROWS = [
  { id: 'SO-2024-0042', customer: 'Hans Müller',  status: 'in_progress' as ServiceOrderStatus,   priority: 'high' as ServiceOrderPriority },
  { id: 'SO-2024-0041', customer: 'Anna Schmidt', status: 'quality_check' as ServiceOrderStatus, priority: 'normal' as ServiceOrderPriority },
  { id: 'SO-2024-0040', customer: 'Peter Bauer',  status: 'ready' as ServiceOrderStatus,         priority: 'urgent' as ServiceOrderPriority },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DesignSystem() {
  return (
    <div className="flex-1 overflow-auto bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Design System</h1>
          <p className="text-sm text-slate-500">
            Shared component primitives used across the Workshop ERP and the Parts Shop.
            All components in <code className="text-xs bg-slate-100 rounded px-1 py-0.5 font-mono">ui/</code> carry
            no domain knowledge — they compose freely in both surfaces.
          </p>
        </div>

        {/* ── Buttons ──────────────────────────────────────────────────────── */}
        <Section
          title="Button"
          description="Six variants cover every intent level. Icon buttons come in matching sizes."
        >
          <Row label="Variant">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </Row>
          <Row label="Size">
            <Button size="lg">Large</Button>
            <Button size="default">Default</Button>
            <Button size="sm">Small</Button>
            <Button size="xs">X-Small</Button>
          </Row>
          <Row label="With icon">
            <Button><Plus className="h-4 w-4" />New Order</Button>
            <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
            <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" />Delete</Button>
          </Row>
          <Row label="State">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled</Button>
          </Row>
        </Section>

        {/* ── Badges ───────────────────────────────────────────────────────── */}
        <Section
          title="Badge"
          description="Generic label primitives from the ui/ layer — no domain semantics."
        >
          <Row label="Variant">
            {BADGE_VARIANTS.map(v => (
              <Badge key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge>
            ))}
          </Row>
        </Section>

        {/* ── Status Badges ────────────────────────────────────────────────── */}
        <Section
          title="StatusBadge"
          description="Domain-aware badges backed by STATUS_CONFIG. Color encodes where an order is in the pipeline."
        >
          <Row label="Status">
            {ALL_STATUSES.map(s => <StatusBadge key={s} status={s} />)}
          </Row>
          <Row label="Priority">
            {ALL_PRIORITIES.map(p => <PriorityBadge key={p} priority={p} />)}
          </Row>
        </Section>

        {/* ── Status Pipeline ──────────────────────────────────────────────── */}
        <Section
          title="StatusPipeline"
          description="Visual step tracker. Past steps are filled; the current step has a ring; future steps are muted."
        >
          {(['received', 'in_progress', 'delivered'] as ServiceOrderStatus[]).map(s => (
            <div key={s} className="space-y-2">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                Current: {s.replace('_', ' ')}
              </p>
              <StatusPipeline currentStatus={s} />
              {s !== 'delivered' && <Separator />}
            </div>
          ))}
        </Section>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <Section
          title="Table"
          description="Scrollable data table with hover rows and composable column heads."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_ROWS.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.id}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell><PriorityBadge priority={row.priority} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        {/* ── Separator ────────────────────────────────────────────────────── */}
        <Section title="Separator" description="1 px divider — horizontal or vertical.">
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center gap-4 h-8">
              <span className="text-sm text-slate-500">Left</span>
              <Separator orientation="vertical" className="h-full" />
              <span className="text-sm text-slate-500">Right</span>
            </div>
          </div>
        </Section>

        {/* ── Skeleton ─────────────────────────────────────────────────────── */}
        <Section
          title="Skeleton"
          description="Pulsing placeholder used while async data is loading."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </Section>

      </div>
    </div>
  )
}
