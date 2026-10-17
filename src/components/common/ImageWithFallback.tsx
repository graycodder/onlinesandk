import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  alt: string;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800';

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with prop changes
  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden bg-[#F5EFE6] ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE6] via-[#EFE7DC] to-[#F5EFE6] animate-pulse" />
      )}
      <img
        src={hasError ? fallbackSrc : imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
          setImgSrc(fallbackSrc);
        }}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
