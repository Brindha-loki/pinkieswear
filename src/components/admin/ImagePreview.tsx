'use client';

import React, { useState } from 'react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  thumbClassName?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  className = '',
  thumbClassName = 'w-12 h-12',
}) => {
  const [open, setOpen] = useState(false);

  if (!src) return <span className="text-foreground/30 text-xs">—</span>;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${thumbClassName} rounded-lg overflow-hidden border border-rose-gold/20 hover:border-rose-gold/60 transition-all cursor-zoom-in ${className}`}
        title="Click to preview"
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white text-2xl font-bold hover:text-rose-300 transition-colors"
            >
              ✕
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
            />
            <p className="text-white/60 text-center text-sm mt-3">{alt}</p>
          </div>
        </div>
      )}
    </>
  );
};
