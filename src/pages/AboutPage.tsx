import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HeartHandshake, Scissors, ArrowRight, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  const conciergeUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hello Sash & Knot Atelier, I would like to know more about your bespoke craftsmanship and upcoming collections.'
  );

  return (
    <div className="pb-24">
      {/* Editorial Hero Header */}
      <section className="bg-[#1F1C1A] text-[#FAF7F2] py-20 sm:py-28 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#E8DCCB] font-medium block mb-3">
            The Atelier Story
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight">
            {settings.aboutSection?.heading || 'Crafted with Grace, Tailored for Poise'}
          </h1>
          <p className="text-sm sm:text-base text-[#FAF7F2]/80 mt-6 max-w-2xl mx-auto font-light leading-relaxed">
            {settings.brandIntroduction ||
              'Sash & Knot is a bespoke clothing atelier celebrating timeless silhouettes, artisanal textures, and contemporary elegance.'}
          </p>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] bg-[#F5EFE6] border border-[#E8E0D5] overflow-hidden shadow-lg">
              <ImageWithFallback
                src={
                  settings.aboutSection?.image ||
                  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
                }
                alt="Sash and Knot atelier craft"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:block p-6 bg-[#292522] text-[#FAF7F2] border border-[#3D3733] max-w-xs shadow-xl">
              <span className="text-[10px] uppercase tracking-widest text-[#E8DCCB] block mb-1">
                Heritage &amp; Detail
              </span>
              <p className="font-serif text-sm font-normal">
                Every stitch is a conscious intention of grace and comfort.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block">
              Our Philosophy
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal leading-snug">
              Bespoke Artistry Without Mass Production
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#8A7869] leading-relaxed">
              <p>
                {settings.aboutSection?.story1 ||
                  'Founded with an unwavering passion for handpicked textiles, Sash & Knot merges classical tailoring with modern feminine aesthetics. We reject the hurry of fast-fashion in favour of garments that feel personal and memorable.'}
              </p>
              <p>
                {settings.aboutSection?.story2 ||
                  'From pure mulberry silk evening gowns to breathable handcrafted day dresses, our pieces are fashioned for discerning patrons who value quiet luxury and artisanal authenticity.'}
              </p>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-6 border-t border-[#E8E0D5]">
              <div>
                <span className="font-serif text-2xl text-[#292522] block font-semibold">100%</span>
                <span className="text-xs text-[#8A7869] uppercase tracking-wider">Natural Fibres</span>
              </div>
              <div>
                <span className="font-serif text-2xl text-[#292522] block font-semibold">Handmade</span>
                <span className="text-xs text-[#8A7869] uppercase tracking-wider">Atelier Finishes</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
              >
                <span>Browse The Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-2">
            The Sash &amp; Knot Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
            Distinguished by Craft
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 border border-[#E8E0D5] shadow-sm space-y-4">
            <div className="w-12 h-12 bg-[#FAF7F2] border border-[#E8E0D5] rounded-full flex items-center justify-center text-[#292522]">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-[#292522]">Made-to-Measure Options</h3>
            <p className="text-xs text-[#8A7869] leading-relaxed">
              Every customer has unique proportions. Through our WhatsApp concierge, we consult with you on bust, waist, and length measurements before cutting fabric.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#E8E0D5] shadow-sm space-y-4">
            <div className="w-12 h-12 bg-[#FAF7F2] border border-[#E8E0D5] rounded-full flex items-center justify-center text-[#292522]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-[#292522]">Exquisite Textiles</h3>
            <p className="text-xs text-[#8A7869] leading-relaxed">
              We source raw silks, georgette, organza, and natural cottons directly from heritage weaving clusters across India.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#E8E0D5] shadow-sm space-y-4">
            <div className="w-12 h-12 bg-[#FAF7F2] border border-[#E8E0D5] rounded-full flex items-center justify-center text-[#292522]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-[#292522]">Personal WhatsApp Care</h3>
            <p className="text-xs text-[#8A7869] leading-relaxed">
              No automated chatbots or generic order numbers. You chat one-on-one with real dressmakers and designers.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Contact Invitation */}
      <section className="max-w-5xl mx-auto px-4 mt-28">
        <div className="bg-[#FAF7F2] border border-[#E8DCCB] p-8 sm:p-12 text-center rounded-sm">
          <h3 className="font-serif text-2xl sm:text-3xl text-[#292522] mb-3">
            Have a custom gown or bridal enquiry?
          </h3>
          <p className="text-xs text-[#8A7869] max-w-lg mx-auto mb-6 leading-relaxed">
            We are always delighted to discuss custom colours, silhouette adaptations, and event timelines directly with our patrons.
          </p>
          <a
            href={conciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#E8DCCB]" />
            <span>Chat With Our Atelier</span>
          </a>
        </div>
      </section>
    </div>
  );
};
