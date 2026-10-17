import React, { useState } from 'react';
import { MessageCircle, Copy, Check, ExternalLink, RefreshCw, X } from 'lucide-react';
import { copyToClipboard } from '../../utils/whatsapp';

interface WhatsAppSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  messageText: string;
  whatsappUrl: string;
  onClearBag: () => void;
}

export const WhatsAppSuccessModal: React.FC<WhatsAppSuccessModalProps> = ({
  isOpen,
  onClose,
  reference,
  messageText,
  whatsappUrl,
  onClearBag,
}) => {
  const [copied, setCopied] = useState(false);
  const [bagCleared, setBagCleared] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(messageText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClearBag = () => {
    onClearBag();
    setBagCleared(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#FAF7F2] border border-[#E8E0D5] w-full max-w-lg shadow-2xl p-6 sm:p-8 fade-in">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8A7869] hover:text-[#292522]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 mx-auto rounded-full bg-[#E8DCCB] text-[#292522] flex items-center justify-center mb-4">
          <MessageCircle className="w-7 h-7" />
        </div>

        <div className="text-center space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-[#8A7869] font-medium">
            Enquiry Prepared &bull; Ref: {reference}
          </span>
          <h3 className="font-serif text-2xl text-[#292522]">
            WhatsApp Window Launched
          </h3>
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left rounded-sm my-4">
            <p className="font-semibold mb-0.5">Important next step:</p>
            <p className="leading-relaxed">
              Please click the <strong>&ldquo;Send&rdquo;</strong> button inside your WhatsApp chat window to deliver this enquiry to the Sash &amp; Knot concierge.
            </p>
          </div>
        </div>

        {/* Actions & Fallbacks */}
        <div className="space-y-3 mt-5">
          {/* Re-open WhatsApp button in case popup blocked */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#292522] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-black transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Re-open WhatsApp Chat</span>
          </a>

          {/* Copy Message Fallback */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white border border-[#D9CEBF] text-[#292522] text-xs uppercase tracking-wider font-medium hover:bg-[#F5EFE6] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Message Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#8A7869]" />
                <span>Copy Enquiry Text as Fallback</span>
              </>
            )}
          </button>
        </div>

        {/* Message preview collapsible */}
        <div className="mt-5 pt-4 border-t border-[#E8E0D5]">
          <span className="text-[11px] uppercase tracking-wider text-[#8A7869] font-medium block mb-1">
            Enquiry Message Preview:
          </span>
          <pre className="text-[11px] leading-relaxed bg-white border border-[#E8E0D5] p-3 text-[#292522] font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
            {messageText}
          </pre>
        </div>

        {/* Bag management note */}
        <div className="mt-5 pt-4 border-t border-[#E8E0D5] flex items-center justify-between text-xs">
          {bagCleared ? (
            <span className="text-emerald-700 font-medium">Enquiry bag has been cleared.</span>
          ) : (
            <button
              onClick={handleClearBag}
              className="text-[#8A7869] hover:text-red-700 underline underline-offset-2 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear Enquiry Bag</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FAF7F2] text-[#292522] border border-[#D9CEBF] hover:bg-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
