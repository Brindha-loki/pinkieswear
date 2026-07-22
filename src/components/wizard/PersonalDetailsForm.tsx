'use client';

import React, { useState } from 'react';

interface PersonalDetailsFormProps {
  onSubmit: (data: PersonalDetailsData) => void;
  initialData?: PersonalDetailsData;
  showSubmitButton?: boolean;
  onDataChange?: (data: PersonalDetailsData) => void;
}

export interface PersonalDetailsData {
  fullName: string;
  phone: string;
  whatsapp: string;
  address: string;
  email?: string;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ onSubmit, initialData, showSubmitButton = true, onDataChange }) => {
  const [formData, setFormData] = useState<PersonalDetailsData>(
    initialData || {
      fullName: '',
      phone: '',
      whatsapp: '',
      address: '',
      email: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newData);
    onDataChange?.(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.fullName && formData.phone && formData.whatsapp && formData.address;

  return (
    <div className="glass-card-strong rounded-3xl p-8 max-w-2xl mx-auto relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-rose-gold/10 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-blush-pink/10 animate-float" style={{ animationDelay: '1s' }}></div>

      <div className="text-center mb-8 relative z-10">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Personal Details
        </h2>
        <p className="text-foreground/70">Please provide your contact and shipping information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
            placeholder="+1 234 567 890"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground mb-1">
            WhatsApp Number *
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            required
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
            placeholder="+1 234 567 890"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-rose-gold/30"
            placeholder="jane@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground mb-1">
            Shipping Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 resize-none focus:ring-2 focus:ring-rose-gold/30"
            placeholder="123 Main Street, Apt 4B, New York, NY 10001"
          />
        </div>

        {showSubmitButton && (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-gold to-blush-pink text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-gold/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
          >
            <span className="relative z-10">Continue →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blush-pink to-rose-gold opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </button>
        )}
      </form>
    </div>
  );
};

export default PersonalDetailsForm;
