import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCustomer } from '@/data/customers'
import { formatDate, formatCurrency, calcOrderTotal } from '@/lib/utils'
import { StatusBadge, PriorityBadge } from '@/components/domain/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Phone, Mail, Building2, User } from 'lucide-react'

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const record = getCustomer(id ?? '')

  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500">Customer not found</p>
          <Link to="/customers" className="text-sm text-slate-900 underline mt-2 inline-block">
            Back to customers
          </Link>
        </div>
      </div>
    )
  }

  const { customer, orders, totalSpent } = record
  const totalLabor = orders.reduce(
    (s, o) => s + o.laborItems.reduce((ls, i) => ls + i.hours * i.hourlyRate, 0),
    0,
  )
  const totalParts = totalSpent - totalLabor
  const initials = customer.name.split(' ').map(n => n[0]).join('')
  const vehicles = Array.from(new Map(orders.map(o => [o.vehicle.id, o.vehicle])).values())

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
            {customer.company && (
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3.5 w-3.5" />{customer.company}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 pb-10">
        <div className="grid grid-cols-3 gap-6">
          {/* Contact */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4" /> Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />{customer.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />{customer.email}
              </div>
              {customer.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />{customer.company}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total orders</span>
                <span className="font-medium text-slate-900">{orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total spent</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalSpent)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-slate-500">Labor</span>
                <span className="text-slate-700">{formatCurrency(totalLabor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Parts</span>
                <span className="text-slate-700">{formatCurrency(totalParts)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Vehicles ({vehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {vehicles.map(v => (
                <div key={v.id}>
                  <p className="font-medium text-slate-900">{v.year} {v.make} {v.model}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{v.licensePlate} · {v.color}</p>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">{v.vin}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700">Order History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs text-slate-500">Order</TableHead>
                  <TableHead className="text-xs text-slate-500">Vehicle</TableHead>
                  <TableHead className="text-xs text-slate-500">Status</TableHead>
                  <TableHead className="text-xs text-slate-500">Priority</TableHead>
                  <TableHead className="text-xs text-slate-500">Date</TableHead>
                  <TableHead className="text-xs text-slate-500 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Link
                        to={`/service-orders/${order.id}`}
                        className="text-sm font-medium text-slate-900 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
                    </TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell><PriorityBadge priority={order.priority} /></TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-sm font-medium text-slate-900 text-right">
                      {formatCurrency(calcOrderTotal(order))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
