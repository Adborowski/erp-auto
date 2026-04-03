import { cn, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/utils'
import type { ServiceOrderStatus, ServiceOrderPriority } from '@/data/types'

interface StatusBadgeProps {
  status: ServiceOrderStatus
  className?: string
}

interface PriorityBadgeProps {
  priority: ServiceOrderPriority
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, color } = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color, className)}>
      {label}
    </span>
  )
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { label, color } = PRIORITY_CONFIG[priority]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', color, className)}>
      {label}
    </span>
  )
}
