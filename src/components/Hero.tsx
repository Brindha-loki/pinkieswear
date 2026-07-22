'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';

const Hero = () => {
  const [sparkles, setSparkles] = useState<Array<{ top: string; left: string; animationDelay: string; width: string; height: string }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      width: `${3 + Math.random() * 4}px`,
      height: `${3 + Math.random() * 4}px`,
    }));
    setSparkles(generated);
  }, []);

  const inspoImages = [
    {
      url: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082179553_vampy%20red%20gloss.jpeg',
      size: 'large',
      rotation: -5,
      position: { top: '10%', left: '5%' }
    },
    {
      url: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082178952_rich%20romance%20(3d).png',
      size: 'medium',
      rotation: 8,
      position: { top: '40%', right: '10%' }
    },
    {
      url: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082179985_witch%20in%20green.png',
      size: 'small',
      rotation: -3,
      position: { bottom: '15%', left: '30%' }
    },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-8">
      {/* Whimsical background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=1920&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100/50 via-rose-100/50 to-pink-200/50" />
      </div>

      {/* Pinterest-style sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((sparkle, i) => (
          <div
            key={i}
            className="pinterest-sparkle animate-twinkle"
            style={{
              top: sparkle.top,
              left: sparkle.left,
              animationDelay: sparkle.animationDelay,
              width: sparkle.width,
              height: sparkle.height,
            }}
          />
        ))}
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-12 h-12 rounded-full bg-blush-pink/10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero content - split layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left side - Hero card */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl shadow-2xl overflow-hidden glass-card" style={{ maxWidth: '600px', width: '100%' }}>
              <div className="relative p-8 md:p-12">
                <div className="mb-4">
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-rose-gold to-pink-300 text-white text-xs font-semibold tracking-wider uppercase rounded-full">
                    Handcrafted Luxury
                  </span>
                </div>
                
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  Your Dream Nails, <span className="text-rose-gold">Custom Made</span>
                </h1>
                
                <p className="text-base md:text-lg text-foreground/70 mb-6 leading-relaxed font-light">
                  Create your perfect press-on nail set with our personalized custom orders, or choose from our curated gallery of handcrafted designs.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Link href="/custom-order">
                    <Button size="lg" className="w-full sm:w-auto text-sm">
                      Start Custom Order
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-sm"
                    onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Browse Gallery
                  </Button>
                </div>

                <div className="bg-rose-gold/10 rounded-xl p-4">
                  <p className="text-sm text-foreground/80 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Shipping typically takes 10-20 days</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Polaroid collage */}
          <div className="lg:col-span-1 relative">
            <div className="relative p-6 md:p-8">
              <div className="mb-6">
                <span className="font-serif text-foreground/60 text-sm tracking-widest uppercase">✨ Nail Art Inspiration ✨</span>
              </div>

              {/* Polaroid-style collage */}
              <div className="relative h-96 md:h-[28rem]">
                {inspoImages.map((img, index) => {
                  const polaroidStyles = [
                    { top: '5%', left: '5%', rotation: -8, scale: 1.1, zIndex: 1 },
                    { top: '15%', right: '8%', rotation: 6, scale: 1, zIndex: 2 },
                    { bottom: '8%', left: '25%', rotation: -4, scale: 0.95, zIndex: 3 },
                  ];
                  const style = polaroidStyles[index];
                  return (
                    <div
                      key={index}
                      className="absolute cursor-pointer transform hover:scale-110 hover:z-20 transition-all duration-500"
                      style={{
                        top: style.top,
                        left: style.left || 'auto',
                        right: style.right || 'auto',
                        bottom: style.bottom || 'auto',
                        transform: `rotate(${style.rotation}deg) scale(${style.scale})`,
                        width: img.size === 'large' ? '55%' : img.size === 'medium' ? '48%' : '40%',
                        zIndex: style.zIndex,
                      }}
                    >
                      <div className="bg-white p-3 pb-8 shadow-2xl rounded-sm">
                        <div className="bg-gray-100 overflow-hidden">
                          <img
                            src={img.url}
                            alt={`Nail art inspiration ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <p className="font-handwriting text-xs text-gray-600 italic">✨ Pinkie Swear ✨</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-center mt-6 text-foreground/50 text-xs font-light italic">
                Pin your favorites & get inspired ✨
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />
    </section>
  );
};

export default Hero;
