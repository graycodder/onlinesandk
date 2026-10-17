import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-white border border-[#E8E0D5] animate-pulse">
      <div className="w-full aspect-[3/4] bg-[#EFE7DC]" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-[#EFE7DC] rounded" />
        <div className="h-4 w-3/4 bg-[#E2D8CC] rounded" />
        <div className="h-4 w-1/4 bg-[#EFE7DC] rounded" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full bg-[#EFE7DC]" />
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-[3/4] bg-[#EFE7DC]" />
            <div className="aspect-[3/4] bg-[#EFE7DC]" />
            <div className="aspect-[3/4] bg-[#EFE7DC]" />
            <div className="aspect-[3/4] bg-[#EFE7DC]" />
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-1/4 bg-[#EFE7DC] rounded" />
          <div className="h-8 w-3/4 bg-[#E2D8CC] rounded" />
          <div className="h-6 w-1/3 bg-[#EFE7DC] rounded" />
          <div className="h-20 w-full bg-[#EFE7DC] rounded" />
          <div className="h-10 w-full bg-[#E2D8CC] rounded" />
        </div>
      </div>
    </div>
  );
};
