import { createContext, useContext, useState, type ReactNode } from 'react'
import { serviceOrders as initialOrders } from '@/data/serviceOrders'
import type { ServiceOrder } from '@/data/types'

interface ServiceOrdersContextValue {
  orders: ServiceOrder[]
  addOrder: (order: ServiceOrder) => void
}

const ServiceOrdersContext = createContext<ServiceOrdersContextValue | null>(null)

export function ServiceOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<ServiceOrder[]>(initialOrders)

  function addOrder(order: ServiceOrder) {
    setOrders(prev => [order, ...prev])
  }

  return (
    <ServiceOrdersContext.Provider value={{ orders, addOrder }}>
      {children}
    </ServiceOrdersContext.Provider>
  )
}

export function useServiceOrders() {
  const ctx = useContext(ServiceOrdersContext)
  if (!ctx) throw new Error('useServiceOrders must be used inside ServiceOrdersProvider')
  return ctx
}
