import { useState } from 'react';
import { Save, Check, MessageCircle, Globe, Home, Share2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { cleanWhatsAppNumber } from '../../utils/formatters';
import { validateWhatsAppNumber } from '../../utils/validation';
import type { StoreSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = cleanWhatsAppNumber(raw);
    setFormData((prev: StoreSettings) => ({
      ...prev,
      whatsappNumber: cleaned,
      whatsappDisplayNumber: raw,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate WhatsApp number
    const waVal = validateWhatsAppNumber(formData.whatsappNumber);
    if (!waVal.isValid) {
      setErrors({ whatsappNumber: waVal.error || 'Invalid WhatsApp number' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      await updateSettings(formData);
      setNotice('Store settings saved successfully and updated live on the website.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D5] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
            Storefront Configuration
          </span>
          <h1 className="font-serif text-3xl text-[#292522] font-normal">
            Store Settings &amp; WhatsApp Concierge
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4 text-[#E8DCCB]" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-sm fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
          {Object.values(errors).map((e: string, idx) => (
            <p key={idx}>{e}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: WhatsApp Concierge Settings (CRITICAL) */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E8E0D5] pb-3 text-[#292522]">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="font-serif text-xl">WhatsApp Enquiry Destination</h2>
          </div>
          <p className="text-xs text-[#8A7869] leading-relaxed">
            All customer clothing enquiries and bespoke size requests are dispatched directly to this WhatsApp number. No code re-deployment needed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Business WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.whatsappDisplayNumber || formData.whatsappNumber || ''}
                onChange={handleWhatsAppChange}
                placeholder="+91 98765 43210 or 9876543210"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] font-sans"
              />
              <span className="text-[11px] text-[#8A7869] mt-1 block">
                Cleaned wa.me format: <strong>{formData.whatsappNumber || 'None'}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Public Telephone (Voice)
              </label>
              <input
                type="text"
                value={formData.contactNumber || ''}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Brand Identity */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E8E0D5] pb-3 text-[#292522]">
            <Globe className="w-5 h-5" />
            <h2 className="font-serif text-xl">Brand Identity &amp; Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brandName || ''}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Boutique Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
              Brand Introduction
            </label>
            <textarea
              rows={3}
              value={formData.brandIntroduction || ''}
              onChange={(e) => setFormData({ ...formData, brandIntroduction: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] resize-none"
            />
          </div>
        </div>

        {/* Section 3: Homepage Hero & Announcements */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E8E0D5] pb-3 text-[#292522]">
            <Home className="w-5 h-5" />
            <h2 className="font-serif text-xl">Homepage Hero &amp; Announcement</h2>
          </div>

          {/* Announcement Bar */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E8E0D5] space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.announcement?.enabled)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcement: {
                      ...formData.announcement,
                      enabled: e.target.checked,
                      text: formData.announcement?.text || '',
                    },
                  })
                }
                className="w-4 h-4 text-[#292522]"
              />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#292522]">
                Enable Top Announcement Bar
              </span>
            </label>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#8A7869] mb-1">
                Announcement Notice
              </label>
              <input
                type="text"
                value={formData.announcement?.text || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    announcement: {
                      ...formData.announcement,
                      enabled: formData.announcement?.enabled ?? true,
                      text: e.target.value,
                    },
                  })
                }
                placeholder="e.g. Complimentary bespoke sizing consultations via WhatsApp on all orders."
                className="w-full px-3 py-2 text-xs bg-white border border-[#E8E0D5]"
              />
            </div>
          </div>

          {/* Hero Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Hero Heading
              </label>
              <input
                type="text"
                value={formData.hero?.heading || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, heading: e.target.value },
                  })
                }
                placeholder="Style That Feels Like You"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Hero Supporting Description
              </label>
              <textarea
                rows={2}
                value={formData.hero?.description || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, description: e.target.value },
                  })
                }
                placeholder="Handcrafted occasion dresses and mulberry silk silhouettes..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Hero Background Photo URL
              </label>
              <input
                type="url"
                value={formData.hero?.image || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hero: { ...formData.hero, image: e.target.value },
                  })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Social Media Links */}
        <div className="bg-white p-6 sm:p-8 border border-[#E8E0D5] shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E8E0D5] pb-3 text-[#292522]">
            <Share2 className="w-5 h-5" />
            <h2 className="font-serif text-xl">Social Media Profiles</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/sashandknot"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/sashandknot"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-all shadow-md disabled:opacity-50"
          >
            {saving ? 'Updating Store...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
