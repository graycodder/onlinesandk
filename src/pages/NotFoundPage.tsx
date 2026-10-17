import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center mb-2">
          <Logo size="lg" />
        </div>
        <div className="w-16 h-16 mx-auto rounded-full bg-[#E8DCCB]/60 text-[#292522] flex items-center justify-center">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
            404 &bull; Page Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
            Lost in Silhouette
          </h1>
          <p className="text-xs text-[#8A7869] mt-2 leading-relaxed">
            The page or garment you are seeking does not exist or may have been repositioned within our collection.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#D9CEBF] text-[#292522] text-xs uppercase tracking-widest font-semibold hover:bg-[#F5EFE6] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-[#8A7869]" />
            <span>Browse Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
