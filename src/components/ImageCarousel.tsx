'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ImageCarouselProps {
  images: string[];
  productName: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setCurrentIndex((prev) => {
      let newIndex = prev === 0 ? images.length - 1 : prev - 1;
      // Skip to next if current image failed to load
      while (newIndex !== prev && !loadedImages.has(newIndex) && newIndex > 0) {
        newIndex = newIndex === 0 ? images.length - 1 : newIndex - 1;
      }
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      let newIndex = prev === images.length - 1 ? 0 : prev + 1;
      // Skip to next if current image failed to load
      while (newIndex !== prev && !loadedImages.has(newIndex) && newIndex < images.length - 1) {
        newIndex = newIndex === images.length - 1 ? 0 : newIndex + 1;
      }
      return newIndex;
    });
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (translateX > threshold) {
      handlePrevious();
    } else if (translateX < -threshold) {
      handleNext();
    }
    setTranslateX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTranslateX(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (translateX > threshold) {
      handlePrevious();
    } else if (translateX < -threshold) {
      handleNext();
    }
    setTranslateX(0);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        handleNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isDragging]);

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-baby-pink to-blush-pink rounded-2xl overflow-hidden">
      <div
        ref={containerRef}
        className="relative w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: `translateX(${index === currentIndex ? translateX : 0}px)`,
            }}
          >
            <img
              src={image}
              alt={`${productName} - View ${index + 1}`}
              className="w-full h-full object-cover rounded-2xl"
              loading="lazy"
              onLoad={() => {
                setLoadedImages(prev => new Set(prev).add(index));
              }}
              onError={() => {
                // If image fails to load, skip to next available image
                if (index === currentIndex && images.length > 1) {
                  handleNext();
                }
              }}
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 z-10"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-200 z-10"
          aria-label="Next image"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
