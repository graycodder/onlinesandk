import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, ShieldCheck, HeartHandshake, Compass } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getPublishedProducts } from '../services/productService';
import { getPublishedCollections } from '../services/collectionService';
import type { Product, Collection } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/LoadingSkeleton';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { buildWhatsAppUrl } from '../utils/whatsapp';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodList, colList] = await Promise.all([
          getPublishedProducts(),
          getPublishedCollections(),
        ]);
        setProducts(prodList);
        setCollections(colList);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);

  const conciergeWhatsAppUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hello Sash & Knot Atelier, I am visiting your website and would love to consult with a designer regarding custom dresses and collection availability.`
  );

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center bg-[#1A1715] text-[#FAF7F2] overflow-hidden">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              settings.hero?.image ||
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1600'
            }
            alt="Sash & Knot Luxury Fashion"
            className="w-full h-full object-cover object-center opacity-45 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1715] via-transparent to-transparent opacity-90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl space-y-6 fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[#E8DCCB] text-[11px] uppercase tracking-[0.25em] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#E8DCCB]" />
              <span>Artisanal Clothing &bull; WhatsApp Concierge</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-white">
              {settings.hero?.heading || 'Style That Feels Like You.'}
            </h1>

            <p className="text-sm sm:text-base text-[#FAF7F2]/80 font-light leading-relaxed max-w-xl">
              {settings.hero?.description ||
                'Handcrafted silhouettes, diaphanous silks, and bespoke occasion wear designed with timeless poise.'}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#E8DCCB] text-[#292522] text-xs uppercase tracking-widest font-semibold hover:bg-white transition-all shadow-xl group"
              >
                <span>{settings.hero?.primaryButtonText || 'Explore Collection'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?filter=new"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-[#FAF7F2] border border-[#FAF7F2]/40 text-xs uppercase tracking-widest font-medium hover:bg-white/10 transition-colors"
              >
                <span>{settings.hero?.secondaryButtonText || 'Discover New Arrivals'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Boutique Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#E8E0D5]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8DCCB]/50 flex items-center justify-center text-[#292522] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#8A7869]" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#292522] font-medium">Bespoke Fit Verification</h4>
              <p className="text-xs text-[#8A7869] mt-1 leading-relaxed">
                We review measurements directly on WhatsApp before creating or dispatching your garments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8DCCB]/50 flex items-center justify-center text-[#292522] shrink-0">
              <Compass className="w-5 h-5 text-[#8A7869]" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#292522] font-medium">Curated Small Batches</h4>
              <p className="text-xs text-[#8A7869] mt-1 leading-relaxed">
                Every dress is tailored in limited runs using pure Mulberry silks and European flax linen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#E8DCCB]/50 flex items-center justify-center text-[#292522] shrink-0">
              <HeartHandshake className="w-5 h-5 text-[#8A7869]" />
            </div>
            <div>
              <h4 className="font-serif text-base text-[#292522] font-medium">Direct WhatsApp Concierge</h4>
              <p className="text-xs text-[#8A7869] mt-1 leading-relaxed">
                No automated bot checkouts. Speak with real stylists who know the drape of each dress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
              Curated Lines
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
              Signature Collections
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#292522] hover:text-[#8A7869] transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={`/collections/${col.slug}`}
              className="group relative block aspect-[3/4] overflow-hidden bg-[#292522] border border-[#E8E0D5]"
            >
              <ImageWithFallback
                src={col.coverImage}
                alt={col.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                <span className="text-[10px] uppercase tracking-widest text-[#E8DCCB] font-medium mb-1">
                  Collection
                </span>
                <h3 className="font-serif text-xl text-white font-normal group-hover:text-[#E8DCCB] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[#FAF7F2]/75 line-clamp-2 mt-1 font-light">
                  {col.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
              Hand-Selected
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
              {settings.featuredHeading || 'Curated Occasion Wear'}
            </h2>
            <p className="text-xs text-[#8A7869] mt-1 max-w-xl">
              {settings.featuredSubtitle ||
                'Hand-picked statement dresses celebrating artisanal craftsmanship and modern form.'}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#292522] hover:text-[#8A7869] transition-colors"
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#E8E0D5]">
            <p className="text-sm text-[#8A7869]">No featured dresses found in the catalogue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Editorial & Atelier Story */}
      <section className="bg-[#FAF7F2] border-y border-[#E8E0D5] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Editorial Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] bg-[#E8DCCB] border border-[#D9CEBF] shadow-xl overflow-hidden">
                <ImageWithFallback
                  src={
                    settings.aboutSection?.image ||
                    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000'
                  }
                  alt="Sash & Knot Tailoring Craft"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden sm:block p-6 bg-[#292522] text-[#FAF7F2] border border-[#3D3733] shadow-lg max-w-xs">
                <p className="font-serif text-lg italic text-[#E8DCCB]">
                  &ldquo;A dress should never overpower the woman who wears it.&rdquo;
                </p>
                <span className="block text-[10px] uppercase tracking-widest text-[#FAF7F2]/60 mt-2">
                  Sash &amp; Knot Philosophy
                </span>
              </div>
            </div>

            {/* Story Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block">
                Atelier Philosophy
              </span>

              <h2 className="font-serif text-3xl sm:text-5xl text-[#292522] font-normal leading-tight">
                {settings.aboutSection?.heading || 'The Art of Subtle Luxury'}
              </h2>

              <p className="text-sm text-[#292522]/80 leading-relaxed font-light">
                {settings.aboutSection?.story1 ||
                  'At Sash & Knot, we believe true sophistication resides in the details—the whisper of pure mulberry silk against skin, the precision of a hand-knotted sash, and silhouettes that move with innate grace.'}
              </p>

              <p className="text-sm text-[#292522]/80 leading-relaxed font-light">
                {settings.aboutSection?.story2 ||
                  'Each piece in our catalogue is thoughtfully tailored in limited batches. We connect with our clientele personally on WhatsApp to discuss exact measurements, fabric draping, and styling advice before confirming every garment.'}
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={conciergeWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#D9CEBF] text-[#292522] text-xs uppercase tracking-widest font-semibold hover:bg-[#F5EFE6] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#8A7869]" />
                  <span>Ask a Stylist</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Season Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
              Fresh Off The Loom
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
              {settings.newArrivalsHeading || 'The New Season'}
            </h2>
            <p className="text-xs text-[#8A7869] mt-1 max-w-xl">
              {settings.newArrivalsSubtitle ||
                'Fresh arrivals crafted from pure mulberry silks and fine Belgian linens.'}
            </p>
          </div>
          <Link
            to="/shop?filter=new"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#292522] hover:text-[#8A7869] transition-colors"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
