import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 md:p-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <p className="text-foreground/70 mb-6 leading-relaxed">
            At The Pinkie Swear, we respect your privacy and are committed to protecting your personal information.
          </p>

          <section className="space-y-4 text-foreground/80">
            <h2 className="font-serif text-xl font-semibold text-foreground">Information We Collect</h2>
            <p>
              We collect information you provide when placing an order, creating an account, or contacting us — including your name, email, phone number, shipping details, nail sizing photos, and design preferences.
            </p>

            <h2 className="font-serif text-xl font-semibold text-foreground">How We Use Your Information</h2>
            <p>
              Your information is used to process orders, create custom nail sets, communicate order updates, and improve our services. We do not sell your personal data to third parties.
            </p>

            <h2 className="font-serif text-xl font-semibold text-foreground">Data Security</h2>
            <p>
              We take reasonable measures to protect your information. Payment and account data are handled through secure platforms.
            </p>

            <h2 className="font-serif text-xl font-semibold text-foreground">Contact</h2>
            <p>
              For privacy-related questions, call{' '}
              <a href="tel:+917349413365" className="text-rose-gold hover:underline">
                +91 7349413365
              </a>.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-rose-gold/20">
            <Link href="/" className="text-rose-gold hover:underline text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
