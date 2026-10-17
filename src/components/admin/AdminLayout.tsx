import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  PlusCircle,
  FolderTree,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

export const AdminLayout: React.FC = () => {
  const { admin, logout, isFirebaseActive } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', to: '/admin/products', icon: Shirt, end: true },
    { label: 'Add New Product', to: '/admin/products/new', icon: PlusCircle, end: false },
    { label: 'Collections', to: '/admin/collections', icon: FolderTree, end: false },
    { label: 'Store Settings', to: '/admin/settings', icon: Settings, end: false },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFE6]/40 flex flex-col md:flex-row text-[#292522]">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#292522] text-[#FAF7F2] px-4 py-3.5 flex items-center justify-between border-b border-[#3D3733]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-[#E8DCCB] hover:text-white"
            aria-label="Toggle admin navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Logo variant="light" size="sm" />
        </div>
        <Link
          to="/"
          target="_blank"
          className="text-xs uppercase tracking-wider text-[#E8DCCB] hover:text-white flex items-center gap-1"
        >
          <span>Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-[#292522] text-[#FAF7F2] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-[#3D3733] flex items-center justify-between">
            <div>
              <Logo variant="light" size="md" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8DCCB] font-medium block mt-1.5">
                Admin Console
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-[#FAF7F2]/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium tracking-wide transition-all ${
                      isActive
                        ? 'bg-[#E8DCCB] text-[#292522] font-semibold shadow-sm'
                        : 'text-[#FAF7F2]/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: Mode & User & Logout */}
        <div className="p-4 border-t border-[#3D3733] space-y-3">
          {/* Database Mode Status */}
          <div className="px-3 py-2 bg-white/5 rounded-sm border border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-[#FAF7F2]/60 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Storage:</span>
            </span>
            <span
              className={`font-medium ${
                isFirebaseActive ? 'text-emerald-400' : 'text-amber-300'
              }`}
            >
              {isFirebaseActive ? 'Firebase Active' : 'Local Sandbox'}
            </span>
          </div>

          {/* User profile */}
          <div className="px-3 py-1 text-xs">
            <span className="block text-[#FAF7F2]/50 text-[10px] uppercase tracking-wider">
              Signed In As
            </span>
            <span className="block font-medium text-white truncate">
              {admin?.email}
            </span>
          </div>

          {/* Public store shortcut */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-[#E8DCCB] hover:text-white hover:bg-white/5 transition-colors border border-dashed border-[#FAF7F2]/20"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Store</span>
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-800/40 text-xs font-medium uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-[#E8E0D5] px-8 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#8A7869]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authenticated Administrator Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-wider font-semibold text-[#292522] hover:text-[#8A7869] flex items-center gap-1.5 transition-colors"
            >
              <span>View Public Boutique</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
