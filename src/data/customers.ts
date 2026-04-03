import { serviceOrders } from './serviceOrders'
import type { Customer, ServiceOrder } from './types'

export interface CustomerRecord {
  customer: Customer
  orders: ServiceOrder[]
  totalSpent: number
  vehicleCount: number
}

function calcOrderTotal(order: ServiceOrder): number {
  const labor = order.laborItems.reduce((s, i) => s + i.hours * i.hourlyRate, 0)
  const parts = order.partItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  return labor + parts
}

export function getCustomers(): CustomerRecord[] {
  const map = new Map<string, CustomerRecord>()
  for (const order of serviceOrders) {
    const { customer } = order
    if (!map.has(customer.id)) {
      map.set(customer.id, { customer, orders: [], totalSpent: 0, vehicleCount: 0 })
    }
    const rec = map.get(customer.id)!
    rec.orders.push(order)
    rec.totalSpent += calcOrderTotal(order)
  }
  for (const rec of map.values()) {
    rec.vehicleCount = new Set(rec.orders.map(o => o.vehicle.id)).size
  }
  return Array.from(map.values())
}

export function getCustomer(id: string): CustomerRecord | undefined {
  return getCustomers().find(r => r.customer.id === id)
}
