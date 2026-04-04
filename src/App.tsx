import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ServiceOrdersProvider } from '@/context/ServiceOrdersContext'
import { CartProvider } from '@/context/CartContext'
import { ERPLayout } from '@/layouts/ERPLayout'
import { ShopLayout } from '@/layouts/ShopLayout'
import Dashboard from '@/pages/Dashboard'
import ServiceOrders from '@/pages/ServiceOrders'
import ServiceOrderDetail from '@/pages/ServiceOrderDetail'
import NewServiceOrder from '@/pages/NewServiceOrder'
import Customers from '@/pages/Customers'
import CustomerDetail from '@/pages/CustomerDetail'
import PartsCatalog from '@/pages/PartsCatalog'
import Shop from '@/pages/Shop'
import Cart from '@/pages/Shop/Cart'
import Checkout from '@/pages/Shop/Checkout'
import OrderConfirmed from '@/pages/Shop/OrderConfirmed'

function App() {
  return (
    <BrowserRouter>
      <ServiceOrdersProvider>
        <CartProvider>
          <Routes>
            <Route element={<ERPLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/service-orders" element={<ServiceOrders />} />
              <Route path="/service-orders/new" element={<NewServiceOrder />} />
              <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/parts-catalog" element={<PartsCatalog />} />
            </Route>
            <Route element={<ShopLayout />}>
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/cart" element={<Cart />} />
              <Route path="/shop/checkout" element={<Checkout />} />
              <Route path="/shop/order-confirmed" element={<OrderConfirmed />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" richColors closeButton />
        </CartProvider>
      </ServiceOrdersProvider>
    </BrowserRouter>
  )
}

export default App
