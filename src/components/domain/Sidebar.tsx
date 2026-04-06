import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Car, Users, Settings, Wrench, BookOpen, ShoppingBag, Layers, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const activeNavItems = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/service-orders', icon: ClipboardList,   label: 'Service Orders' },
  { to: '/customers',      icon: Users,           label: 'Customers' },
  { to: '/parts-catalog',  icon: BookOpen,        label: 'Parts Catalog' },
  { to: '/design-system',  icon: Layers,          label: 'Design System' },
]

const disabledNavItems = [
  { to: '/vehicles',  icon: Car,      label: 'Vehicles' },
  { to: '/settings',  icon: Settings, label: 'Settings' },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        'flex h-screen w-60 flex-shrink-0 flex-col border-r bg-white',
        'fixed inset-y-0 left-0 z-50 transition-transform duration-300',
        'lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-none text-slate-900">AutoServ</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Workshop ERP</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {activeNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
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

        {/* Shop link */}
        <div className="border-t p-3">
          <Link
            to="/shop"
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Parts Shop</span>
            <span className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Shop</span>
          </Link>
        </div>

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
    </>
  )
}
