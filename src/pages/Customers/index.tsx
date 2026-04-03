import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomers } from '@/data/customers'
import { formatCurrency } from '@/lib/utils'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Search, Building2, Car, ClipboardList } from 'lucide-react'

export default function Customers() {
  const [search, setSearch] = useState('')
  const customers = getCustomers()

  const filtered = customers.filter(({ customer }) => {
    const q = search.toLowerCase()
    return (
      !q ||
      customer.name.toLowerCase().includes(q) ||
      customer.email.toLowerCase().includes(q) ||
      (customer.company?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="border-b bg-white px-8 py-5">
        <h1 className="text-lg font-semibold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500 mt-0.5">{customers.length} registered customers</p>
      </div>

      <div className="px-8 py-6 pb-10 space-y-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, company, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs text-slate-500">Customer</TableHead>
                <TableHead className="text-xs text-slate-500">Contact</TableHead>
                <TableHead className="text-xs text-slate-500">Vehicles</TableHead>
                <TableHead className="text-xs text-slate-500">Orders</TableHead>
                <TableHead className="text-xs text-slate-500 text-right">Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-sm text-slate-400">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(({ customer, orders, totalSpent, vehicleCount }) => (
                  <TableRow key={customer.id} className="hover:bg-slate-50 cursor-pointer">
                    <TableCell>
                      <Link to={`/customers/${customer.id}`} className="hover:underline">
                        <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                        {customer.company && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" />{customer.company}
                          </p>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      <p>{customer.phone}</p>
                      <p className="text-xs text-slate-400">{customer.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                        <Car className="h-3.5 w-3.5 text-slate-400" />{vehicleCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                        <ClipboardList className="h-3.5 w-3.5 text-slate-400" />{orders.length}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-900 text-right">
                      {formatCurrency(totalSpent)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
