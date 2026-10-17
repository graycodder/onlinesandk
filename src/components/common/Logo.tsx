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
  showSubtitle: _showSubtitle = true,
  linkToHome = true,
  className = '',
}) => {
  // Height classes calibrated to the 3.56:1 logo aspect ratio
  const heightClasses = {
    sm: 'h-9 sm:h-10',
    md: 'h-12 sm:h-14',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  const logoSrc = variant === 'light' ? '/brand-logo-light.png' : '/brand-logo.png';

  const content = (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Sash and Knot — Handpicked. Limited. Yours."
        className={`${heightClasses[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]`}
        draggable={false}
      />
    </div>
  );

  if (!linkToHome) {
    return content;
  }

  return (
    <Link
      to="/"
      className="inline-flex items-center focus:outline-none transition-opacity hover:opacity-95 group"
      aria-label="Sash and Knot Home"
    >
      {content}
    </Link>
  );
};
