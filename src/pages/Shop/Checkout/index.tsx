import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { formatCurrency, cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, Landmark, Banknote, ShieldCheck, Wrench } from 'lucide-react'

// ─── Shared field primitive ───────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900'

// ─── Payment method ───────────────────────────────────────────────────────────

type PaymentMethod = 'card' | 'bank_transfer' | 'invoice'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; detail: string; icon: typeof CreditCard }[] = [
  { value: 'card',          label: 'Credit / Debit Card',  detail: 'Visa, Mastercard, Amex',    icon: CreditCard  },
  { value: 'bank_transfer', label: 'Bank Transfer (SEPA)', detail: 'Processed within 2 days',   icon: Landmark    },
  { value: 'invoice',       label: 'Invoice (Net 30)',      detail: 'For registered businesses', icon: Banknote    },
]

// ─── Form shape ───────────────────────────────────────────────────────────────

const INITIAL = {
  firstName:   '',
  lastName:    '',
  company:     '',
  email:       '',
  phone:       '',
  address:     '',
  city:        '',
  postcode:    '',
  country:     'DE',
  payment:     'card' as PaymentMethod,
}
type FormData = typeof INITIAL

function isValid(f: FormData) {
  return !!(f.firstName && f.lastName && f.email && f.address && f.city && f.postcode)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(INITIAL)

  const vat   = totalPrice * 0.19
  const total = totalPrice + vat

  function patch(update: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...update }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid(form)) return
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
    clearCart()
    navigate('/shop/order-confirmed', { state: { orderNumber, total, items } })
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-sm">Your cart is empty.</p>
        <Link to="/shop" className="text-sm text-slate-900 underline">Back to shop</Link>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="border-b bg-white px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Checkout</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/shop/cart" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-3 gap-6 items-start pb-16">

          {/* Left: form — 2 cols */}
          <div className="col-span-2 space-y-6">

            {/* Contact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Contact & Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" required>
                    <input className={inputCls} placeholder="Anna" value={form.firstName}
                      onChange={e => patch({ firstName: e.target.value })} />
                  </Field>
                  <Field label="Last name" required>
                    <input className={inputCls} placeholder="Schmidt" value={form.lastName}
                      onChange={e => patch({ lastName: e.target.value })} />
                  </Field>
                </div>
                <Field label="Company (optional)">
                  <input className={inputCls} placeholder="Müller GmbH" value={form.company}
                    onChange={e => patch({ company: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email" required>
                    <input className={inputCls} type="email" placeholder="anna@example.de" value={form.email}
                      onChange={e => patch({ email: e.target.value })} />
                  </Field>
                  <Field label="Phone">
                    <input className={inputCls} placeholder="+49 170 1234567" value={form.phone}
                      onChange={e => patch({ phone: e.target.value })} />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Shipping address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Street address" required>
                  <input className={inputCls} placeholder="Hauptstraße 12" value={form.address}
                    onChange={e => patch({ address: e.target.value })} />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Postcode" required>
                    <input className={inputCls} placeholder="80331" value={form.postcode}
                      onChange={e => patch({ postcode: e.target.value })} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="City" required>
                      <input className={inputCls} placeholder="München" value={form.city}
                        onChange={e => patch({ city: e.target.value })} />
                    </Field>
                  </div>
                </div>
                <Field label="Country">
                  <select className={inputCls} value={form.country} onChange={e => patch({ country: e.target.value })}>
                    <option value="DE">Germany</option>
                    <option value="AT">Austria</option>
                    <option value="CH">Switzerland</option>
                    <option value="PL">Poland</option>
                  </select>
                </Field>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PAYMENT_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border-2 px-4 py-3 cursor-pointer transition-colors',
                      form.payment === opt.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={form.payment === opt.value}
                      onChange={() => patch({ payment: opt.value })}
                      className="sr-only"
                    />
                    <div className={cn(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                      form.payment === opt.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500',
                    )}>
                      <opt.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-400">{opt.detail}</p>
                    </div>
                    {form.payment === opt.value && (
                      <div className="ml-auto h-2.5 w-2.5 rounded-full bg-slate-900" />
                    )}
                  </label>
                ))}
                <p className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  No payment is processed — this is a demo checkout
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right: order summary — 1 col */}
          <div className="space-y-4">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {/* Line items */}
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {items.map(({ part, quantity }) => (
                    <div key={part.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100">
                        <Wrench className="h-3.5 w-3.5 text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{part.name}</p>
                        <p className="text-[10px] text-slate-400">qty {quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 flex-shrink-0">
                        {formatCurrency(part.unitCost * quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span><span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT (19%)</span><span>{formatCurrency(vat)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-slate-900 text-base">
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>

                <button
                  type="submit"
                  disabled={!isValid(form)}
                  className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  Place Order
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
