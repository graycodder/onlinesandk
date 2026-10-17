import type { CustomerDetails, Product } from '../types';
import { cleanWhatsAppNumber } from './formatters';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCustomerDetails = (customer: CustomerDetails): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!customer.name || customer.name.trim().length < 2) {
    errors.name = 'Please enter your full name (minimum 2 characters)';
  }

  const cleanPhone = customer.contactNumber ? customer.contactNumber.replace(/\D/g, '') : '';
  if (!customer.contactNumber || cleanPhone.length < 8 || cleanPhone.length > 15) {
    errors.contactNumber = 'Please enter a valid mobile number (at least 8-10 digits)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateWhatsAppNumber = (rawNumber: string): { isValid: boolean; error?: string } => {
  const cleaned = cleanWhatsAppNumber(rawNumber);
  if (!cleaned) {
    return { isValid: false, error: 'WhatsApp number is required' };
  }
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { isValid: false, error: 'Invalid WhatsApp number. Please include valid country and area code (10-15 digits).' };
  }
  return { isValid: true };
};

export const validateProductForm = (product: Partial<Product>): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!product.name || product.name.trim().length < 2) {
    errors.name = 'Product name is required (minimum 2 characters)';
  }

  if (product.price === undefined || product.price === null || isNaN(product.price) || product.price < 0) {
    errors.price = 'Selling price must be a valid non-negative number';
  }

  if (product.compareAtPrice !== undefined && product.compareAtPrice !== null) {
    if (isNaN(product.compareAtPrice) || product.compareAtPrice < 0) {
      errors.compareAtPrice = 'Original price must be a valid positive number';
    } else if (product.price !== undefined && product.compareAtPrice <= product.price) {
      errors.compareAtPrice = 'Original/Compare-at price should be higher than selling price';
    }
  }

  if (!product.categoryId) {
    errors.categoryId = 'Please select a collection for this product';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
