'use client';

import React, { useState, useEffect, useRef } from 'react';
import insforge from '@/lib/insforge';

interface SizingUploadProps {
  onNailPhotoUpload: (images: string[]) => void;
  onShapeSelect: (shape: string) => void;
  onNotesSubmit: (notes: string) => void;
  initialNailPhoto?: string;
  initialShape?: string;
  initialNotes?: string;
}

interface NailShape {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

const SizingUpload: React.FC<SizingUploadProps> = ({
  onNailPhotoUpload,
  onShapeSelect,
  onNotesSubmit,
  initialNailPhoto,
  initialShape,
  initialNotes,
}) => {
  const [uploadedNailPhotos, setUploadedNailPhotos] = useState<string[]>(initialNailPhoto ? [initialNailPhoto] : []);
  const [selectedShape, setSelectedShape] = useState<string | undefined>(initialShape);
  const [additionalNotes, setAdditionalNotes] = useState(initialNotes || '');
  const [nailShapes, setNailShapes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedNailPhotos(initialNailPhoto ? [initialNailPhoto] : []);
  }, [initialNailPhoto]);

  useEffect(() => {
    setSelectedShape(initialShape);
  }, [initialShape]);

  useEffect(() => {
    setAdditionalNotes(initialNotes || '');
  }, [initialNotes]);

  useEffect(() => {
    const fetchNailShapes = async () => {
      try {
        const { data, error } = await insforge.database
          .from('nail_sizes')
          .select('name')
          .order('name', { ascending: true });

        if (data && !error) {
          setNailShapes(data.map((item: any) => item.name));
        } else {
          // Fallback to default shapes if database fetch fails
          setNailShapes([
            'Long Oval',
            'Medium Almond',
            'Medium Coffin',
            'Medium Square',
            'Short Almond',
          ]);
        }
      } catch (error) {
        console.warn('Failed to fetch nail shapes from database, using defaults:', error);
        setNailShapes([
          'Long Oval',
          'Medium Almond',
          'Medium Coffin',
          'Medium Square',
          'Short Almond',
        ]);
      }
    };

    fetchNailShapes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && uploadedNailPhotos.length < 4) {
      const remainingSlots = 4 - uploadedNailPhotos.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setUploadedNailPhotos(prev => {
            const newPhotos = [...prev, result];
            return newPhotos;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Call parent callback when uploadedNailPhotos changes
  useEffect(() => {
    onNailPhotoUpload(uploadedNailPhotos);
  }, [uploadedNailPhotos, onNailPhotoUpload]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedNailPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      return newPhotos;
    });
  };

  const handleShapeClick = (shape: string) => {
    setSelectedShape(shape);
    onShapeSelect(shape);
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
            Upload Your Nail Photos
          </h3>
          
          {/* Instruction Box */}
          <div className="bg-rose-gold/10 rounded-xl p-4 mb-4">
            <p className="text-sm text-foreground/80 mb-3">
              Upload upto 4 images of your natural nails for size reference, use any Indian coin for reference, example:
            </p>
            <div className="flex gap-3 justify-center">
              <img 
                src="/size-guide-1.jpg" 
                alt="Size guide example 1" 
                className="w-24 h-24 object-cover rounded-lg border border-rose-gold/20"
              />
              <img 
                src="/size-guide-2.jpg" 
                alt="Size guide example 2" 
                className="w-24 h-24 object-cover rounded-lg border border-rose-gold/20"
              />
            </div>
          </div>

          {uploadedNailPhotos.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {uploadedNailPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-baby-pink to-blush-pink flex items-center justify-center shadow-lg">
                      <img
                        src={photo}
                        alt={`Nail sizing photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {uploadedNailPhotos.length < 4 && (
                <button
                  onClick={handleUploadClick}
                  className="w-full py-3 border-2 border-dashed border-rose-gold/30 rounded-xl text-foreground/70 hover:border-rose-gold hover:bg-white/30 transition-all duration-300 font-medium"
                >
                  Add More Photos ({4 - uploadedNailPhotos.length} remaining)
                </button>
              )}
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
              <p className="text-foreground font-medium mb-2">Click to Upload Nail Photos</p>
              <p className="text-foreground/60 text-sm">Upload upto 4 photos of your natural nails</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
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

          {/* Interactive Shape Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {nailShapes.map((shape) => (
              <button
                key={shape}
                onClick={() => handleShapeClick(shape)}
                className={`
                  px-6 py-3 rounded-full border-2 font-medium transition-all duration-300 hover:scale-105 active:scale-95
                  ${selectedShape === shape
                    ? 'border-rose-gold bg-rose-gold text-white shadow-lg shadow-rose-gold/30'
                    : 'border-rose-gold/30 bg-white/30 text-foreground hover:border-rose-gold hover:bg-rose-gold/10'
                  }
                `}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      </div>

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
