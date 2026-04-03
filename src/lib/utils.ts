import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ServiceOrderStatus, ServiceOrderPriority } from '@/data/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function calcOrderTotal(order: {
  laborItems: { hours: number; hourlyRate: number }[]
  partItems: { quantity: number; unitPrice: number }[]
}): number {
  const labor = order.laborItems.reduce((sum, item) => sum + item.hours * item.hourlyRate, 0)
  const parts = order.partItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  return labor + parts
}

export const STATUS_CONFIG: Record<ServiceOrderStatus, { label: string; color: string }> = {
  received:      { label: 'Received',       color: 'bg-slate-100 text-slate-700' },
  diagnosed:     { label: 'Diagnosed',      color: 'bg-blue-100 text-blue-700' },
  in_progress:   { label: 'In Progress',    color: 'bg-amber-100 text-amber-700' },
  quality_check: { label: 'Quality Check',  color: 'bg-purple-100 text-purple-700' },
  ready:         { label: 'Ready',          color: 'bg-green-100 text-green-700' },
  delivered:     { label: 'Delivered',      color: 'bg-slate-100 text-slate-500' },
}

export const PRIORITY_CONFIG: Record<ServiceOrderPriority, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-slate-100 text-slate-600' },
  normal: { label: 'Normal', color: 'bg-blue-50 text-blue-600' },
  high:   { label: 'High',   color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export const STATUS_STEPS: ServiceOrderStatus[] = [
  'received', 'diagnosed', 'in_progress', 'quality_check', 'ready', 'delivered',
]
