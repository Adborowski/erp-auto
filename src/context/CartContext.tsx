import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CatalogPart } from '@/data/partsCatalog'

export interface CartItem {
  part: CatalogPart
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (part: CatalogPart, quantity?: number) => void
  removeItem: (partId: string) => void
  updateQuantity: (partId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addItem(part: CatalogPart, quantity = 1) {
    setItems(prev => {
      const existing = prev.find(i => i.part.id === part.id)
      if (existing) {
        return prev.map(i =>
          i.part.id === part.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { part, quantity }]
    })
  }

  function removeItem(partId: string) {
    setItems(prev => prev.filter(i => i.part.id !== partId))
  }

  function updateQuantity(partId: string, quantity: number) {
    if (quantity <= 0) return removeItem(partId)
    setItems(prev => prev.map(i => i.part.id === partId ? { ...i, quantity } : i))
  }

  function clearCart() {
    setItems([])
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.part.unitCost * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
