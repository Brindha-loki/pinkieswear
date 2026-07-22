'use client';

import React from 'react';
import { Section, SectionHeader } from './ui/Section';

const orderSteps = [
  {
    number: '1',
    title: 'Upload Your Inspiration',
    description: 'Share images of your dream nail design or describe your vision',
    icon: '📸',
  },
  {
    number: '2',
    title: 'Share Your Nail Sizing',
    description: 'Provide photos of your nails for perfect custom sizing',
    icon: '📏',
  },
  {
    number: '3',
    title: 'We Create Your Dream Nails',
    description: 'Our artists carefully handcraft your custom nail set',
    icon: '🎨',
  },
  {
    number: '4',
    title: 'Receive Your Custom Set',
    description: 'Your handmade nails arrive beautifully packaged and ready to wear',
    icon: '📦',
  },
];

const applySteps = [
  {
    title: 'Prep Your Canvas',
    description: 'Gently push back cuticles, buff nails, and clean with alcohol for a flawless base',
    tip: '💡 Clean nails = longer wear time!',
    color: 'from-pink-200 to-rose-200',
  },
  {
    title: 'Size & Select',
    description: 'Match each press-on to your natural nail. If unsure, size down for a snug fit',
    tip: '🎯 Number the backs for easy re-use',
    color: 'from-rose-200 to-pink-300',
  },
  {
    title: 'Apply Glue',
    description: 'Apply a thin layer of adhesive to your natural nail and the press-on back',
    tip: '✨ Less is more - too much glue gets messy',
    color: 'from-pink-300 to-blush-pink',
  },
  {
    title: 'Press & Hold',
    description: 'Align at cuticle, press down firmly, and hold for 30+ seconds',
    tip: '⏱️ Patience pays off - hold longer for extra security',
    color: 'from-blush-pink to-rose-gold',
  },
];

const removeSteps = [
  {
    title: 'Warm It Up',
    description: 'Soak in warm, soapy water for 10-15 minutes to soften the adhesive',
    tip: '🛁 Add a few drops of oil for extra help',
    color: 'from-rose-200 to-pink-200',
  },
  {
    title: 'Gently Lift',
    description: 'Use the cuticle stick to gently lift from the sides. Never force!',
    tip: '🌸 Work slowly - your natural nails will thank you',
    color: 'from-pink-200 to-rose-300',
  },
  {
    title: 'Clean & Store',
    description: 'Remove remaining adhesive, clean both nails, and store in original box',
    tip: '💎 They can be reused 3-5 times with proper care!',
    color: 'from-pink-300 to-blush-pink',
  },
];

const HowItWorks = () => {
  return (
    <Section id="tutorial" className="bg-white/30">
      <SectionHeader
        title="Nail Care Guide"
        subtitle="From ordering to application, we've got you covered"
      />
      
      {/* Ordering Process */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            How to Order ✨
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Your journey to perfect custom nails in four simple steps
          </p>
        </div>
        
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-rose-gold to-blush-pink rounded-full" />
          
          <div className="space-y-12">
            {orderSteps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-gold to-blush-pink flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>
                
                <div className="flex-1 glass-card rounded-3xl p-6 md:p-8 max-w-md">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Guide */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            How to Apply 💅
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Follow these steps for salon-perfect results at home
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {applySteps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300 opacity-50`} />
              <div className="relative glass-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed mb-3">
                      {step.description}
                    </p>
                    <div className="inline-block px-3 py-1 bg-pink-100/50 rounded-full text-xs text-foreground/60">
                      {step.tip}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Removal Guide */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            How to Remove 🌸
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Gentle removal keeps both your natural nails and press-ons in great condition
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {removeSteps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300 opacity-50`} />
              <div className="relative glass-card rounded-2xl p-6 shadow-lg h-full">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4`}>
                  {index + 1}
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-4 text-center">
                  {step.description}
                </p>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-pink-100/50 rounded-full text-xs text-foreground/60">
                    {step.tip}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
