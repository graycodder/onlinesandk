import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import type { Product } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Badge } from './Badge';
import { ImageWithFallback } from './ImageWithFallback';
import { useEnquiryBag } from '../../context/EnquiryBagContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToBag } = useEnquiryBag();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColour, setSelectedColour] = useState<string>(product.colours?.[0] || '');
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [addedJustNow, setAddedJustNow] = useState(false);

  // Secondary image for hover effect if available
  const displayImage = isHovered && product.images && product.images.length > 1
    ? product.images[1].url
    : product.primaryImage || product.images?.[0]?.url;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has multiple sizes or colours and options drawer isn't shown yet, prompt selection
    if ((product.sizes?.length > 1 || product.colours?.length > 1) && !showQuickOptions) {
      setShowQuickOptions(true);
      return;
    }

    addToBag({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.primaryImage || product.images?.[0]?.url || '',
      selectedSize: selectedSize || (product.sizes?.[0] || ''),
      selectedColour: selectedColour || (product.colours?.[0] || ''),
      quantity: 1,
      collectionName: product.categoryName,
    });

    setAddedJustNow(true);
    setShowQuickOptions(false);
    setTimeout(() => setAddedJustNow(false), 2000);
  };

  return (
    <div
      className="group relative flex flex-col bg-white border border-[#E8E0D5] transition-all duration-300 hover:shadow-lg hover:border-[#D9CEBF]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickOptions(false);
      }}
    >
      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block w-full aspect-[3/4] overflow-hidden bg-[#F5EFE6]"
      >
        <ImageWithFallback
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.newArrival && <Badge type="new" />}
          {product.featured && <Badge type="featured" />}
        </div>

        {/* Quick actions overlay on desktop hover */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-between gap-2">
          <button
            onClick={handleQuickAdd}
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs uppercase tracking-wider font-medium text-[#292522] bg-[#FAF7F2] hover:bg-white transition-colors"
          >
            {addedJustNow ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Enquiry</span>
              </>
            )}
          </button>
          <div className="p-2 text-[#FAF7F2] bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Quick Variation Selector Popover */}
      {showQuickOptions && (
        <div className="p-3 bg-[#FAF7F2] border-t border-[#E8E0D5] text-xs space-y-2">
          {product.sizes?.length > 1 && (
            <div>
              <span className="font-medium text-[#8A7869] uppercase text-[10px] block mb-1">Select Size:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedSize(s);
                    }}
                    className={`px-2 py-0.5 border text-[11px] ${
                      selectedSize === s
                        ? 'border-[#292522] bg-[#292522] text-white'
                        : 'border-[#D9CEBF] bg-white text-[#292522]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colours?.length > 1 && (
            <div>
              <span className="font-medium text-[#8A7869] uppercase text-[10px] block mb-1">Select Colour:</span>
              <div className="flex flex-wrap gap-1.5">
                {product.colours.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedColour(c);
                    }}
                    className={`px-2 py-0.5 border text-[11px] ${
                      selectedColour === c
                        ? 'border-[#292522] bg-[#292522] text-white'
                        : 'border-[#D9CEBF] bg-white text-[#292522]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full mt-2 py-1.5 bg-[#292522] text-white text-xs font-medium uppercase tracking-wider hover:bg-black transition-colors"
          >
            Confirm &amp; Add to Bag
          </button>
        </div>
      )}

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {product.categoryName && (
            <span className="text-[11px] uppercase tracking-widest text-[#8A7869] font-medium block mb-1">
              {product.categoryName}
            </span>
          )}

          <h3 className="font-serif text-base sm:text-lg text-[#292522] font-normal leading-snug line-clamp-2 group-hover:text-[#8A7869] transition-colors">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Sizes indicator */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-[#8A7869] uppercase mr-1">Sizes:</span>
              {product.sizes.slice(0, 4).map((sz) => (
                <span
                  key={sz}
                  className="text-[10px] text-[#292522]/80 bg-[#FAF7F2] border border-[#E8E0D5] px-1 py-0.2 rounded-sm"
                >
                  {sz}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-[10px] text-[#8A7869]">+{product.sizes.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Mobile Quick Add */}
        <div className="mt-3 pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-semibold text-[#292522]">
              {formatINR(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#8A7869] line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Mobile view details / add button */}
          <button
            onClick={handleQuickAdd}
            type="button"
            className="sm:hidden p-2 text-[#292522] hover:text-[#8A7869] transition-colors"
            aria-label="Add to enquiry bag"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
