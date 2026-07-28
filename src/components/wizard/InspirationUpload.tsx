'use client';

import React, { useState, useEffect, useRef } from 'react';
import insforge from '@/lib/insforge';

interface InspirationUploadProps {
  onImageUpload: (image: string) => void;
  onDesignNotesChange?: (notes: string) => void;
  onThreeDArtSelection?: (selection: string) => void;
  initialImage?: string;
  initialNotes?: string;
  initialThreeDArt?: string;
  readOnly?: boolean;
  galleryItem?: {
    name: string;
    price: number;
  };
}

interface ThreeDArtOption {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

const InspirationUpload: React.FC<InspirationUploadProps> = ({
  onImageUpload,
  onDesignNotesChange,
  onThreeDArtSelection,
  initialImage,
  initialNotes = '',
  initialThreeDArt,
  readOnly = false,
  galleryItem,
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(initialImage);
  const [designNotes, setDesignNotes] = useState(initialNotes);
  const [selectedThreeDArt, setSelectedThreeDArt] = useState<string | undefined>(initialThreeDArt);
  const [threeDArtOptions, setThreeDArtOptions] = useState<ThreeDArtOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedImage(initialImage);
  }, [initialImage]);

  useEffect(() => {
    setDesignNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    setSelectedThreeDArt(initialThreeDArt);
  }, [initialThreeDArt]);

  useEffect(() => {
    const fetchThreeDArtOptions = async () => {
      try {
        const { data, error } = await insforge.database
          .from('three_d_art_options')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (data && !error) {
          setThreeDArtOptions(data);
        } else {
          // Fallback to default options if database fetch fails
          setThreeDArtOptions([
            { id: '1', name: 'Yes, contains 3d art', description: 'Raised 3D elements and dimensional art', price: 199, is_active: true },
            { id: '2', name: 'NO, but has beads and charms', description: 'Decorative beads and charm additions', price: 199, is_active: true },
            { id: '3', name: 'None of the above', description: 'Flat design without 3D elements or decorations', price: 199, is_active: true },
          ]);
        }
      } catch (error) {
        console.warn('Failed to fetch 3D art options, using defaults:', error);
        setThreeDArtOptions([
          { id: '1', name: 'Yes, contains 3d art', description: 'Raised 3D elements and dimensional art', price: 199, is_active: true },
          { id: '2', name: 'NO, but has beads and charms', description: 'Decorative beads and charm additions', price: 199, is_active: true },
          { id: '3', name: 'None of the above', description: 'Flat design without 3D elements or decorations', price: 199, is_active: true },
        ]);
      }
    };

    fetchThreeDArtOptions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleThreeDArtClick = (optionId: string) => {
    setSelectedThreeDArt(optionId);
    if (onThreeDArtSelection) {
      onThreeDArtSelection(optionId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
          {readOnly ? 'Selected Design' : 'Inspiration'}
        </h2>
        <p className="text-foreground/70">
          {readOnly
            ? 'This design has been selected from our gallery.'
            : 'Upload a reference image for your custom nail design'}
        </p>
      </div>

      {/* Warning Message */}
      {!readOnly && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-800 font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Graphic, cartoon designs will be rejected. Make sure your inspo does not have them.
          </p>
        </div>
      )}

      {/* Image Upload/Display Card */}
      <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-rose-gold/10 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-blush-pink/10 animate-float" style={{ animationDelay: '1s' }}></div>

        {uploadedImage ? (
          <div className="relative z-10">
            <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-baby-pink to-blush-pink flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={uploadedImage}
                alt="Inspiration"
                className="w-full h-full object-cover"
              />
            </div>
            {galleryItem && (
              <div className="mt-4 text-center">
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-1">
                  {galleryItem.name}
                </h3>
                <p className="text-rose-gold font-bold text-xl">₹{galleryItem.price}</p>
              </div>
            )}
            {!readOnly && (
              <button
                onClick={handleUploadClick}
                className="mt-4 text-sm text-foreground/70 hover:text-rose-gold transition-colors font-medium"
              >
                Change Image
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={handleUploadClick}
            className="relative z-10 aspect-video rounded-2xl border-2 border-dashed border-rose-gold/30 flex flex-col items-center justify-center cursor-pointer hover:border-rose-gold hover:bg-white/30 transition-all duration-300 bg-white/20 group"
          >
            <div className="w-16 h-16 rounded-full bg-rose-gold/20 mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">Click to Upload</p>
            <p className="text-foreground/60 text-sm">PNG, JPG up to 10MB</p>
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

      {/* 3D Art Selection - Only for Custom Orders */}
      {!readOnly && (
        <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-blush-pink/10 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '1.5s' }}></div>

          <div className="relative z-10">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-4 text-center">
              Does your inspiration contain 3D art?
            </h3>

            {/* 3D Art Options Grid */}
            <div className="space-y-3">
              {threeDArtOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleThreeDArtClick(option.id)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                    ${selectedThreeDArt === option.id
                      ? 'border-rose-gold bg-rose-gold/10 shadow-lg shadow-rose-gold/30'
                      : 'border-rose-gold/20 bg-white/30 hover:border-rose-gold/50 hover:bg-white/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{option.name}</p>
                      <p className="text-sm text-foreground/70">{option.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-rose-gold">₹{option.price}</span>
                      {selectedThreeDArt === option.id && (
                        <div className="w-5 h-5 bg-rose-gold rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Warning Message */}
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                If a mismatch between your answer and your inspiration picture is found, your order will be rejected and you will be refunded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Design Notes */}
      <div className="glass-card-strong rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-blush-pink/10 animate-float"></div>

        <div className="relative z-10">
          <label className="block text-sm font-medium text-foreground mb-3">
            {readOnly ? 'Additional Notes' : 'Design Notes (Optional)'}
          </label>
          <textarea
            value={designNotes}
            onChange={(e) => {
              setDesignNotes(e.target.value);
              onDesignNotesChange?.(e.target.value);
            }}
            rows={4}
            className="glass-input w-full px-4 py-3 rounded-xl text-foreground placeholder-foreground/50 resize-none focus:ring-2 focus:ring-rose-gold/30"
            placeholder={readOnly ? 'Any specific requests for this design...' : 'Describe any specific details you want...'}
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

export default InspirationUpload;
