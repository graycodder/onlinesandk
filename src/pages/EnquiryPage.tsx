import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useEnquiryBag } from '../context/EnquiryBagContext';
import { useSettings } from '../context/SettingsContext';
import { formatINR } from '../utils/formatters';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { validateCustomerDetails } from '../utils/validation';
import {
  generateEnquiryReference,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  openWhatsAppChat,
} from '../utils/whatsapp';
import { WhatsAppSuccessModal } from '../components/enquiry/WhatsAppSuccessModal';
import type { CustomerDetails } from '../types';

export const EnquiryPage: React.FC = () => {
  const { items, itemCount, subtotal, removeFromBag, updateQuantity, clearBag } = useEnquiryBag();
  const { settings } = useSettings();

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    contactNumber: '',
    deliveryLocation: '',
    additionalRequirements: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    reference: string;
    messageText: string;
    whatsappUrl: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Your enquiry bag is empty.');
      return;
    }

    const valResult = validateCustomerDetails(customer);
    if (!valResult.isValid) {
      setValidationErrors(valResult.errors);
      return;
    }

    // Generate unique reference
    const reference = generateEnquiryReference();

    // Build the formatted text
    const messageText = buildWhatsAppMessage({
      reference,
      customer,
      items,
      subtotal,
    });

    // Destination WhatsApp link
    const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, messageText);

    // Open WhatsApp
    openWhatsAppChat(whatsappUrl);

    // Show modal instructions with copy fallback
    setSuccessModalData({
      reference,
      messageText,
      whatsappUrl,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Page Title */}
      <div className="border-b border-[#E8E0D5] pb-6 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A7869] font-medium block mb-1">
            Review &amp; Connect
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#292522] font-normal">
            Your Enquiry Bag
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="text-xs uppercase tracking-wider text-[#8A7869] hover:text-red-700 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Bag</span>
          </button>
        )}
      </div>

      {/* Clear Bag Confirmation Prompt */}
      {showClearConfirm && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 fade-in">
          <div className="flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Are you sure you want to remove all items from your enquiry bag?</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                clearBag();
                setShowClearConfirm(false);
              }}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors rounded-sm"
            >
              Yes, Clear All
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors rounded-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E0D5] p-8 max-w-2xl mx-auto shadow-sm">
          <ShoppingBag className="w-16 h-16 text-[#D9CEBF] stroke-[1.2] mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-[#292522]">Your bag has no dresses currently</h2>
          <p className="text-xs text-[#8A7869] mt-2 max-w-md mx-auto leading-relaxed">
            Browse our curated collections of evening gowns, festive silhouettes, and handcrafted dresses. Add your preferred garments to begin an enquiry.
          </p>
          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
            >
              <span>Explore Collection</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Bag Line Items (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-[#E8E0D5] divide-y divide-[#E8E0D5] shadow-sm">
              <div className="p-4 bg-[#F5EFE6]/60 flex justify-between items-center text-xs font-medium text-[#8A7869] uppercase tracking-wider">
                <span>Selected Garments ({itemCount})</span>
                <span>Pricing</span>
              </div>

              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="w-24 h-32 shrink-0 bg-[#F5EFE6] border border-[#E8E0D5] overflow-hidden group block"
                  >
                    <ImageWithFallback
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link
                            to={`/product/${item.productSlug}`}
                            className="font-serif text-lg text-[#292522] hover:text-[#8A7869] transition-colors leading-snug"
                          >
                            {item.productName}
                          </Link>
                          {item.collectionName && (
                            <span className="block text-[11px] uppercase tracking-wider text-[#8A7869] mt-0.5">
                              {item.collectionName}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromBag(item.id)}
                          className="text-[#8A7869] hover:text-red-700 p-1 transition-colors"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selected Variations */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.selectedSize && (
                          <span className="inline-block px-2.5 py-0.5 bg-[#F5EFE6] text-[#292522] text-[11px] font-medium border border-[#E8E0D5]">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColour && (
                          <span className="inline-block px-2.5 py-0.5 bg-[#F5EFE6] text-[#292522] text-[11px] font-medium border border-[#E8E0D5]">
                            Colour: {item.selectedColour}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls & Line Total */}
                    <div className="mt-4 pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
                      <div className="flex items-center border border-[#E8E0D5] bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-[#8A7869] hover:text-[#292522]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-sans text-xs font-semibold text-[#292522]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#8A7869] hover:text-[#292522]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-sans text-sm font-semibold text-[#292522] block">
                          {formatINR(item.unitPrice * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-[#8A7869]">
                            {formatINR(item.unitPrice)} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Back link */}
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-[#8A7869] hover:text-[#292522] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Browsing Catalogue</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Customer Details Form & WhatsApp Action (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E8E0D5] p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
              <div>
                <h2 className="font-serif text-2xl text-[#292522] font-normal">
                  Send WhatsApp Enquiry
                </h2>
                <p className="text-xs text-[#8A7869] mt-1 leading-relaxed">
                  Enter your contact details. We will compile your dress selections into an organized WhatsApp message for our concierge.
                </p>
              </div>

              <form onSubmit={handleSendEnquiry} className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ananya Sharma"
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border focus:outline-none focus:ring-1 transition-colors ${
                      validationErrors.name
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#E8E0D5] focus:border-[#292522] focus:ring-[#292522]'
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-[11px] text-red-600 mt-1">{validationErrors.name}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    WhatsApp / Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={customer.contactNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 98765 43210"
                    className={`w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border focus:outline-none focus:ring-1 transition-colors ${
                      validationErrors.contactNumber
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#E8E0D5] focus:border-[#292522] focus:ring-[#292522]'
                    }`}
                  />
                  {validationErrors.contactNumber && (
                    <p className="text-[11px] text-red-600 mt-1">
                      {validationErrors.contactNumber}
                    </p>
                  )}
                </div>

                {/* Delivery Location / City (Optional) */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Delivery City / State <span className="text-[#8A7869] font-normal normal-case">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="deliveryLocation"
                    value={customer.deliveryLocation}
                    onChange={handleInputChange}
                    placeholder="e.g., Mumbai, Maharashtra"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522]"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#292522] mb-1.5">
                    Custom Requests / Notes <span className="text-[#8A7869] font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    name="additionalRequirements"
                    rows={3}
                    value={customer.additionalRequirements}
                    onChange={handleInputChange}
                    placeholder="e.g., Need bespoke sleeve length adjustments, delivery required by next weekend..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E8E0D5] focus:outline-none focus:border-[#292522] focus:ring-1 focus:ring-[#292522] resize-none"
                  />
                </div>

                {/* Summary calculation */}
                <div className="pt-4 border-t border-[#E8E0D5] space-y-2">
                  <div className="flex justify-between text-xs text-[#8A7869]">
                    <span>Total Garments:</span>
                    <span>{itemCount} items</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#8A7869]">
                    <span>Estimated Enquiry Subtotal:</span>
                    <span className="font-sans font-semibold text-[#292522] text-sm">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F5EFE6] border border-[#E8E0D5] text-[11px] text-[#8A7869] leading-relaxed">
                    <strong>Note:</strong> No payment is charged online. Final prices, fabric availability, and delivery charges are confirmed directly by Sash &amp; Knot via WhatsApp.
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-[0.15em] font-semibold hover:bg-black transition-all shadow-md group mt-4"
                >
                  <MessageCircle className="w-4 h-4 text-[#E8DCCB] group-hover:scale-110 transition-transform" />
                  <span>Send Enquiry on WhatsApp</span>
                </button>
              </form>

              <div className="pt-4 border-t border-[#E8E0D5] flex items-center justify-center gap-2 text-[11px] text-[#8A7869]">
                <ShieldCheck className="w-4 h-4 text-[#292522]" />
                <span>Your details are only used to prepare your WhatsApp enquiry.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal with Instructions & Copy Fallback */}
      {successModalData && (
        <WhatsAppSuccessModal
          isOpen={Boolean(successModalData)}
          onClose={() => setSuccessModalData(null)}
          reference={successModalData.reference}
          messageText={successModalData.messageText}
          whatsappUrl={successModalData.whatsappUrl}
          onClearBag={clearBag}
        />
      )}
    </div>
  );
};
