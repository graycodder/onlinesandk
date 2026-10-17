import { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Clock, Check } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { buildWhatsAppUrl, openWhatsAppChat } from '../utils/whatsapp';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const directWhatsAppUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    'Hello Sash & Knot Atelier, I would like to get in touch regarding your clothing collections and bespoke orders.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      alert('Please fill in your name, contact number, and message.');
      return;
    }

    const messageText = `SASH & KNOT — GENERAL ENQUIRY

From: ${form.name}
Phone: ${form.phone}
Subject: ${form.subject || 'Atelier Inquiry'}

Message:
${form.message}`;

    const url = buildWhatsAppUrl(settings.whatsappNumber, messageText);
    openWhatsAppChat(url);
    setSubmitted(true);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <section className="bg-[#FAF7F2] border-b border-[#E8E0D5] py-16 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#8A7869] font-medium block mb-3">
            Concierge &amp; Atelier
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#292522] font-normal">
            Contact Sash &amp; Knot
          </h1>
          <p className="text-xs sm:text-sm text-[#8A7869] mt-4 leading-relaxed max-w-xl mx-auto">
            Whether you seek custom measurements, styling advice, or delivery updates, our atelier team is always at your service.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Contact Info (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A7869] font-medium block mb-2">
                Direct Communication
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#292522]">
                We are one message away
              </h2>
              <p className="text-xs text-[#8A7869] mt-2 leading-relaxed">
                We prioritize WhatsApp for all sales and customer communication to ensure swift, personalized attention.
              </p>
            </div>

            {/* Quick WhatsApp Action Card */}
            <div className="bg-[#292522] text-[#FAF7F2] p-6 border border-[#3D3733] space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8DCCB] text-[#292522] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#E8DCCB] font-semibold block">
                    WhatsApp Concierge
                  </span>
                  <span className="text-sm font-sans font-medium text-white">
                    {settings.whatsappDisplayNumber || '+91 98765 43210'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#FAF7F2]/70 leading-relaxed">
                Connect directly with our atelier team for real-time garment photos, size advice, and bespoke requests.
              </p>
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#E8DCCB] text-[#292522] text-xs uppercase tracking-widest font-semibold hover:bg-white transition-colors"
              >
                <span>Launch WhatsApp Chat</span>
              </a>
            </div>

            {/* Details list */}
            <div className="space-y-6 pt-2">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white border border-[#E8E0D5] flex items-center justify-center text-[#292522] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                    Email Inquiries
                  </h4>
                  <p className="text-xs text-[#8A7869] mt-1">
                    {settings.contactEmail || 'concierge@sashandknot.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white border border-[#E8E0D5] flex items-center justify-center text-[#292522] shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                    Telephone
                  </h4>
                  <p className="text-xs text-[#8A7869] mt-1">
                    {settings.contactNumber || '+91 98765 43210'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white border border-[#E8E0D5] flex items-center justify-center text-[#292522] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                    Boutique &amp; Studio Address
                  </h4>
                  <p className="text-xs text-[#8A7869] mt-1 leading-relaxed">
                    {settings.address || 'Sash & Knot Boutique, 42 Heritage Lane, Indiranagar, Bengaluru, Karnataka, 560038, India'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white border border-[#E8E0D5] flex items-center justify-center text-[#292522] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                    Consultation Hours
                  </h4>
                  <p className="text-xs text-[#8A7869] mt-1">
                    Monday to Saturday: 10:00 AM – 7:30 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Enquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 border border-[#E8E0D5] shadow-sm">
            <h3 className="font-serif text-2xl text-[#292522] mb-2">
              Send a Styling Request
            </h3>
            <p className="text-xs text-[#8A7869] mb-8 leading-relaxed">
              Have questions regarding fabrics, sizes, or custom occasion wear? Complete this brief form to launch an organized WhatsApp conversation.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm space-y-3 fade-in text-center">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-xl">Thank You, {form.name}</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Your enquiry has been prepared and opened in WhatsApp. Please press &ldquo;Send&rdquo; inside WhatsApp to dispatch the message to our team.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-wider hover:bg-black transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Meera Roy"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                      Contact / Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g., Bespoke Gown for Wedding Reception"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you are looking for, preferred sizes, dates, or garment questions..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-black transition-all shadow-md group"
                >
                  <MessageCircle className="w-4 h-4 text-[#E8DCCB] group-hover:scale-110 transition-transform" />
                  <span>Send Message via WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
