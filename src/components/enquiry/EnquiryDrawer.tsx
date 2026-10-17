import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useEnquiryBag } from '../../context/EnquiryBagContext';
import { formatINR } from '../../utils/formatters';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const EnquiryDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    removeFromBag,
    updateQuantity,
  } = useEnquiryBag();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col border-l border-[#E8E0D5]">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E0D5] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#292522]" />
              <h2 className="font-serif text-xl text-[#292522] font-medium">
                Enquiry Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-[#8A7869] hover:text-[#292522] transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bag Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-[#E8E0D5]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-[#D9CEBF] stroke-[1.5] mb-4" />
                <h3 className="font-serif text-lg text-[#292522]">Your enquiry bag is empty</h3>
                <p className="text-xs text-[#8A7869] mt-1 max-w-xs">
                  Discover our curated evening gowns, silks, and contemporary dresses.
                </p>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="mt-6 px-6 py-2.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
                >
                  Explore Catalogue
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 shrink-0 bg-[#F5EFE6] border border-[#E8E0D5] overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-sm font-medium text-[#292522] leading-tight">
                          <Link
                            to={`/product/${item.productSlug}`}
                            onClick={closeDrawer}
                            className="hover:text-[#8A7869] transition-colors"
                          >
                            {item.productName}
                          </Link>
                        </h4>
                        <button
                          onClick={() => removeFromBag(item.id)}
                          className="text-[#8A7869] hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variations */}
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[#8A7869]">
                        {item.selectedSize && (
                          <span>Size: <strong className="text-[#292522] font-medium">{item.selectedSize}</strong></span>
                        )}
                        {item.selectedColour && (
                          <span>&bull; Colour: <strong className="text-[#292522] font-medium">{item.selectedColour}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-[#D9CEBF] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-[#8A7869] hover:text-[#292522] disabled:opacity-30 disabled:hover:text-[#8A7869]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#292522]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-[#8A7869] hover:text-[#292522]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-sans text-xs font-semibold text-[#292522]">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[10px] text-[#8A7869]">
                            {formatINR(item.unitPrice)} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E8E0D5] space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[#8A7869]">
                  <span>Estimated Enquiry Total:</span>
                  <span className="font-semibold text-base text-[#292522] font-sans">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-[#8A7869]/80 italic">
                  * Prices and stock availability will be manually confirmed by Sash &amp; Knot on WhatsApp.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  to="/enquiry"
                  onClick={closeDrawer}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
                >
                  <span>Proceed to Enquiry ({itemCount})</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={closeDrawer}
                  className="w-full py-2 text-center text-xs uppercase tracking-wider text-[#8A7869] hover:text-[#292522] transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
