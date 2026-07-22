'use client';

import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

const WizardProgress: React.FC<WizardProgressProps> = ({ currentStep, totalSteps, stepNames }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        {stepNames.map((name, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-1"
          >
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500
                ${index + 1 <= currentStep
                  ? 'bg-gradient-to-br from-rose-gold to-blush-pink text-white shadow-lg'
                  : 'bg-white/50 text-foreground/50'
                }
                ${index + 1 === currentStep ? 'scale-110 animate-glow' : ''}
              `}
            >
              {index + 1}
            </div>
            <p
              className={`
                mt-2 text-xs font-medium transition-colors duration-300 text-center
                ${index + 1 <= currentStep ? 'text-foreground' : 'text-foreground/50'}
              `}
            >
              {name}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-gold to-blush-pink transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Counter */}
      <div className="text-center mt-4">
        <p className="text-foreground/70 text-sm">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default WizardProgress;
