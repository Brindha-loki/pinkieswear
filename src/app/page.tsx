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
