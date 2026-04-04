import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { formatCurrency, cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Plus, Minus, Trash2, ShoppingCart, ArrowLeft, ArrowRight, Wrench,
  Building2, CheckCircle2, AlertTriangle, XCircle,
} from 'lucide-react'
import type { StockStatus } from '@/data/partsCatalog'

const STOCK_CONFIG: Record<StockStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  in_stock:     { label: 'In Stock',     icon: CheckCircle2,  color: 'text-green-600' },
  low_stock:    { label: 'Low Stock',    icon: AlertTriangle, color: 'text-amber-500' },
  out_of_stock: { label: 'Out of Stock', icon: XCircle,       color: 'text-red-500'   },
}

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
        <ShoppingCart className="h-14 w-14 opacity-20" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link
          to="/shop"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
      </div>
    )
  }

  const vat     = totalPrice * 0.19       // German Mehrwertsteuer
  const total   = totalPrice + vat

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="border-b bg-white px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Your Cart</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/shop" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-3 gap-6 items-start pb-16">
        {/* Line items — spans 2 cols */}
        <div className="col-span-2 space-y-3">
          {items.map(({ part, quantity }) => {
            const { label, icon: Icon, color } = STOCK_CONFIG[part.stockStatus]
            return (
              <Card key={part.id}>
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    {/* Icon placeholder */}
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Wrench className="h-7 w-7 text-slate-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{part.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{part.partNumber}</p>
                        </div>
                        <button
                          onClick={() => removeItem(part.id)}
                          className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                        <Building2 className="h-3 w-3" />
                        {part.supplier}
                        <span className="mx-1">·</span>
                        <Icon className={cn('h-3 w-3', color)} />
                        <span className={color}>{label}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity stepper */}
                        <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(part.id, quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-slate-900 border-x border-slate-200">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(part.id, quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-bold text-slate-900">
                            {formatCurrency(part.unitCost * quantity)}
                          </p>
                          {quantity > 1 && (
                            <p className="text-xs text-slate-400">{formatCurrency(part.unitCost)} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Clear cart */}
          <div className="flex justify-end pt-1">
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Order summary — 1 col */}
        <Card className="sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT (19%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-slate-900 text-base">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button
              onClick={() => navigate('/shop/checkout')}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              to="/shop"
              className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors pt-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Continue shopping
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
