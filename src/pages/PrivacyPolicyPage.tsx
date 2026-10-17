import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, Lock, EyeOff } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="border-b border-[#E8E0D5] pb-6 mb-10 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-2">
          Customer Trust &amp; Disclosures
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
          Privacy Notice &amp; Enquiry Workflow
        </h1>
        <p className="text-xs text-[#8A7869] mt-2">
          Effective Date: October 2026 &bull; {settings.brandName || 'Sash & Knot'}
        </p>
      </div>

      <div className="prose prose-stone max-w-none space-y-8 text-xs sm:text-sm text-[#8A7869] leading-relaxed">
        <section className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#292522]">
            <ShieldCheck className="w-6 h-6 text-[#292522]" />
            <h2 className="font-serif text-xl sm:text-2xl m-0 font-normal">1. How We Protect Your Privacy</h2>
          </div>
          <p>
            At <strong>{settings.brandName || 'Sash & Knot'}</strong>, we respect your personal information and value discretion.
            Unlike conventional e-commerce websites that mandate user accounts and credit card processing, our catalogue operates primarily through a personal WhatsApp enquiry workflow.
          </p>
          <p>
            You do <strong>not</strong> need to register an account, create a password, or submit payment details to browse our clothing catalogue or curate an enquiry bag.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#292522]">
            <MessageCircle className="w-6 h-6 text-[#292522]" />
            <h2 className="font-serif text-xl sm:text-2xl m-0 font-normal">2. The WhatsApp Enquiry System</h2>
          </div>
          <p>
            When you enter your name, contact number, and optional delivery location in the Enquiry Bag form, this information is compiled directly into a formatted text message on your device.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>The message is delivered directly through official WhatsApp click-to-chat links.</li>
            <li>Your customer data is not permanently stored in public databases or traded to marketing networks.</li>
            <li>All communication regarding sizing, delivery timeframes, payment methods, and courier dispatch occurs privately between you and our authorized atelier representatives in WhatsApp.</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#292522]">
            <EyeOff className="w-6 h-6 text-[#292522]" />
            <h2 className="font-serif text-xl sm:text-2xl m-0 font-normal">3. Local Device Storage</h2>
          </div>
          <p>
            Your current enquiry bag selections are temporarily cached in your browser's local storage (LocalStorage) solely to prevent you from losing your selected dresses if you refresh the page or browse across different collections.
            You can remove items or clear your bag at any time by pressing the &ldquo;Clear Bag&rdquo; button.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-[#292522]">
            <Lock className="w-6 h-6 text-[#292522]" />
            <h2 className="font-serif text-xl sm:text-2xl m-0 font-normal">4. Contact &amp; Questions</h2>
          </div>
          <p>
            If you have any questions regarding how your details are handled, please contact our concierge at{' '}
            <a href={`mailto:${settings.contactEmail || 'concierge@sashandknot.com'}`} className="underline font-medium text-[#292522]">
              {settings.contactEmail || 'concierge@sashandknot.com'}
            </a>{' '}
            or message us directly on WhatsApp at {settings.whatsappDisplayNumber || '+91 98765 43210'}.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};
