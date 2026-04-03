import { useState } from 'react'
import { useServiceOrders } from '@/context/ServiceOrdersContext'
import { calcOrderTotal, formatCurrency, STATUS_CONFIG } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/domain/StatusBadge'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import ScheduleView from './ScheduleView'

const BAR_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#a855f7', '#22c55e', '#cbd5e1']

type Tab = 'overview' | 'schedule'

export default function Dashboard() {
  const { orders } = useServiceOrders()
  const [tab, setTab] = useState<Tab>('overview')

  const active         = orders.filter(o => o.status !== 'delivered')
  const readyForPickup = orders.filter(o => o.status === 'ready')
  const delivered      = orders.filter(o => o.status === 'delivered')
  const totalRevenue   = delivered.reduce((sum, o) => sum + calcOrderTotal(o), 0)

  const statusChartData = Object.entries(STATUS_CONFIG).map(([key, { label }]) => ({
    status: label,
    count:  orders.filter(o => o.status === key).length,
  }))

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="border-b bg-white px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Workshop overview · Today</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-medium">
          {(['overview', 'schedule'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 capitalize transition-colors ${
                tab === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 pb-10">
        {tab === 'schedule' && <ScheduleView />}
        {tab === 'overview' && <>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Active Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{active.length}</p>
              <p className="text-xs text-slate-500 mt-1">vehicles in workshop</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Ready for Pickup</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{readyForPickup.length}</p>
              <p className="text-xs text-slate-500 mt-1">awaiting customer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Delivered</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{delivered.length}</p>
              <p className="text-xs text-slate-500 mt-1">completed orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-slate-500 mt-1">from completed orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Chart */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-700">Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={statusChartData} barSize={28} margin={{ bottom: 24 }}>
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    angle={-30}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((_entry, index) => (
                      <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent orders */}
          <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-700">Recent Service Orders</CardTitle>
              <Link
                to="/service-orders"
                className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {orders.slice(0, 5).map(order => (
                  <Link
                    key={order.id}
                    to={`/service-orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {order.priority === 'urgent' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.vehicle.year} {order.vehicle.make} {order.vehicle.model} · {order.customer.name}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </>}
      </div>
    </div>
  )
}
