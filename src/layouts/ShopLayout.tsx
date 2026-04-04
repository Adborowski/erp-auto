import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Wrench, ArrowLeft, Plus, Minus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const navigate = useNavigate()

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-slate-700" />
            <h2 className="font-semibold text-slate-900">Cart</h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-slate-900 text-white text-[11px] font-semibold px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <ShoppingCart className="h-10 w-10 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
              <button
                onClick={onClose}
                className="text-xs text-slate-500 underline hover:text-slate-900"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map(({ part, quantity }) => (
                <div key={part.id} className="flex gap-4 px-6 py-4">
                  {/* Icon block */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{part.name}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{part.partNumber}</p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateQuantity(part.id, quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-slate-900">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(part.id, quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(part.unitCost * quantity)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(part.id)}
                    className="text-slate-300 hover:text-red-400 transition-colors self-start mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal ({totalItems} items)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalPrice)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <button
                onClick={() => { onClose(); navigate('/shop/checkout') }}
                className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
              >
                Checkout
              </button>
              <button
                onClick={() => { onClose(); navigate('/shop/cart') }}
                className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                View cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function ShopLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {/* Top navigation bar */}
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-6 z-30">
        {/* Left: brand + back link */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-slate-900">AutoServ</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Parts Shop</p>
            </div>
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Workshop ERP
          </Link>
        </div>

        {/* Center: nav links */}
        <nav className="flex items-center gap-6">
          <Link to="/shop" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
            All Parts
          </Link>
          <Link to="/shop/cart" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            Cart
          </Link>
        </nav>

        {/* Right: cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Page content */}
      <main className="flex flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Cart drawer — always mounted, toggled by open prop */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
