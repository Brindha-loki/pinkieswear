'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import WizardProgress from '@/components/wizard/WizardProgress';
import PersonalDetailsForm, { PersonalDetailsData } from '@/components/wizard/PersonalDetailsForm';
import InspirationUpload from '@/components/wizard/InspirationUpload';
import SizingUpload from '@/components/wizard/SizingUpload';
import { Button } from '@/components/ui/Button';
import { galleryItems } from '@/data/galleryData';
import insforge from '@/lib/insforge';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';

const CustomOrderFlow = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const galleryItemId = searchParams.get('galleryItem');
  const isGalleryFlow = !!galleryItemId;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3; // Custom: Inspiration → Sizing → Details, Gallery: Inspiration → Sizing → Details
  const [addedToCart, setAddedToCart] = useState(false);

  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsData | undefined>();
  const [inspirationImage, setInspirationImage] = useState<string | undefined>(() => {
    if (galleryItemId) {
      const item = galleryItems.find((item) => item.id === galleryItemId);
      return item?.image;
    }
    return undefined;
  });
  const [designNotes, setDesignNotes] = useState<string>('');
  const [threeDArtSelection, setThreeDArtSelection] = useState<string | undefined>();
  const [threeDArtPrice, setThreeDArtPrice] = useState<number>(0);
  const [nailPhotos, setNailPhotos] = useState<string[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | undefined>();
  const [sizingNotes, setSizingNotes] = useState<string>('');
  const [galleryItem, setGalleryItem] = useState<{ id: string; name: string; price: number; image: string } | undefined>(() => {
    if (galleryItemId) {
      const item = galleryItems.find((item) => item.id === galleryItemId);
      return item ? { id: item.id, name: item.name, price: item.price, image: item.image } : undefined;
    }
    return undefined;
  });
  const [tempPersonalDetails, setTempPersonalDetails] = useState<PersonalDetailsData | undefined>();

  // Step names for both flows: Inspiration → Sizing → Details
  const stepNames = ['Inspiration', 'Sizing', 'Details'];

  // Authentication guard - redirect to login with return URL (use replace to allow back navigation)
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.replace('/login?redirect=/');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchGalleryProduct = async () => {
      if (galleryItemId) {
        try {
          const { data, error } = await insforge.database
            .from('gallery_products')
            .select('*')
            .eq('id', galleryItemId)
            .single();

          if (data && !error) {
            setGalleryItem({ id: data.id, name: data.name, price: data.price, image: data.image_url });
            // Only update inspirationImage if not already set from URL param
            if (!searchParams.get('inspo')) {
              setInspirationImage(data.image_url);
            }
          } else if (error && Object.keys(error).length > 0) {
            console.warn('Gallery database fetch failed, using static data:', error);
          }
        } catch (error) {
          console.warn('Gallery fetch failed:', error);
        }
      }
    };

    fetchGalleryProduct();
  }, [galleryItemId, searchParams]);

  useEffect(() => {
    const inspoParam = searchParams.get('inspo');
    if (inspoParam) {
      try {
        const decoded = decodeURIComponent(inspoParam);
        setInspirationImage(decoded);
      } catch (e) {
        setInspirationImage(inspoParam);
      }
    }
  }, [searchParams]);

  const handlePersonalDetailsSubmit = (data: PersonalDetailsData) => {
    setPersonalDetails(data);
    setCurrentStep(2);
  };

  const handleInspirationUpload = (image: string) => {
    setInspirationImage(image);
  };

  const handleThreeDArtSelection = (selection: string, price: number) => {
    setThreeDArtSelection(selection);
    setThreeDArtPrice(price);
  };

  const handleDesignNotesChange = (notes: string) => {
    setDesignNotes(notes);
  };

  const handleNailPhotoUpload = (images: string[]) => {
    setNailPhotos(images);
  };

  const handleShapeSelect = (shape: string) => {
    setSelectedShape(shape);
  };

  const handleSizingNotes = (notes: string) => {
    setSizingNotes(notes);
  };

  const calculatePrice = () => {
    // For custom orders: use 3D art price if selected, otherwise base price
    if (!isGalleryFlow) {
      return threeDArtPrice > 0 ? threeDArtPrice : 199;
    }
    // For gallery orders: use the gallery product price
    return galleryItem?.price || 199;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddToCart = () => {
    // For custom orders, no gallery item is needed
    // For gallery orders, gallery item is required
    if (isGalleryFlow && !galleryItem) {
      alert('No product selected');
      return;
    }

    if (!personalDetails) {
      alert('Please complete personal details first');
      return;
    }


    const finalPrice = calculatePrice();

    const cartItem = {
      id: galleryItem?.name || `custom-order-${Date.now()}`,
      name: galleryItem?.name || 'Custom Order',
      price: finalPrice,
      image: galleryItem?.image || inspirationImage || '',
      shippingAddress: personalDetails.address,
      inspirationImage: inspirationImage,
      nailSizeImages: nailPhotos,
      designNotes: designNotes,
      nailShape: selectedShape,
      sizingNotes: sizingNotes,
      threeDArtSelection: threeDArtSelection,
      galleryProductId: galleryItem?.id || undefined,
    };

    console.log('[CustomOrderFlow] Adding to cart:', cartItem);
    addToCart(cartItem);
    setAddedToCart(true);
  };

  const handleProceedToCart = () => {
    router.push('/cart');
  };

  const handleBack = () => {
    router.back();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // Inspiration step for both flows
        return (
          <div className="animate-slide-in">
            <InspirationUpload
              onImageUpload={handleInspirationUpload}
              onDesignNotesChange={handleDesignNotesChange}
              onThreeDArtSelection={handleThreeDArtSelection}
              initialImage={inspirationImage}
              initialNotes={designNotes}
              initialThreeDArt={threeDArtSelection}
              readOnly={isGalleryFlow}
              galleryItem={galleryItem}
            />
            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handleNext}
                className="min-w-[150px]"
                disabled={!inspirationImage}
              >
                Next →
              </Button>
            </div>
          </div>
        );
      case 2:
        // Sizing step for both flows
        return (
          <div className="animate-slide-in">
            <SizingUpload
              onNailPhotoUpload={handleNailPhotoUpload}
              onShapeSelect={handleShapeSelect}
              onNotesSubmit={handleSizingNotes}
              initialNailPhoto={nailPhotos[0]}
              initialShape={selectedShape}
              initialNotes={sizingNotes}
            />
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="min-w-[150px]"
              >
                ← Previous
              </Button>
              <Button
                onClick={handleNext}
                className="min-w-[150px]"
                disabled={nailPhotos.length === 0 || !selectedShape}
              >
                Next →
              </Button>
            </div>
          </div>
        );
      case 3:
        // Details step for both flows
        return (
          <div className="animate-slide-in">
            <PersonalDetailsForm
              onSubmit={handlePersonalDetailsSubmit}
              initialData={personalDetails}
              showSubmitButton={false}
              onDataChange={setTempPersonalDetails}
            />
            <div className="bg-rose-gold/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-foreground/80 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Shipping typically takes 10-20 days</span>
              </p>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="min-w-[150px]"
              >
                ← Previous
              </Button>
              {!addedToCart ? (
                <Button
                  onClick={() => {
                    if (tempPersonalDetails) {
                      setPersonalDetails(tempPersonalDetails);
                      handleAddToCart();
                    }
                  }}
                  className="min-w-[150px]"
                  disabled={!tempPersonalDetails?.fullName || !tempPersonalDetails?.phone || !tempPersonalDetails?.whatsapp || !tempPersonalDetails?.address}
                >
                  Add to Cart
                </Button>
              ) : (
                <Button
                  onClick={handleProceedToCart}
                  className="min-w-[150px]"
                >
                  Proceed to Cart →
                </Button>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-20 px-4 md:px-8 lg:px-16">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-12 h-12 rounded-full bg-blush-pink/10 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 left-1/4 w-14 h-14 rounded-full bg-blush-pink/10 animate-float" style={{ animationDelay: '0.7s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 rounded-full bg-rose-gold/10 animate-float" style={{ animationDelay: '1.8s' }} />
          <div className="absolute top-60 left-1/4 w-8 h-8 rounded-full bg-rose-gold/20 animate-sparkle" style={{ animationDelay: '0.3s' }} />
          <div className="absolute top-80 right-1/3 w-10 h-10 rounded-full bg-blush-pink/20 animate-sparkle" style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-60 left-1/3 w-8 h-8 rounded-full bg-rose-gold/20 animate-sparkle" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-1/4 right-1/4 w-8 h-8 rounded-full bg-blush-pink/20 animate-sparkle" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-10 h-10 rounded-full bg-rose-gold/20 animate-sparkle" style={{ animationDelay: '0.6s' }} />
          <div className="absolute top-1/2 left-16 w-8 h-8 rounded-full bg-white/40 animate-pulse-soft" style={{ animationDelay: '0.7s' }} />
          <div className="absolute top-1/3 right-16 w-8 h-8 rounded-full bg-white/40 animate-pulse-soft" style={{ animationDelay: '1.7s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-8 h-8 rounded-full bg-white/40 animate-pulse-soft" style={{ animationDelay: '2.3s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {isGalleryFlow ? 'Gallery Order' : 'Custom Order'} Wizard
            </h1>
            <p className="text-foreground/70 text-lg">
              {isGalleryFlow
                ? 'Complete your gallery order in 3 simple steps'
                : 'Create your dream custom press-on nails in 3 simple steps'}
            </p>
          </div>

          <WizardProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepNames={stepNames}
          />

          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default CustomOrderFlow;
