import type { Metadata } from "next";
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Gallery from '@/components/Gallery';
import WhyChooseUs from '@/components/WhyChooseUs';
import HowItWorks from '@/components/HowItWorks';
import Reviews from '@/components/Reviews';
import About from '@/components/About';
import Instagram from '@/components/Instagram';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "The PinkieSwear",
  description: "Luxury Handmade Press-on Nails",
  openGraph: {
    title: "The PinkieSwear",
    description: "Luxury Handmade Press-on Nails",
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://thepinkieswear.com',
    siteName: 'The Pinkie Swear',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The PinkieSwear',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The PinkieSwear',
    description: 'Luxury Handmade Press-on Nails',
    images: ['/og-image.png'],
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <Gallery />
        <WhyChooseUs />
        <HowItWorks />
        <Reviews />
        <About />
        <Instagram />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
