'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SizingUploadProps {
  onNailPhotoUpload: (image: string) => void;
  onShapeSelect: (shape: string) => void;
  onNotesSubmit: (notes: string) => void;
  onThreeDArtSelection?: (selection: string) => void;
  initialNailPhoto?: string;
  initialShape?: string;
  initialNotes?: string;
  initialThreeDArt?: string;
  showThreeDArtSection?: boolean;
}

const SizingUpload: React.FC<SizingUploadProps> = ({
  onNailPhotoUpload,
  onShapeSelect,
  onNotesSubmit,
  onThreeDArtSelection,
  initialNailPhoto,
  initialShape,
  initialNotes,
  initialThreeDArt,
  showThreeDArtSection = false,
}) => {
  const [uploadedNailPhoto, setUploadedNailPhoto] = useState<string | undefined>(initialNailPhoto);
  const [selectedShape, setSelectedShape] = useState<string | undefined>(initialShape);
  const [additionalNotes, setAdditionalNotes] = useState(initialNotes || '');
  const [selectedThreeDArt, setSelectedThreeDArt] = useState<string | undefined>(initialThreeDArt);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedNailPhoto(initialNailPhoto);
  }, [initialNailPhoto]);

  useEffect(() => {
    setSelectedShape(initialShape);
  }, [initialShape]);

  useEffect(() => {
    setAdditionalNotes(initialNotes || '');
  }, [initialNotes]);

  useEffect(() => {
    setSelectedThreeDArt(initialThreeDArt);
  }, [initialThreeDArt]);

  const nailShapes = [
    'Long Oval',
    'Medium Almond',
    'Medium Coffin',
    'Medium Square',
    'Short Almond',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedNailPhoto(result);
        onNailPhotoUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleShapeClick = (shape: string) => {
    setSelectedShape(shape);
    onShapeSelect(shape);
  };

  const handleThreeDArtClick = (selection: string) => {
    setSelectedThreeDArt(selection);
    if (onThreeDArtSelection) {
      onThreeDArtSelection(selection);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalNotes(e.target.value);
    onNotesSubmit(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          Nail Sizing
        </h2>
        <p className="text-foreground/70">Upload your nail photo and select your preferred shape</p>
      </div>

      {/* Nail Photo Upload */}
      <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-rose-gold/10 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-blush-pink/10 animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
            Upload Your Nail Photo
          </h3>
          {uploadedNailPhoto ? (
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-baby-pink to-blush-pink flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={uploadedNailPhoto}
                  alt="Nail sizing photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleUploadClick}
                className="mt-4 text-sm text-foreground/70 hover:text-rose-gold transition-colors font-medium"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <div
              onClick={handleUploadClick}
              className="aspect-video rounded-2xl border-2 border-dashed border-rose-gold/30 flex flex-col items-center justify-center cursor-pointer hover:border-rose-gold hover:bg-white/30 transition-all duration-300 bg-white/20 group"
            >
              <div className="w-16 h-16 rounded-full bg-rose-gold/20 mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-foreground font-medium mb-2">Click to Upload Nail Photo</p>
              <p className="text-foreground/60 text-sm">Clear photo of your natural nails</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Nail Shape Guide */}
      <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-blush-pink/10 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '1.5s' }}></div>

        <div className="relative z-10">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4 text-center">
            Choose Your Shape
          </h3>
          <p className="text-foreground/70 text-center mb-6 text-sm">
            Click on your preferred nail shape from the guide below
          </p>

          {/* Interactive Shape Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {nailShapes.map((shape) => (
              <button
                key={shape}
                onClick={() => handleShapeClick(shape)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95
                  ${selectedShape === shape
                    ? 'border-rose-gold bg-rose-gold/10 shadow-lg shadow-rose-gold/30'
                    : 'border-rose-gold/20 bg-white/30 hover:border-rose-gold/50 hover:bg-white/50'
                  }
                `}
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-baby-pink to-blush-pink mb-3 flex items-center justify-center shadow-sm">
                  <p className="text-xs font-medium text-foreground text-center leading-tight">
                    {shape}
                  </p>
                </div>
                {selectedShape === shape && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-rose-gold rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Art Selection - Only for Custom Orders */}
      {showThreeDArtSection && (
        <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-blush-pink/10 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '1.5s' }}></div>

          <div className="relative z-10">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4 text-center">
              3D Art Options
            </h3>
            <p className="text-foreground/70 text-center mb-6 text-sm">
              Would you like to include 3D art elements?
            </p>

            {/* 3D Art Options Grid */}
            <div className="space-y-3">
              <button
                onClick={() => handleThreeDArtClick('3d-art')}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${selectedThreeDArt === '3d-art'
                    ? 'border-rose-gold bg-rose-gold/10 shadow-lg shadow-rose-gold/30'
                    : 'border-rose-gold/20 bg-white/30 hover:border-rose-gold/50 hover:bg-white/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Yes, it includes 3D Art</p>
                    <p className="text-sm text-foreground/70">Raised 3D elements and dimensional art</p>
                  </div>
                  {selectedThreeDArt === '3d-art' && (
                    <div className="w-5 h-5 bg-rose-gold rounded-full flex items-center justify-center flex-shrink-0 ml-4">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThreeDArtClick('beads-charms')}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${selectedThreeDArt === 'beads-charms'
                    ? 'border-rose-gold bg-rose-gold/10 shadow-lg shadow-rose-gold/30'
                    : 'border-rose-gold/20 bg-white/30 hover:border-rose-gold/50 hover:bg-white/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">No, but it includes beads or charms</p>
                    <p className="text-sm text-foreground/70">Decorative beads and charm additions</p>
                  </div>
                  {selectedThreeDArt === 'beads-charms' && (
                    <div className="w-5 h-5 bg-rose-gold rounded-full flex items-center justify-center flex-shrink-0 ml-4">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleThreeDArtClick('no-3d')}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                  ${selectedThreeDArt === 'no-3d'
                    ? 'border-rose-gold bg-rose-gold/10 shadow-lg shadow-rose-gold/30'
                    : 'border-rose-gold/20 bg-white/30 hover:border-rose-gold/50 hover:bg-white/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">None of the above</p>
                    <p className="text-sm text-foreground/70">Flat design without 3D elements or decorations</p>
                  </div>
                  {selectedThreeDArt === 'no-3d' && (
                    <div className="w-5 h-5 bg-rose-gold rounded-full flex items-center justify-center flex-shrink-0 ml-4">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Notes */}
      <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-rose-gold/10 animate-float"></div>

        <div className="relative z-10">
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
            Additional Notes
          </h3>
          <p className="text-foreground/70 text-sm mb-4">
            Any special requests for your nail shape or finish?
          </p>
          <textarea
            value={additionalNotes}
            onChange={handleNotesChange}
            rows={4}
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 resize-none focus:ring-2 focus:ring-rose-gold/30"
            placeholder="Examples: &quot;Please keep the cuticles rounded.&quot; or &quot;I prefer a glossy finish.&quot;"
          />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="flex justify-center gap-4">
        <div className="w-8 h-8 rounded-full bg-rose-gold/20 animate-float"></div>
        <div className="w-8 h-8 rounded-full bg-blush-pink/20 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="w-8 h-8 rounded-full bg-rose-gold/20 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default SizingUpload;
