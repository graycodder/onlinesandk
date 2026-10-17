export type ProductStatus = 'published' | 'draft';

export interface ProductImage {
  id: string;
  url: string;
  storagePath?: string;
  isCover?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string; // collection ID
  categoryName?: string;
  images: ProductImage[];
  primaryImage: string;
  sizes: string[];      // e.g., ["XS", "S", "M", "L", "XL", "Custom"]
  colours: string[];    // e.g., ["Champagne", "Ivory", "Midnight Black", "Rose Gold"]
  material?: string;    // e.g., "100% Mulberry Silk / Pure Georgette"
  fit?: string;         // e.g., "Tailored A-Line Silhouette"
  careInstructions?: string; // e.g., "Dry Clean Only"
  additionalDetails?: string;
  featured: boolean;
  newArrival: boolean;
  status: ProductStatus;
  displayOrder: number;
  createdAt?: string | number | any;
  updatedAt?: string | number | any;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  storagePath?: string;
  displayOrder: number;
  status: 'published' | 'draft';
  createdAt?: string | number | any;
  updatedAt?: string | number | any;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  brandIntroduction: string;
  logoDisplayText: string;
  whatsappNumber: string; // Cleaned international number format, e.g., "919876543210"
  whatsappDisplayNumber: string; // Formatted for human display, e.g., "+91 98765 43210"
  contactNumber: string;
  contactEmail: string;
  address: string;
  socialLinks: SocialLinks;
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  hero: {
    heading: string;
    description: string;
    image: string;
    primaryButtonText: string;
    secondaryButtonText: string;
  };
  featuredHeading: string;
  featuredSubtitle: string;
  newArrivalsHeading: string;
  newArrivalsSubtitle: string;
  aboutSection: {
    heading: string;
    story1: string;
    story2: string;
    image: string;
  };
  footerContent: {
    about: string;
    copyrightText: string;
  };
  currencySymbol: string;
  updatedAt?: any;
}

export interface BagItem {
  id: string; // Composite unique key: `${productId}_${selectedSize}_${selectedColour}`
  productId: string;
  productName: string;
  productSlug: string;
  unitPrice: number;
  compareAtPrice?: number | null;
  image: string;
  selectedSize: string;
  selectedColour: string;
  quantity: number;
  collectionName?: string;
}

export interface CustomerDetails {
  name: string;
  contactNumber: string;
  deliveryLocation: string;
  additionalRequirements: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin: boolean;
}

export type ProductSortOption = 'newest' | 'price-asc' | 'price-desc' | 'featured';
