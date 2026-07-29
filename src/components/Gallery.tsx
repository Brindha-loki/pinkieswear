'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Section, SectionHeader } from './ui/Section';
import { Button } from './ui/Button';
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

const Gallery = () => {
  const [products, setProducts] = useState<GalleryProduct[]>(() => 
    galleryItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image,
      category: item.category
    }))
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await insforge.database
          .from('gallery_products')
          .select('*')
          .eq('is_active', true)

        if (data && !error) {
          setProducts(data)
        } else if (error && Object.keys(error).length > 0) {
          console.warn('Gallery database fetch failed, using static data:', error)
        }
      } catch (fetchError) {
        console.warn('Gallery fetch failed, using static data:', fetchError)
      }
    }

    fetchProducts()
  }, [])

  return (
    <Section id="gallery" className="bg-white/30">
      <SectionHeader
        title="Our Gallery"
        subtitle="Explore our collection of handcrafted nail designs, each created with love and attention to detail"
      />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products.map((item) => {
          const fallbackImage = galleryItems.find((staticItem) => staticItem.id === item.id)?.image;
          const imageUrl = item.image_url || fallbackImage || '';

          return (
            <Card key={item.id} hover className="group">
              <div className="aspect-square bg-gradient-to-br from-baby-pink to-blush-pink rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className="text-6xl hidden">💅</div>
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-rose-gold">
                  ₹{item.price}
                </div>
              </div>
              <CardHeader>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {item.name}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                <Link href={`/product/${item.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <div className="bg-rose-gold/10 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
          <p className="text-sm text-foreground/80 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-rose-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Shipping typically takes 10-20 days</span>
          </p>
        </div>
        <Button size="lg">View All Designs</Button>
      </div>
    </Section>
  );
};

export default Gallery;
