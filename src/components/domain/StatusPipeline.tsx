import { Check } from 'lucide-react'
import { cn, STATUS_CONFIG, STATUS_STEPS } from '@/lib/utils'
import type { ServiceOrderStatus } from '@/data/types'

interface StatusPipelineProps {
  currentStatus: ServiceOrderStatus
}

export function StatusPipeline({ currentStatus }: StatusPipelineProps) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus)

  return (
    <div className="flex">
      {STATUS_STEPS.map((step, index) => {
        const isPast = index < currentIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        return (
          <div key={step} className="flex items-start">
            {/* Circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                  isPast    && 'border-slate-900 bg-slate-900 text-white',
                  isCurrent && 'border-slate-900 bg-white text-slate-900 shadow-sm',
                  isFuture  && 'border-slate-200 bg-white text-slate-400',
                )}
              >
                {isPast ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  'mt-1.5 w-16 text-center text-[10px] font-medium leading-tight',
                  isCurrent ? 'text-slate-900' : isPast ? 'text-slate-500' : 'text-slate-300',
                )}
              >
                {STATUS_CONFIG[step].label}
              </span>
            </div>

            {/* Connector — mt-4 = 16px = half of h-8 circle, aligns with circle center */}
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 mt-4 h-0.5 w-10 flex-shrink-0 transition-colors',
                  index < currentIndex ? 'bg-slate-900' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
