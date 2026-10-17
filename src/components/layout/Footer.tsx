import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useSettings } from '../../context/SettingsContext';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  const generalEnquiryUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Hello Sash & Knot Atelier, I would like to enquire about your boutique clothing collections and bespoke sizing.`
  );

  return (
    <footer className="bg-[#292522] text-[#FAF7F2] border-t border-[#3D3733]">
      {/* WhatsApp Concierge Banner */}
      <div className="bg-[#1F1C1A] py-8 border-b border-[#3D3733]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#E8DCCB] font-medium block mb-1">
                Personalized Fashion Atelier
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-normal">
                Need bespoke sizing or styling assistance?
              </h3>
              <p className="text-xs text-[#FAF7F2]/70 mt-1 max-w-xl">
                Chat directly with our designer team on WhatsApp. We confirm measurements, fabric drape, and availability before you place an order.
              </p>
            </div>
            <a
              href={generalEnquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8DCCB] text-[#292522] text-xs uppercase tracking-widest font-semibold hover:bg-white transition-all shadow-md group shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-[#292522]" />
              <span>Connect on WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="md" />
            <p className="text-xs text-[#FAF7F2]/70 leading-relaxed max-w-sm pt-2">
              {settings.footerContent?.about ||
                'Sash & Knot creates handcrafted silhouettes, pure mulberry silk gowns, and contemporary occasion wear designed with timeless poise.'}
            </p>
            <div className="pt-2 flex items-center space-x-3 text-[#E8DCCB]">
              {settings.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-[#FAF7F2]/20 hover:border-[#E8DCCB] hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full border border-[#FAF7F2]/20 hover:border-[#E8DCCB] hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              <a
                href={generalEnquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-[#FAF7F2]/20 hover:border-[#E8DCCB] hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#E8DCCB] font-medium">Catalogue</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=new" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Curated Categories
                </Link>
              </li>
              <li>
                <Link to="/enquiry" className="hover:text-white transition-colors">
                  My Enquiry Bag
                </Link>
              </li>
            </ul>
          </div>

          {/* Boutique Atelier */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#E8DCCB] font-medium">Boutique</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Story &amp; Craft
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Visit Atelier &amp; Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy &amp; Enquiry Workflow
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Concierge Contact */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#E8DCCB] font-medium">Direct Concierge</h4>
            <div className="space-y-2.5 text-xs text-[#FAF7F2]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#E8DCCB] shrink-0 mt-0.5" />
                <span>{settings.address || 'Bengaluru Flagship Atelier, India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E8DCCB] shrink-0" />
                <a href={`tel:${settings.contactNumber}`} className="hover:text-white">
                  {settings.whatsappDisplayNumber || settings.contactNumber || '+91 98765 43210'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E8DCCB] shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail || 'atelier@sashandknot.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#3D3733] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF7F2]/50">
          <p>{settings.footerContent?.copyrightText || '© 2026 Sash & Knot. All rights reserved.'}</p>
          <div className="flex items-center space-x-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Enquiry Terms &amp; Privacy
            </Link>
            <Link to="/admin" className="hover:text-white transition-colors">
              Staff Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
