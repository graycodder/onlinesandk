import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Shield } from 'lucide-react';
import { Logo } from '../common/Logo';
import { AnnouncementBar } from './AnnouncementBar';
import { useEnquiryBag } from '../../context/EnquiryBagContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { itemCount, openDrawer } = useEnquiryBag();
  const { admin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop Catalogue', to: '/shop' },
    { label: 'Collections', to: '/collections' },
    { label: 'New Arrivals', to: '/shop?filter=new' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E0D5] transition-all">
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-[#292522] hover:text-[#8A7869] focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Left Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest transition-colors font-medium ${
                  isActive ? 'text-[#292522] border-b border-[#292522] pb-0.5' : 'text-[#8A7869] hover:text-[#292522]'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest transition-colors font-medium ${
                  isActive ? 'text-[#292522] border-b border-[#292522] pb-0.5' : 'text-[#8A7869] hover:text-[#292522]'
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest transition-colors font-medium ${
                  isActive ? 'text-[#292522] border-b border-[#292522] pb-0.5' : 'text-[#8A7869] hover:text-[#292522]'
                }`
              }
            >
              Collections
            </NavLink>
          </nav>

          {/* Center: Brand Logo */}
          <div className="flex-1 lg:flex-initial flex justify-center py-2">
            <Logo size="md" />
          </div>

          {/* Right Navigation & Utility Icons */}
          <div className="flex items-center space-x-5 sm:space-x-7">
            <nav className="hidden lg:flex items-center space-x-8 mr-2">
              <NavLink
                to="/shop?filter=new"
                className="text-xs uppercase tracking-widest text-[#8A7869] hover:text-[#292522] transition-colors font-medium"
              >
                New Arrivals
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-xs uppercase tracking-widest transition-colors font-medium ${
                    isActive ? 'text-[#292522] border-b border-[#292522] pb-0.5' : 'text-[#8A7869] hover:text-[#292522]'
                  }`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-xs uppercase tracking-widest transition-colors font-medium ${
                    isActive ? 'text-[#292522] border-b border-[#292522] pb-0.5' : 'text-[#8A7869] hover:text-[#292522]'
                  }`
                }
              >
                Contact
              </NavLink>
            </nav>

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#292522] hover:text-[#8A7869] transition-colors"
              aria-label="Search catalogue"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Portal quick link */}
            {admin ? (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider font-medium text-[#292522] bg-[#E8DCCB] border border-[#D9CEBF] hover:bg-[#D9CEBF] transition-colors"
                title="Go to Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="hidden sm:inline-block text-[11px] uppercase tracking-widest text-[#8A7869] hover:text-[#292522] transition-colors font-medium"
                title="Admin Sign In"
              >
                Admin
              </Link>
            )}

            {/* Enquiry Bag Button with Badge */}
            <button
              onClick={openDrawer}
              className="relative p-2 text-[#292522] hover:text-[#8A7869] transition-colors flex items-center gap-2 group"
              aria-label="View Enquiry Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#292522] text-[#FAF7F2] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#FAF7F2]">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block text-xs uppercase tracking-wider font-medium text-[#292522]">
                Enquiry ({itemCount})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 fade-in">
          <div className="bg-[#FAF7F2] border border-[#E8E0D5] w-full max-w-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#8A7869] hover:text-[#292522]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl sm:text-2xl text-[#292522] mb-3">Search Catalogue</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search gowns, silks, organza, pret dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#D9CEBF] py-3.5 pl-4 pr-12 text-[#292522] placeholder:text-[#A09184] focus:outline-none focus:border-[#292522] text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-3 bg-[#292522] text-white hover:bg-black transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#8A7869]">
              <span className="font-medium uppercase text-[10px] tracking-wider self-center">Popular:</span>
              {['Silk Gown', 'Cape Set', 'Belgian Linen', 'Organza', 'Evening'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    navigate(`/shop?search=${encodeURIComponent(term)}`);
                    setSearchOpen(false);
                  }}
                  className="px-2.5 py-1 bg-white border border-[#E8E0D5] hover:border-[#292522] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-[#FAF7F2] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8E0D5]">
                <Logo size="sm" showSubtitle={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#292522] hover:text-[#8A7869]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-serif text-[#292522] hover:text-[#8A7869] py-1 border-b border-[#F5EFE6]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E0D5] space-y-3">
              <Link
                to="/enquiry"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-medium"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Enquiry Bag ({itemCount})</span>
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-xs uppercase tracking-widest text-[#8A7869] hover:text-[#292522] py-2"
              >
                Administrator Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
