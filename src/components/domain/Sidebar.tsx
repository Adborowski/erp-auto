import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Car, Users, Settings, Wrench, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const activeNavItems = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/service-orders', icon: ClipboardList,   label: 'Service Orders' },
  { to: '/customers',      icon: Users,           label: 'Customers' },
  { to: '/parts-catalog',  icon: BookOpen,        label: 'Parts Catalog' },
]

const disabledNavItems = [
  { to: '/vehicles',  icon: Car,      label: 'Vehicles' },
  { to: '/settings',  icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-slate-900">AutoServ</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Workshop ERP</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {activeNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        {/* Coming soon divider */}
        <div className="px-3 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] uppercase tracking-widest text-slate-300">Coming soon</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
        </div>

        {disabledNavItems.map(({ to, icon: Icon, label }) => (
          <div
            key={to}
            title={`${label} — not yet available`}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 cursor-not-allowed select-none"
          >
            <Icon className="h-4 w-4" />
            {label}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            KW
          </div>
          <div>
            <p className="text-xs font-medium text-slate-900">Klaus Weber</p>
            <p className="text-[10px] text-slate-400">Workshop Manager</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
