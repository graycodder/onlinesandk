import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { getCollectionBySlug } from '../services/collectionService';
import { getPublishedProducts } from '../services/productService';
import type { Collection, Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';

export const CollectionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const col = await getCollectionBySlug(slug);
        setCollection(col);

        if (col) {
          const allProducts = await getPublishedProducts();
          const filtered = allProducts.filter(
            (p) =>
              p.categoryId === col.id ||
              p.categoryId === col.slug ||
              (p.categoryName && p.categoryName.toLowerCase() === col.name.toLowerCase())
          );
          setProducts(filtered);
        }
      } catch (err) {
        console.error('Error fetching collection detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-48 bg-[#EFE7DC] animate-pulse mb-12" />
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#292522]">Collection Not Found</h2>
        <p className="text-xs text-[#8A7869]">
          The collection you are looking for does not exist or has been retired.
        </p>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#292522] text-white text-xs uppercase tracking-widest font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Collections</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#8A7869] mb-8 uppercase tracking-wider">
        <Link to="/" className="hover:text-[#292522]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/collections" className="hover:text-[#292522]">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#292522] font-semibold">{collection.name}</span>
      </nav>

      {/* Hero Banner for Collection */}
      <div className="relative mb-14 bg-[#1A1715] border border-[#E8E0D5] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={collection.coverImage}
            alt={collection.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="relative z-10 p-8 sm:p-14 max-w-2xl text-white space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-[#E8DCCB] font-medium block">
            Signature Line
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-white">
            {collection.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#FAF7F2]/80 leading-relaxed font-light">
            {collection.description}
          </p>
          <span className="inline-block text-xs uppercase tracking-wider text-[#E8DCCB] pt-2">
            {products.length} {products.length === 1 ? 'Design Available' : 'Designs Available'}
          </span>
        </div>
      </div>

      {/* Products list */}
      {products.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E8E0D5] space-y-3">
          <p className="font-serif text-xl text-[#292522]">No garments in this collection yet</p>
          <p className="text-xs text-[#8A7869]">
            Our ateliers are preparing fresh pieces for {collection.name}.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-4 px-6 py-2.5 bg-[#292522] text-white text-xs uppercase tracking-widest font-medium"
          >
            Explore Other Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
