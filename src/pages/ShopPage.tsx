import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { getPublishedProducts } from '../services/productService';
import { getPublishedCollections } from '../services/collectionService';
import type { Product, Collection, ProductSortOption } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('collection') || 'all';
  const selectedSize = searchParams.get('size') || 'all';
  const filterType = searchParams.get('filter') || 'all'; // 'new' | 'featured' | 'all'
  const [sortBy, setSortBy] = useState<ProductSortOption>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodList, colList] = await Promise.all([
          getPublishedProducts(),
          getPublishedCollections(),
        ]);
        setProducts(prodList);
        setCollections(colList);
      } catch (err: any) {
        console.error('Error fetching catalogue:', err);
        setError('Unable to load catalogue. Please check your connection and retry.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search term
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q);
          const matchesCategory = p.categoryName?.toLowerCase().includes(q);
          const matchesMaterial = p.material?.toLowerCase().includes(q);
          if (!matchesName && !matchesDesc && !matchesCategory && !matchesMaterial) {
            return false;
          }
        }

        // Collection filter
        if (selectedCategory !== 'all') {
          const activeCol = collections.find(
            (c) => c.id === selectedCategory || c.slug === selectedCategory
          );
          const matchesDirectId = p.categoryId === selectedCategory;
          const matchesDirectSlug = Boolean(activeCol && (p.categoryId === activeCol.slug || p.categoryId === activeCol.id));
          const matchesCategoryName = Boolean(
            (p.categoryName && selectedCategory && p.categoryName.toLowerCase() === selectedCategory.toLowerCase()) ||
            (activeCol && p.categoryName && p.categoryName.toLowerCase() === activeCol.name.toLowerCase())
          );

          if (!matchesDirectId && !matchesDirectSlug && !matchesCategoryName) {
            return false;
          }
        }

        // Size filter
        if (selectedSize !== 'all') {
          if (!p.sizes || !p.sizes.some((s) => s.toLowerCase() === selectedSize.toLowerCase())) {
            return false;
          }
        }

        // Tag filter (new / featured)
        if (filterType === 'new' && !p.newArrival) return false;
        if (filterType === 'featured' && !p.featured) return false;

        // Price ceiling
        if (p.price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return a.displayOrder - b.displayOrder;
      });
  }, [products, collections, searchQuery, selectedCategory, selectedSize, filterType, maxPrice, sortBy]);

  // Extract all unique sizes from products
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => sizeSet.add(s));
    });
    return Array.from(sizeSet);
  }, [products]);

  const handleCategoryChange = (catId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('collection');
    } else {
      newParams.set('collection', catId);
    }
    setSearchParams(newParams);
  };

  const handleSizeChange = (size: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (size === 'all') {
      newParams.delete('size');
    } else {
      newParams.set('size', size);
    }
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchParams({});
    setMaxPrice(50000);
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    filterType !== 'all' ||
    maxPrice < 50000
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium">
          Artisanal Catalogue
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#292522] font-normal">
          The Complete Collection
        </h1>
        <p className="text-xs sm:text-sm text-[#8A7869] font-light leading-relaxed">
          Explore handcrafted evening gowns, mulberry silks, and contemporary silhouettes. Add multiple dresses to your enquiry bag to confirm bespoke sizing on WhatsApp.
        </p>
      </div>

      {/* Control Bar: Search, Mobile Filter Toggle, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-4 border-y border-[#E8E0D5] mb-8 bg-[#FAF7F2]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search dresses, silks, silhouettes..."
            value={searchQuery}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('search', e.target.value);
              } else {
                newParams.delete('search');
              }
              setSearchParams(newParams);
            }}
            className="w-full bg-white border border-[#D9CEBF] py-2 pl-9 pr-4 text-xs text-[#292522] placeholder:text-[#A09184] focus:outline-none focus:border-[#292522]"
          />
          <Search className="w-4 h-4 text-[#8A7869] absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('search');
                setSearchParams(newParams);
              }}
              className="absolute right-2.5 top-2.5 text-[#8A7869] hover:text-[#292522]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#D9CEBF] text-xs uppercase tracking-wider text-[#292522] font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8A7869] hidden sm:inline uppercase text-[10px] tracking-wider font-medium">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="bg-white border border-[#D9CEBF] py-2 px-3 text-xs text-[#292522] focus:outline-none focus:border-[#292522]"
            >
              <option value="newest">Featured &amp; Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 pr-4 border-r border-[#E8E0D5]">
          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="p-4 bg-white border border-[#E8E0D5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                  Active Filters
                </span>
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] text-[#8A7869] hover:text-[#292522] flex items-center gap-1 underline underline-offset-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          )}

          {/* Collections Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#292522] font-semibold border-b border-[#E8E0D5] pb-2">
              Collections
            </h3>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left py-1 px-2 transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#292522] text-white font-medium'
                    : 'text-[#8A7869] hover:text-[#292522] hover:bg-[#F5EFE6]'
                }`}
              >
                All Collections ({products.length})
              </button>
              {collections.map((col) => {
                const isSelected = selectedCategory === col.id || selectedCategory === col.slug;
                const count = products.filter((p) =>
                  p.categoryId === col.id ||
                  p.categoryId === col.slug ||
                  (p.categoryName && p.categoryName.toLowerCase() === col.name.toLowerCase())
                ).length;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleCategoryChange(col.id)}
                    className={`w-full text-left py-1.5 px-2 transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#292522] text-white font-medium'
                        : 'text-[#8A7869] hover:text-[#292522] hover:bg-[#F5EFE6]'
                    }`}
                  >
                    <span className="truncate pr-1">{col.name}</span>
                    <span className="text-[11px] opacity-75 shrink-0">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes Filter */}
          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-[#292522] font-semibold border-b border-[#E8E0D5] pb-2">
                Available Sizes
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSizeChange('all')}
                  className={`px-2.5 py-1 text-xs border ${
                    selectedSize === 'all'
                      ? 'bg-[#292522] text-white border-[#292522]'
                      : 'bg-white text-[#292522] border-[#D9CEBF] hover:border-[#292522]'
                  }`}
                >
                  All
                </button>
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSizeChange(sz)}
                    className={`px-2.5 py-1 text-xs border ${
                      selectedSize === sz
                        ? 'bg-[#292522] text-white border-[#292522]'
                        : 'bg-white text-[#292522] border-[#D9CEBF] hover:border-[#292522]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-2">
              <h3 className="text-xs uppercase tracking-widest text-[#292522] font-semibold">
                Maximum Price
              </h3>
              <span className="text-xs font-semibold text-[#292522]">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#292522] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#8A7869]">
              <span>₹5,000</span>
              <span>₹50,000</span>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {/* Status summary */}
          <div className="flex items-center justify-between mb-6 text-xs text-[#8A7869]">
            <span>
              Showing <strong className="text-[#292522]">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'dress' : 'dresses'}
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#8A7869] hover:text-[#292522] underline underline-offset-2"
              >
                Reset all filters
              </button>
            )}
          </div>

          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <div className="p-8 text-center bg-white border border-red-200 space-y-4">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#292522] text-white text-xs uppercase tracking-wider"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E8E0D5] space-y-4">
              <p className="font-serif text-xl text-[#292522]">No garments match your selected filters</p>
              <p className="text-xs text-[#8A7869] max-w-sm mx-auto">
                Try widening your price range, searching a different term, or viewing all collections.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-6 py-2.5 bg-[#292522] text-white text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#FAF7F2] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
                <h3 className="font-serif text-lg text-[#292522]">Filters</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-[#8A7869] hover:text-[#292522]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Collections */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#292522] block">
                  Collection
                </span>
                <select
                  value={
                    collections.find((c) => c.id === selectedCategory || c.slug === selectedCategory)?.id ||
                    selectedCategory
                  }
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-white border border-[#D9CEBF] py-2 px-3 text-xs"
                >
                  <option value="all">All Collections ({products.length})</option>
                  {collections.map((col) => {
                    const count = products.filter(
                      (p) =>
                        p.categoryId === col.id ||
                        p.categoryId === col.slug ||
                        (p.categoryName && p.categoryName.toLowerCase() === col.name.toLowerCase())
                    ).length;
                    return (
                      <option key={col.id} value={col.id}>
                        {col.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sizes */}
              {availableSizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#292522] block">
                    Size
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSizeChange('all')}
                      className={`px-2.5 py-1 text-xs border ${
                        selectedSize === 'all'
                          ? 'bg-[#292522] text-white border-[#292522]'
                          : 'bg-white text-[#292522] border-[#D9CEBF]'
                      }`}
                    >
                      All
                    </button>
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeChange(sz)}
                        className={`px-2.5 py-1 text-xs border ${
                          selectedSize === sz
                            ? 'bg-[#292522] text-white border-[#292522]'
                            : 'bg-white text-[#292522] border-[#D9CEBF]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Max Price:</span>
                  <span>₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#292522]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E0D5] space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#292522] text-white text-xs uppercase tracking-widest font-semibold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  resetAllFilters();
                  setMobileFiltersOpen(false);
                }}
                className="w-full py-2 text-center text-xs text-[#8A7869]"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
