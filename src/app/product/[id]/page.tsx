'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ImageCarousel from '@/components/ImageCarousel';
import insforge from '@/lib/insforge';
import { galleryItems } from '@/data/galleryData';

interface GalleryProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

const ProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<GalleryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      const productId = params.id as string;
      
      try {
        const { data, error } = await insforge.database
          .from('gallery_products')
          .select('*')
          .eq('id', productId)
          .eq('is_active', true)
          .single();

        if (data && !error) {
          setProduct(data);
        } else {
          const staticProduct = galleryItems.find(item => item.id === productId);
          if (staticProduct) {
            setProduct({
              id: staticProduct.id,
              name: staticProduct.name,
              description: staticProduct.description,
              price: staticProduct.price,
              image_url: staticProduct.image,
              category: staticProduct.category
            });
          }
        }
      } catch (fetchError) {
        const staticProduct = galleryItems.find(item => item.id === productId);
        if (staticProduct) {
          setProduct({
            id: staticProduct.id,
            name: staticProduct.name,
            description: staticProduct.description,
            price: staticProduct.price,
            image_url: staticProduct.image,
            category: staticProduct.category
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      const baseImage = product.image_url || '';
      
      // Create a normalized name for image matching
      const normalizedName = product.name
        .toLowerCase()
        .replace(/\(3d\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const fittedHandImage = `/${normalizedName} fitted hand.png`;
      const sideCloseImage = `/${normalizedName} side close.png`;
      
      const imageList = [baseImage];
      
      // Add fitted hand image if it exists (we'll check via image load error handling)
      imageList.push(fittedHandImage);
      imageList.push(sideCloseImage);
      
      setImages(imageList);
    }
  }, [product]);

  const handleBuy = () => {
    if (!product) return;
    const customOrderUrl = `/custom-order?galleryItem=${product.id}&inspo=${encodeURIComponent(product.image_url)}`;
    router.push(`/login?redirect=${encodeURIComponent(customOrderUrl)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-foreground/70">Loading...</div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-foreground/70">Product not found</div>
        </main>
      </div>
    );
  }

  const defaultDescription = 'Handmade premium reusable press-on nails designed for comfort, durability and salon-quality elegance. Each set is handcrafted with premium gel products for a flawless finish.';
  const description = product.description || defaultDescription;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-4 md:p-8 space-y-6">
            {/* Image Carousel */}
            <div className="max-w-md mx-auto">
              <ImageCarousel images={images} productName={product.name} />
            </div>

            {/* Product Name */}
            <div className="text-center">
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
            </div>

            {/* Product Description */}
            <div className="text-center">
              <p className="text-foreground/70 text-sm md:text-lg leading-relaxed">
                {description}
              </p>
            </div>

            {/* Price */}
            <div className="text-center">
              <p className="font-serif text-3xl md:text-5xl font-bold text-rose-gold">
                ₹{product.price}
              </p>
            </div>

            {/* Free Supply Section */}
            <div className="bg-rose-gold/10 rounded-2xl p-4 md:p-6">
              <h2 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4 text-center">
                Included Free
              </h2>
              <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-foreground/80">
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Nail glue (for longer wear)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Adhesive tabs (for temporary wear)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Mini nail file</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Cuticle stick</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Alcohol prep pad</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Cuticle pusher</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🩷</span>
                  <span>Buffer</span>
                </li>
              </ul>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuy}
              className="w-full px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-rose-gold to-blush-pink text-white rounded-full font-medium text-base md:text-lg hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Buy
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
