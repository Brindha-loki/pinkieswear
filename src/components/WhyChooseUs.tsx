'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Section, SectionHeader } from './ui/Section';

const features = [
  {
    icon: '✨',
    title: 'Handmade with Care',
    description: 'Each nail set is meticulously crafted by hand with premium materials and attention to detail',
  },
  {
    icon: '💖',
    title: 'Custom Sized for Every Customer',
    description: 'We create nails perfectly sized for your unique nail shape and size for a flawless fit',
  },
  {
    icon: '🎀',
    title: 'Salon Quality Finish',
    description: 'Professional-grade finish that rivals salon manicures without the time or cost',
  },
  {
    icon: '📦',
    title: 'Carefully Packed & Delivered',
    description: 'Each set is lovingly packaged and shipped with care to ensure perfect arrival',
  },
];

const WhyChooseUs = () => {
  return (
    <Section id="why-choose-us" className="bg-gradient-to-b from-white/30 to-baby-pink/20">
      <SectionHeader
        title="Why Choose The Pinkie Swear"
        subtitle="Experience the difference of truly custom, handmade press-on nails"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Card key={index} hover className="text-center group">
            <CardHeader>
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default WhyChooseUs;
