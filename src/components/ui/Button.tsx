'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
    const baseStyles = 'font-medium rounded-full transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer';
    
    const variants = {
      primary: 'bg-gradient-to-r from-rose-gold to-blush-pink text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-white text-rose-gold border-2 border-rose-gold hover:bg-rose-gold hover:text-white',
      outline: 'bg-transparent text-rose-gold border-2 border-rose-gold hover:bg-rose-gold hover:text-white',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
