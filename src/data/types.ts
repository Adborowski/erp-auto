export type ServiceOrderStatus =
  | 'received'
  | 'diagnosed'
  | 'in_progress'
  | 'quality_check'
  | 'ready'
  | 'delivered'

export type ServiceOrderPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  licensePlate: string
  mileage: number
  color: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
}

export interface LaborItem {
  id: string
  description: string
  technicianName: string
  hours: number
  hourlyRate: number
}

export interface PartItem {
  id: string
  partNumber: string
  description: string
  quantity: number
  unitPrice: number
}

export interface ServiceOrder {
  id: string
  orderNumber: string
  status: ServiceOrderStatus
  priority: ServiceOrderPriority
  createdAt: string
  updatedAt: string
  estimatedCompletion: string
  vehicle: Vehicle
  customer: Customer
  complaint: string
  diagnosis?: string
  laborItems: LaborItem[]
  partItems: PartItem[]
  notes?: string
}
