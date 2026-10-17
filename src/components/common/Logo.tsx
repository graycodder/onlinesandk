import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  linkToHome?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
  linkToHome = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xl tracking-wider',
    md: 'text-2xl sm:text-3xl tracking-widest',
    lg: 'text-3xl sm:text-4xl tracking-widest',
    xl: 'text-4xl sm:text-5xl tracking-widest',
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-[0.2em]',
    md: 'text-[10px] sm:text-[11px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.3em]',
    xl: 'text-xs sm:text-sm tracking-[0.35em]',
  };

  const textColor = variant === 'light' ? 'text-[#FAF7F2]' : 'text-[#292522]';
  const subtitleColor = variant === 'light' ? 'text-[#E8DCCB]/80' : 'text-[#8A7869]';

  const content = (
    <div className={`flex flex-col items-center select-none text-center ${className}`}>
      <span className={`font-serif uppercase font-medium leading-none ${sizeClasses[size]} ${textColor}`}>
        Sash <span className="italic font-normal font-serif text-[#8A7869]">&amp;</span> Knot
      </span>
      {showSubtitle && (
        <span className={`font-sans uppercase mt-1 font-light ${subtitleSizes[size]} ${subtitleColor}`}>
          Boutique &bull; Atelier
        </span>
      )}
    </div>
  );

  if (!linkToHome) {
    return content;
  }

  return (
    <Link to="/" className="inline-block focus:outline-none transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
};
