import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  MessageCircle,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { getProductBySlug, getPublishedProducts } from '../services/productService';
import type { Product } from '../types';
import { formatINR } from '../utils/formatters';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { useSettings } from '../context/SettingsContext';
import { useEnquiryBag } from '../context/EnquiryBagContext';
import { ProductCard } from '../components/common/ProductCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { Badge } from '../components/common/Badge';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const { addToBag } = useEnquiryBag();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selections
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const loadProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await getProductBySlug(slug);
        setProduct(prod);

        if (prod) {
          // Initialize defaults
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          } else {
            setSelectedSize('');
          }

          if (prod.colours && prod.colours.length > 0) {
            setSelectedColour(prod.colours[0]);
          } else {
            setSelectedColour('');
          }

          setActiveImageIndex(0);
          setQuantity(1);

          // Fetch related products
          const all = await getPublishedProducts();
          const related = all
            .filter((p) => p.id !== prod.id && p.categoryId === prod.categoryId)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-[#E8E0D5]/50 rounded-sm" />
          <div className="space-y-6">
            <div className="h-4 bg-[#E8E0D5] w-24" />
            <div className="h-10 bg-[#E8E0D5] w-3/4" />
            <div className="h-6 bg-[#E8E0D5] w-32" />
            <div className="h-24 bg-[#E8E0D5]/60" />
            <div className="h-12 bg-[#E8E0D5] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl text-[#292522] mb-3">Product Not Found</h2>
        <p className="text-sm text-[#8A7869] mb-8">
          The requested dress or garment is unavailable or may have been unlisted.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-medium hover:bg-black transition-colors"
        >
          Browse All Collections
        </Link>
      </div>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [product.primaryImage];

  const currentImage = galleryImages[activeImageIndex] || product.primaryImage;

  const handleAddToBag = () => {
    // Validate sizes if present
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError('Please select a size before adding to enquiry.');
      return;
    }
    // Validate colours if present
    if (product.colours && product.colours.length > 0 && !selectedColour) {
      setValidationError('Please select a colour before adding to enquiry.');
      return;
    }

    setValidationError(null);

    addToBag({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.primaryImage,
      selectedSize,
      selectedColour,
      quantity,
      collectionName: product.categoryName,
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const directWhatsAppText = `Hello Sash & Knot Atelier, I would like to enquire about:
- Product: ${product.name}
- Reference Price: ${formatINR(product.price)}
${selectedSize ? `- Preferred Size: ${selectedSize}` : ''}
${selectedColour ? `- Preferred Colour: ${selectedColour}` : ''}
- Quantity: ${quantity}
Link: ${window.location.href}

Please let me know about availability and bespoke sizing options.`;

  const directWhatsAppUrl = buildWhatsAppUrl(settings.whatsappNumber, directWhatsAppText);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Look at ${product.name} from Sash & Knot`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="pb-20">
      {/* Breadcrumb */}
      <div className="bg-[#F5EFE6]/50 border-b border-[#E8E0D5] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs text-[#8A7869] space-x-2">
            <Link to="/" className="hover:text-[#292522] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-[#D9CEBF]" />
            <Link to="/shop" className="hover:text-[#292522] transition-colors">Shop</Link>
            {product.categoryName && (
              <>
                <ChevronRight className="w-3 h-3 text-[#D9CEBF]" />
                <Link
                  to={`/collections/${product.categoryId}`}
                  className="hover:text-[#292522] transition-colors"
                >
                  {product.categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-[#D9CEBF]" />
            <span className="text-[#292522] truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Gallery (7 columns) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[640px] shrink-0 pb-2 md:pb-0">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 md:w-20 md:h-26 shrink-0 bg-[#F5EFE6] border transition-all overflow-hidden ${
                      activeImageIndex === idx
                        ? 'border-[#292522] ring-1 ring-[#292522]'
                        : 'border-[#E8E0D5] hover:border-[#8A7869] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 relative aspect-[3/4] bg-[#F5EFE6] border border-[#E8E0D5] overflow-hidden group">
              <ImageWithFallback
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                {product.newArrival && <Badge variant="gold">New Arrival</Badge>}
                {product.featured && <Badge variant="charcoal">Featured</Badge>}
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 bg-white/80 hover:bg-white text-[#292522] rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-95"
                title="Share product"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {copiedShare && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#292522] text-[#FAF7F2] text-xs px-3 py-1.5 rounded-sm shadow-lg fade-in">
                  Link copied to clipboard!
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info & Actions (5 columns) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="border-b border-[#E8E0D5] pb-6">
              {product.categoryName && (
                <span className="text-xs uppercase tracking-[0.2em] text-[#8A7869] font-medium block mb-2">
                  {product.categoryName}
                </span>
              )}
              <h1 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-sans text-2xl sm:text-3xl font-semibold text-[#292522]">
                  {formatINR(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="font-sans text-base text-[#A09184] line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-xs text-[#8A7869] italic">
                  (Estimated enquiry price)
                </span>
              </div>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-[#8A7869] mt-6 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                    Select Size: <span className="font-normal text-[#8A7869] normal-case">{selectedSize}</span>
                  </label>
                  <span className="text-[11px] text-[#8A7869] italic">Custom sizing available on WhatsApp</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setValidationError(null);
                      }}
                      className={`min-w-12 h-10 px-3 flex items-center justify-center text-xs font-medium uppercase tracking-wider transition-all border ${
                        selectedSize === size
                          ? 'border-[#292522] bg-[#292522] text-[#FAF7F2] shadow-sm'
                          : 'border-[#E8E0D5] bg-white text-[#292522] hover:border-[#8A7869]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colour Selector */}
            {product.colours && product.colours.length > 0 && (
              <div className="mt-6">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#292522] block mb-2">
                  Select Colour: <span className="font-normal text-[#8A7869] normal-case">{selectedColour}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colours.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => {
                        setSelectedColour(col);
                        setValidationError(null);
                      }}
                      className={`px-4 py-2 text-xs font-medium transition-all border ${
                        selectedColour === col
                          ? 'border-[#292522] bg-[#FAF7F2] text-[#292522] ring-1 ring-[#292522]'
                          : 'border-[#E8E0D5] bg-white text-[#8A7869] hover:border-[#8A7869]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6 flex items-center gap-4">
              <label className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                Quantity:
              </label>
              <div className="flex items-center border border-[#E8E0D5] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#8A7869] hover:text-[#292522] hover:bg-[#F5EFE6]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center font-sans text-xs font-semibold text-[#292522]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-[#8A7869] hover:text-[#292522] hover:bg-[#F5EFE6]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                {validationError}
              </div>
            )}

            {/* Call to Actions */}
            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleAddToBag}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-black transition-all shadow-md active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4 text-[#E8DCCB]" />
                <span>Add to Enquiry Bag</span>
              </button>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#E8DCCB] text-[#292522] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-white border border-[#D9CEBF] transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#292522]" />
                <span>Direct WhatsApp Enquiry</span>
              </a>
            </div>

            {addedNotice && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-sm fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Item added to your enquiry bag. You can continue shopping or view your bag anytime.</span>
              </div>
            )}

            {/* Atelier Guarantees */}
            <div className="mt-10 pt-8 border-t border-[#E8E0D5] grid grid-cols-2 gap-4 text-xs text-[#8A7869]">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#292522] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#292522]">Handcrafted Quality</h4>
                  <p className="text-[11px] mt-0.5">Custom fits &amp; pure fabrics vetted by atelier designers.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#292522] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#292522]">Direct Consultation</h4>
                  <p className="text-[11px] mt-0.5">Measurements &amp; drape verified on WhatsApp before finalizing.</p>
                </div>
              </div>
            </div>

            {/* Garment Details & Accordion-style Specifications */}
            <div className="mt-8 border-t border-[#E8E0D5] pt-6 space-y-4">
              {product.description && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-[#292522] mb-2">
                    Description
                  </h3>
                  <p className="text-xs text-[#8A7869] leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {(product.material || product.fit || product.careInstructions || product.additionalDetails) && (
                <div className="bg-white p-4 border border-[#E8E0D5] space-y-3 text-xs">
                  {product.material && (
                    <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                      <span className="text-[#8A7869]">Fabric &amp; Material:</span>
                      <span className="font-medium text-[#292522] text-right">{product.material}</span>
                    </div>
                  )}
                  {product.fit && (
                    <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                      <span className="text-[#8A7869]">Silhouette &amp; Fit:</span>
                      <span className="font-medium text-[#292522] text-right">{product.fit}</span>
                    </div>
                  )}
                  {product.careInstructions && (
                    <div className="flex justify-between py-1 border-b border-[#F5EFE6]">
                      <span className="text-[#8A7869]">Care Instructions:</span>
                      <span className="font-medium text-[#292522] text-right">{product.careInstructions}</span>
                    </div>
                  )}
                  {product.additionalDetails && (
                    <div className="py-1">
                      <span className="text-[#8A7869] block mb-1">Additional Details:</span>
                      <span className="text-[#292522] text-[11px] leading-relaxed block">{product.additionalDetails}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#E8E0D5]">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
                More from {product.categoryName || 'Our Boutique'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#292522] font-normal">
                You May Also Admire
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
