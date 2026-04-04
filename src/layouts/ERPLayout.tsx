import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/domain/Sidebar'

export function ERPLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
