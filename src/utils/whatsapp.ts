import type { BagItem, CustomerDetails } from '../types';
import { formatINR, cleanWhatsAppNumber } from './formatters';

/**
 * Generates an elegant unique enquiry reference code
 * Example: SK-20261017-E8A4
 */
export const generateEnquiryReference = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SK-${year}${month}${day}-${randomPart}`;
};

interface MessageParams {
  reference: string;
  customer: CustomerDetails;
  items: BagItem[];
  subtotal: number;
}

/**
 * Builds the exact message string specified in the master prompt
 */
export const buildWhatsAppMessage = ({
  reference,
  customer,
  items,
  subtotal,
}: MessageParams): string => {
  const lines: string[] = [];

  lines.push('SASH & KNOT — PRODUCT ENQUIRY');
  lines.push('');
  lines.push(`Enquiry Reference: ${reference}`);
  lines.push('');
  lines.push('CUSTOMER DETAILS');
  lines.push('');
  lines.push(`Name: ${customer.name.trim()}`);
  lines.push(`Contact Number: ${customer.contactNumber.trim()}`);
  lines.push('');
  lines.push('REQUESTED PRODUCTS');
  lines.push('');

  items.forEach((item, index) => {
    const sizeDisplay = item.selectedSize && item.selectedSize.trim() !== '' 
      ? item.selectedSize 
      : 'Not Applicable';
      
    const colourDisplay = item.selectedColour && item.selectedColour.trim() !== '' 
      ? item.selectedColour 
      : 'Not Applicable';
      
    const lineTotal = item.unitPrice * item.quantity;

    lines.push(`${index + 1}. ${item.productName}`);
    lines.push(`Size: ${sizeDisplay}`);
    lines.push(`Colour: ${colourDisplay}`);
    lines.push(`Quantity: ${item.quantity}`);
    lines.push(`Unit Price: ${formatINR(item.unitPrice)}`);
    lines.push(`Line Total: ${formatINR(lineTotal)}`);
    lines.push('');
  });

  lines.push(`ESTIMATED ENQUIRY TOTAL: ${formatINR(subtotal)}`);
  lines.push('');
  lines.push(`Delivery Location: ${customer.deliveryLocation?.trim() ? customer.deliveryLocation.trim() : 'Not Provided'}`);
  lines.push('');
  lines.push(`Additional Requirements: ${customer.additionalRequirements?.trim() ? customer.additionalRequirements.trim() : 'None'}`);
  lines.push('');
  lines.push('Please confirm product availability and the next steps for placing my order.');

  return lines.join('\n');
};

/**
 * Builds the official WhatsApp click-to-chat URL
 * Using https://wa.me/INTERNATIONAL_NUMBER?text=URL_ENCODED_MESSAGE
 */
export const buildWhatsAppUrl = (rawPhoneNumber: string, messageText: string): string => {
  const cleanedNumber = cleanWhatsAppNumber(rawPhoneNumber);
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanedNumber}?text=${encodedText}`;
};

/**
 * Helper to copy message to clipboard as fallback
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text to clipboard:', err);
    return false;
  }
};

/**
 * Safely triggers window.open for WhatsApp click-to-chat
 */
export const openWhatsAppChat = (url: string): void => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

