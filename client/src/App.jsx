import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import DemoBanner from './components/DemoBanner.jsx';
import Toaster from './components/Toaster.jsx';
import Home from './pages/Home.jsx';
import AllProducts from './pages/AllProducts.jsx';
import Category from './pages/Category.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Track from './pages/Track.jsx';
import Auth from './pages/Auth.jsx';
import Admin from './pages/Admin.jsx';
import Support from './pages/Support.jsx';

export default function App() {
  const { pathname } = useLocation();
  const bare = pathname === '/login' || pathname === '/register'; // no navbar on these pages

  return (
    <>
      {!bare && <Navbar />}
      <main className={bare ? '' : 'container'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/category/:slug/:gender?" element={<Category />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/track" element={<Track />} />
          <Route path="/login" element={<Auth key="login" mode="login" />} />
          <Route path="/register" element={<Auth key="register" mode="register" />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
      <DemoBanner />
      <Toaster />
    </>
  );
}
