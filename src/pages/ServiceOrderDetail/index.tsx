import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useServiceOrders } from '@/context/ServiceOrdersContext'
import { formatDate, formatDateTime, formatCurrency, STATUS_STEPS, STATUS_CONFIG } from '@/lib/utils'
import { StatusBadge, PriorityBadge } from '@/components/domain/StatusBadge'
import { StatusPipeline } from '@/components/domain/StatusPipeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Car, User, Phone, Mail, Building2, FileText, Wrench, Package } from 'lucide-react'
import type { ServiceOrderStatus } from '@/data/types'

export default function ServiceOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { orders } = useServiceOrders()
  const order = orders.find(o => o.id === id)

  const [status, setStatus] = useState<ServiceOrderStatus>(order?.status ?? 'received')

  if (!order) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">Order not found</p>
          <Link to="/service-orders" className="text-sm text-slate-900 underline mt-2 inline-block">
            Back to orders
          </Link>
        </div>
      </div>
    )
  }

  const laborTotal = order.laborItems.reduce((sum, i) => sum + i.hours * i.hourlyRate, 0)
  const partsTotal = order.partItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const grandTotal = laborTotal + partsTotal

  const currentStepIndex = STATUS_STEPS.indexOf(status)
  const nextStatus: ServiceOrderStatus | null =
    currentStepIndex < STATUS_STEPS.length - 1 ? STATUS_STEPS[currentStepIndex + 1] : null

  const advanceLabel: Record<ServiceOrderStatus, string> = {
    received:      'Mark as Diagnosed',
    diagnosed:     'Start Work',
    in_progress:   'Send to Quality Check',
    quality_check: 'Mark as Ready',
    ready:         'Mark as Delivered',
    delivered:     '',
  }

  function advanceStatus() {
    if (!nextStatus) return
    setStatus(nextStatus)
    toast.success(`Status advanced to "${STATUS_CONFIG[nextStatus].label}"`, {
      description: 'In production this would persist to the backend.',
    })
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4">
        <button
          onClick={() => navigate('/service-orders')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-900">{order.orderNumber}</h1>
              <StatusBadge status={status} />
              <PriorityBadge priority={order.priority} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Created {formatDateTime(order.createdAt)} · Est. completion {formatDate(order.estimatedCompletion)}
            </p>
          </div>

          {nextStatus && (
            <button
              onClick={advanceStatus}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
            >
              {advanceLabel[status]}
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 pb-10">
        {/* Status pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700">Workflow Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPipeline currentStatus={status} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Vehicle info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Car className="h-4 w-4" /> Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">
                {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
              </p>
              <div className="space-y-1 text-slate-600">
                <p><span className="text-slate-400">Color:</span> {order.vehicle.color}</p>
                <p><span className="text-slate-400">Plate:</span> {order.vehicle.licensePlate}</p>
                <p><span className="text-slate-400">Mileage:</span> {order.vehicle.mileage.toLocaleString('de-DE')} km</p>
                <p className="font-mono text-xs text-slate-400 pt-1">{order.vehicle.vin}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">{order.customer.name}</p>
              <div className="space-y-1.5 text-slate-600">
                {order.customer.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {order.customer.company}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {order.customer.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {order.customer.email}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaint & notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <FileText className="h-4 w-4" /> Complaint
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3">
              <p>{order.complaint}</p>
              {order.diagnosis && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Diagnosis</p>
                    <p className="text-slate-700">{order.diagnosis}</p>
                  </div>
                </>
              )}
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Notes</p>
                    <p className="text-slate-600 italic">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Labor & Parts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Labor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Wrench className="h-4 w-4" /> Labor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.laborItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No labor items yet</p>
              ) : (
                <div className="space-y-2">
                  {order.laborItems.map(item => (
                    <div key={item.id} className="flex items-start justify-between text-sm">
                      <div>
                        <p className="text-slate-900">{item.description}</p>
                        <p className="text-xs text-slate-400">{item.technicianName} · {item.hours}h @ {formatCurrency(item.hourlyRate)}/h</p>
                      </div>
                      <p className="font-medium text-slate-900 ml-4 whitespace-nowrap">
                        {formatCurrency(item.hours * item.hourlyRate)}
                      </p>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm font-semibold text-slate-900">
                    <span>Labor subtotal</span>
                    <span>{formatCurrency(laborTotal)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Package className="h-4 w-4" /> Parts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.partItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No parts added yet</p>
              ) : (
                <div className="space-y-2">
                  {order.partItems.map(item => (
                    <div key={item.id} className="flex items-start justify-between text-sm">
                      <div>
                        <p className="text-slate-900">{item.description}</p>
                        <p className="text-xs text-slate-400">
                          <Link
                            to={`/parts-catalog?part=${item.partNumber}`}
                            className="font-mono hover:text-slate-700 hover:underline transition-colors"
                          >
                            {item.partNumber}
                          </Link>
                          {' · '}qty {item.quantity} @ {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-medium text-slate-900 ml-4 whitespace-nowrap">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-sm font-semibold text-slate-900">
                    <span>Parts subtotal</span>
                    <span>{formatCurrency(partsTotal)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grand total */}
        {grandTotal > 0 && (
          <div className="flex justify-end">
            <div className="rounded-lg border bg-white px-6 py-4 text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Grand Total (excl. VAT)</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(grandTotal)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
