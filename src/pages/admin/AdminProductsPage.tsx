import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  Shirt,
} from 'lucide-react';
import {
  getAllProductsAdmin,
  deleteProduct,
  toggleProductStatus,
} from '../../services/productService';
import { getAllCollectionsAdmin } from '../../services/collectionService';
import type { Product, Collection, ProductStatus } from '../../types';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([
        getAllProductsAdmin(),
        getAllCollectionsAdmin(),
      ]);
      setProducts(prods);
      setCollections(cols);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus = await toggleProductStatus(product.id, product.status);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      setNotice(`"${product.name}" is now ${newStatus}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Could not update status. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
      setNotice('Product deleted successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Could not delete product. Please try again.');
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesCollection =
      collectionFilter === 'all' || p.categoryId === collectionFilter;

    return matchesSearch && matchesStatus && matchesCollection;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D5] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
            Catalogue Inventory
          </span>
          <h1 className="font-serif text-3xl text-[#292522] font-normal">
            Garments &amp; Dresses ({products.length})
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#E8DCCB]" />
          <span>Add New Garment</span>
        </Link>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-sm fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 border border-[#E8E0D5] shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7869]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dress name or slug..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
          >
            <option value="all">All Collections</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full border border-[#E8E0D5] shadow-2xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif text-xl text-[#292522]">Delete Garment?</h3>
            <p className="text-xs text-[#8A7869] leading-relaxed">
              Are you sure you want to delete this garment? This action cannot be reversed.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 bg-red-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-gray-100 text-[#292522] text-xs font-medium uppercase tracking-wider hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E8E0D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8A7869]">
            Loading garments catalogue...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <Shirt className="w-12 h-12 text-[#D9CEBF] mx-auto mb-3" />
            <p className="text-xs text-[#8A7869]">No garments matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#8A7869] uppercase tracking-wider border-b border-[#E8E0D5]">
                <tr>
                  <th className="py-3.5 px-4">Garment</th>
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Sizes</th>
                  <th className="py-3.5 px-4">Colours</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Garment Image & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-[#F5EFE6] border border-[#E8E0D5] shrink-0 overflow-hidden">
                          <ImageWithFallback
                            src={product.primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-[#292522] block text-sm">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-[#8A7869]">/{product.slug}</span>
                          <div className="flex gap-1 mt-1">
                            {product.featured && (
                              <span className="px-1.5 py-0.2 bg-[#292522] text-[#FAF7F2] text-[9px] uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                            {product.newArrival && (
                              <span className="px-1.5 py-0.2 bg-[#E8DCCB] text-[#292522] text-[9px] uppercase tracking-wider font-semibold">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Collection */}
                    <td className="py-3.5 px-4 text-[#8A7869]">
                      {product.categoryName || '—'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <span className="font-sans font-semibold text-[#292522]">
                        {formatINR(product.price)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="block text-[10px] text-[#A09184] line-through">
                          {formatINR(product.compareAtPrice)}
                        </span>
                      )}
                    </td>

                    {/* Sizes */}
                    <td className="py-3.5 px-4 text-[#8A7869]">
                      {product.sizes && product.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {product.sizes.map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 bg-[#F5EFE6] text-[10px] border border-[#E8E0D5]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Colours */}
                    <td className="py-3.5 px-4 text-[#8A7869]">
                      {product.colours && product.colours.length > 0
                        ? product.colours.join(', ')
                        : '—'}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-sm transition-colors ${
                          product.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {product.status === 'published' ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-700" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview link */}
                        <Link
                          to={`/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-[#8A7869] hover:text-[#292522]"
                          title="Preview product in store"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-[#8A7869] hover:text-[#292522]"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingId(product.id)}
                          className="p-1.5 text-[#8A7869] hover:text-red-700 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
