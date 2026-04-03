import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar } from '@/components/domain/Sidebar'
import { ServiceOrdersProvider } from '@/context/ServiceOrdersContext'
import Dashboard from '@/pages/Dashboard'
import ServiceOrders from '@/pages/ServiceOrders'
import ServiceOrderDetail from '@/pages/ServiceOrderDetail'
import NewServiceOrder from '@/pages/NewServiceOrder'
import Customers from '@/pages/Customers'
import CustomerDetail from '@/pages/CustomerDetail'
import PartsCatalog from '@/pages/PartsCatalog'

function App() {
  return (
    <BrowserRouter>
      <ServiceOrdersProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50">
          <Sidebar />
          <main className="flex flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/service-orders" element={<ServiceOrders />} />
              <Route path="/service-orders/new" element={<NewServiceOrder />} />
              <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/parts-catalog" element={<PartsCatalog />} />
            </Routes>
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </ServiceOrdersProvider>
    </BrowserRouter>
  )
}

export default App
