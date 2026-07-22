'use client';

import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Section = ({ children, className = '', id }: SectionProps) => {
  return (
    <section id={id} className={`py-20 px-4 md:px-8 lg:px-16 ${className}`}>
      {children}
    </section>
  );
};

export const SectionHeader = ({ 
  title, 
  subtitle, 
  className = '' 
}: { 
  title: string; 
  subtitle?: string; 
  className?: string;
}) => {
  return (
    <div className={`text-center mb-12 ${className}`}>
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};
