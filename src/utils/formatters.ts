/**
 * Formats a numeric price into Indian Rupee format with ₹ symbol
 * Example: 14500 -> ₹14,500
 */
export const formatINR = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Creates clean, SEO-friendly, URL-safe slugs
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Strips non-digits, removes leading + or 0, ensures international country code
 * Default adds India 91 if a standard 10-digit number is provided
 */
export const cleanWhatsAppNumber = (rawNumber: string): string => {
  if (!rawNumber) return '';
  // Remove all non-numeric characters
  let digits = rawNumber.replace(/\D/g, '');

  // If 10 digits provided (typical Indian mobile), prefix with 91
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  
  // Strip leading zeros
  digits = digits.replace(/^0+/, '');

  return digits;
};

/**
 * Format timestamp or date string to readable format
 */
export const formatDisplayDate = (dateVal: any): string => {
  if (!dateVal) return '';
  try {
    let date: Date;
    if (typeof dateVal?.toDate === 'function') {
      date = dateVal.toDate();
    } else if (dateVal instanceof Date) {
      date = dateVal;
    } else {
      date = new Date(dateVal);
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
};
