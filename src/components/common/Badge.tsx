import React from 'react';

export interface BadgeProps {
  type?: 'new' | 'featured' | 'published' | 'draft' | 'custom';
  variant?: 'gold' | 'charcoal' | 'ivory' | 'emerald' | 'amber';
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  variant,
  label,
  className = '',
  children,
}) => {
  const content = children || label;

  if (variant === 'gold' || type === 'featured') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-semibold bg-[#E8DCCB] text-[#292522] border border-[#D9CEBF] shadow-sm ${className}`}
      >
        {content || 'Featured'}
      </span>
    );
  }

  if (variant === 'charcoal' || type === 'new') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-widest font-medium bg-[#292522] text-[#FAF7F2] shadow-sm ${className}`}
      >
        {content || 'New Arrival'}
      </span>
    );
  }

  if (variant === 'emerald' || type === 'published') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
        {content || 'Published'}
      </span>
    );
  }

  if (variant === 'amber' || type === 'draft') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        {content || 'Draft'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#F5EFE6] text-[#8A7869] border border-[#E8E0D5] ${className}`}
    >
      {content}
    </span>
  );
};
