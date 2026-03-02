import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Brands from './pages/Brands';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Returns from './pages/Returns';

function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Bluewave <span>Bar & Kitchen</span></h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/brands" className={({ isActive }) => isActive ? 'active' : ''}>Brands</NavLink>
          <NavLink to="/stock" className={({ isActive }) => isActive ? 'active' : ''}>Stock</NavLink>
          <NavLink to="/sales" className={({ isActive }) => isActive ? 'active' : ''}>Daily Sales</NavLink>
          <NavLink to="/returns" className={({ isActive }) => isActive ? 'active' : ''}>Returns</NavLink>
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/returns" element={<Returns />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <Layout />;
}
