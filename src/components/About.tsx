'use client';

import React from 'react';
import { Card } from './ui/Card';
import { Section, SectionHeader } from './ui/Section';
import { Button } from './ui/Button';

const About = () => {
  return (
    <Section id="about" className="bg-white/30">
      <SectionHeader
        title="About The Pinkie Swear"
        subtitle="Our story of passion, creativity, and love for nail art"
      />
      
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="aspect-square bg-gradient-to-br from-baby-pink to-blush-pink rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="The Pinkie Swear Logo" className="w-full h-full object-contain p-8" />
            </div>
            <div className="p-6">
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
                Our Story
              </h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                The Pinkie Swear was born from a simple dream: to make luxury, custom nail art accessible to everyone. What started as a passion project in a small home studio has blossomed into a beloved brand that brings joy and confidence to nail enthusiasts everywhere.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                We believe that beautiful nails should be a form of self-expression that everyone can enjoy. Our journey began with a love for handcrafted artistry and a desire to create something truly special for each of our customers.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="font-serif text-2xl font-semibold text-foreground mb-4 text-center">
              Our Mission
            </h3>
            <p className="text-foreground/80 leading-relaxed text-center max-w-2xl mx-auto">
              To empower every individual to express their unique style through beautifully crafted, custom press-on nails. We're committed to quality, creativity, and making every customer feel like the most special version of themselves.
            </p>
          </div>
        </Card>
        
        <Card className="mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="p-6 md:order-2">
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
                Our Love for Handmade Art
              </h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Every nail set we create is a labor of love. We pour our hearts into each design, carefully selecting premium materials and paying attention to every detail. From the initial sketch to the final polish, our process is guided by passion and precision.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                We believe that the handmade touch makes all the difference. When you wear The Pinkie Swear nails, you're wearing a piece of art that was created just for you, with care and dedication that mass-produced nails simply can't match.
              </p>
            </div>
            <div className="aspect-square bg-gradient-to-br from-soft-lavender to-baby-pink rounded-2xl flex items-center justify-center md:order-1">
              <div className="text-8xl">🎨</div>
            </div>
          </div>
        </Card>
        
        <div className="text-center glass-card rounded-3xl p-8">
          <h3 className="font-serif text-3xl font-semibold text-foreground mb-4">
            Welcome to the Family 💖
          </h3>
          <p className="text-foreground/80 leading-relaxed max-w-2xl mx-auto mb-6">
            Whether you're here for your first custom set or you're a returning member of our community, we're so glad you've chosen The Pinkie Swear. You're not just a customer – you're part of our family of nail art lovers.
          </p>
          <Button size="lg">Start Your Journey</Button>
        </div>
      </div>
    </Section>
  );
};

export default About;
