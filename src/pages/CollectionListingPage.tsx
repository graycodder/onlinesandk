import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getPublishedCollections } from '../services/collectionService';
import { getPublishedProducts } from '../services/productService';
import type { Collection, Product } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export const CollectionListingPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const [colList, prodList] = await Promise.all([
          getPublishedCollections(),
          getPublishedProducts(),
        ]);
        setCollections(colList);
        setProducts(prodList);
      } catch (err) {
        console.error('Error loading collections:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium">
          Curated Lines
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#292522]">
          Collections &amp; Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#8A7869] font-light leading-relaxed">
          Each Sash &amp; Knot collection embodies a distinct mood—from sculpted silk evening gowns to breathable Belgian linen prêt wear.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[16/10] bg-[#EFE7DC]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {collections.map((col) => {
            const count = products.filter((p) => p.categoryId === col.id).length;
            return (
              <Link
                key={col.id}
                to={`/collections/${col.slug}`}
                className="group relative block aspect-[16/11] bg-[#1A1715] border border-[#E8E0D5] overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <ImageWithFallback
                  src={col.coverImage}
                  alt={col.name}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10">
                  <span className="text-xs uppercase tracking-widest text-[#E8DCCB] font-medium mb-1">
                    {count} {count === 1 ? 'Design' : 'Designs'}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal group-hover:text-[#E8DCCB] transition-colors">
                    {col.name}
                  </h2>
                  <p className="text-xs text-[#FAF7F2]/80 mt-2 line-clamp-2 max-w-lg font-light">
                    {col.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-white group-hover:text-[#E8DCCB] transition-colors">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
