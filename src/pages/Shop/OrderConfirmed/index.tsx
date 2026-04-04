import { Link, useLocation, Navigate } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ShoppingBag, ArrowLeft, Wrench } from 'lucide-react'
import type { CartItem } from '@/context/CartContext'

interface LocationState {
  orderNumber: string
  total: number
  items: CartItem[]
}

export default function OrderConfirmed() {
  const location = useLocation()
  const state = location.state as LocationState | null

  // Guard: if someone navigates here directly with no state, send them back
  if (!state?.orderNumber) return <Navigate to="/shop" replace />

  const { orderNumber, total, items } = state

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-2xl mx-auto px-8 py-16 space-y-8">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order placed!</h1>
            <p className="text-slate-500 mt-1">
              Thank you for your order. You'll receive a confirmation email shortly.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
            <span className="text-xs text-slate-500">Order number</span>
            <span className="font-mono text-sm font-semibold text-slate-900">{orderNumber}</span>
          </div>
        </div>

        {/* Order summary */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Items ordered</p>
            <div className="space-y-3">
              {items.map(({ part, quantity }) => (
                <div key={part.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Wrench className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{part.name}</p>
                    <p className="text-xs font-mono text-slate-400">{part.partNumber} · qty {quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 flex-shrink-0">
                    {formatCurrency(part.unitCost * quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-slate-900">
              <span>Total paid (incl. VAT)</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue shopping
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workshop ERP
          </Link>
        </div>
      </div>
    </div>
  )
}
