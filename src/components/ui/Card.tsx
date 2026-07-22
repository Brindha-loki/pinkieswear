'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div
      className={`glass-card rounded-3xl p-6 transition-all duration-300 pointer-events-auto ${
        hover ? 'hover:scale-105 hover:shadow-2xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={className}>{children}</div>;
};
