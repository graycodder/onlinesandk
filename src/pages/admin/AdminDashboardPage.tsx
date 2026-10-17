import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shirt,
  FolderTree,
  Sparkles,
  FileText,
  PlusCircle,
  Settings,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { getAllProductsAdmin } from '../../services/productService';
import { getAllCollectionsAdmin } from '../../services/collectionService';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import type { Product, Collection } from '../../types';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const AdminDashboardPage: React.FC = () => {
  const { settings } = useSettings();
  const { isFirebaseActive } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [prods, cols] = await Promise.all([
          getAllProductsAdmin(),
          getAllCollectionsAdmin(),
        ]);
        setProducts(prods);
        setCollections(cols);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const publishedProducts = products.filter((p) => p.status === 'published');
  const draftProducts = products.filter((p) => p.status === 'draft');
  const featuredProducts = products.filter((p) => p.featured);
  const publishedCollections = collections.filter((c) => c.status === 'published');

  const recentProducts = [...products]
    .sort((a, b) => (new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#8A7869]">
        Loading atelier dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D5] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
            Overview &amp; Statistics
          </span>
          <h1 className="font-serif text-3xl text-[#292522] font-normal">
            Atelier Management Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#E8DCCB]" />
            <span>Add Garment</span>
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D9CEBF] text-[#292522] text-xs uppercase tracking-wider font-medium hover:bg-[#F5EFE6] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#8A7869]" />
            <span>Store Settings</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Published Products */}
        <div className="bg-white p-5 sm:p-6 border border-[#E8E0D5] shadow-sm">
          <div className="flex items-center justify-between text-[#8A7869] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Published Items</span>
            <Shirt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#292522]">
            {publishedProducts.length}
          </div>
          <span className="text-[11px] text-[#8A7869] mt-1 block">Live on boutique catalogue</span>
        </div>

        {/* Draft Products */}
        <div className="bg-white p-5 sm:p-6 border border-[#E8E0D5] shadow-sm">
          <div className="flex items-center justify-between text-[#8A7869] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Draft Items</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#292522]">
            {draftProducts.length}
          </div>
          <span className="text-[11px] text-[#8A7869] mt-1 block">Unpublished garments</span>
        </div>

        {/* Collections */}
        <div className="bg-white p-5 sm:p-6 border border-[#E8E0D5] shadow-sm">
          <div className="flex items-center justify-between text-[#8A7869] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Collections</span>
            <FolderTree className="w-4 h-4 text-[#292522]" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#292522]">
            {publishedCollections.length}
          </div>
          <span className="text-[11px] text-[#8A7869] mt-1 block">Active fashion lines</span>
        </div>

        {/* Featured Dresses */}
        <div className="bg-white p-5 sm:p-6 border border-[#E8E0D5] shadow-sm">
          <div className="flex items-center justify-between text-[#8A7869] mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold">Featured</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-3xl sm:text-4xl text-[#292522]">
            {featuredProducts.length}
          </div>
          <span className="text-[11px] text-[#8A7869] mt-1 block">Highlighted on homepage</span>
        </div>
      </div>

      {/* Integration & WhatsApp Status Card */}
      <div className="bg-white border border-[#E8E0D5] p-6 shadow-sm">
        <h3 className="font-serif text-lg text-[#292522] mb-4">
          Boutique Channel &amp; Connectivity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs divide-y md:divide-y-0 md:divide-x divide-[#E8E0D5]">
          <div className="space-y-1">
            <span className="text-[#8A7869] block">WhatsApp Enquiry Destination:</span>
            <span className="font-medium text-[#292522] text-sm flex items-center gap-1.5 font-sans">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              {settings.whatsappDisplayNumber || settings.whatsappNumber || 'Not Configured'}
            </span>
            <Link
              to="/admin/settings"
              className="text-[11px] text-[#8A7869] hover:text-[#292522] underline block pt-1"
            >
              Update WhatsApp destination
            </Link>
          </div>

          <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
            <span className="text-[#8A7869] block">Database Connection:</span>
            <span className="font-medium text-[#292522] text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#8A7869]" />
              {isFirebaseActive ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Firebase Cloud
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Local Storage Sandbox</span>
              )}
            </span>
            <span className="text-[11px] text-[#8A7869] block pt-1">
              {isFirebaseActive ? 'Live production synchronisation' : 'Running offline / demo mode'}
            </span>
          </div>

          <div className="pt-4 md:pt-0 md:pl-6 space-y-1">
            <span className="text-[#8A7869] block">Public Storefront:</span>
            <span className="font-medium text-[#292522] text-sm block">
              {settings.brandName || 'Sash & Knot'}
            </span>
            <Link
              to="/"
              target="_blank"
              className="text-[11px] text-[#292522] font-semibold flex items-center gap-1 pt-1 hover:underline"
            >
              <span>Visit live boutique</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white border border-[#E8E0D5] shadow-sm">
        <div className="p-5 border-b border-[#E8E0D5] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-[#292522]">Catalogue Garments</h3>
            <p className="text-xs text-[#8A7869] mt-0.5">Recently added or edited clothing pieces</p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs uppercase tracking-wider font-semibold text-[#292522] hover:text-[#8A7869] flex items-center gap-1 transition-colors"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="p-12 text-center text-[#8A7869]">
            <Shirt className="w-10 h-10 text-[#D9CEBF] mx-auto mb-2" />
            <p className="text-xs">No garments found in database.</p>
            <Link
              to="/admin/products/new"
              className="mt-3 inline-block px-4 py-2 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider"
            >
              Add First Dress
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#8A7869] uppercase tracking-wider border-b border-[#E8E0D5]">
                <tr>
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-[#F5EFE6] border border-[#E8E0D5] overflow-hidden shrink-0">
                          <ImageWithFallback
                            src={p.primaryImage}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-[#292522] block">{p.name}</span>
                          <span className="text-[10px] text-[#8A7869]">/{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#8A7869]">{p.categoryName || '—'}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-[#292522]">
                      {formatINR(p.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${
                          p.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {p.featured && (
                          <span className="px-1.5 py-0.5 bg-[#292522] text-[#FAF7F2] text-[9px] uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                        {p.newArrival && (
                          <span className="px-1.5 py-0.5 bg-[#E8DCCB] text-[#292522] text-[9px] uppercase tracking-wider font-semibold">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="text-xs uppercase tracking-wider font-semibold text-[#292522] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
