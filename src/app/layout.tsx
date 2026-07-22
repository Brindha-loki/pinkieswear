import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../lib/AuthContext';
import { CartProvider } from '../lib/CartContext';


const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Pinkie Swear | Luxury Custom Press-On Nails",
  description: "Luxury custom press-on nails, handmade just for you. Create your dream nail set with personalized custom orders or shop from our gallery of previous creations.",
  keywords: ["press-on nails", "custom nails", "handmade nails", "luxury nails", "nail art", "custom press-ons", "nail designs"],
  authors: [{ name: "The Pinkie Swear" }],
  creator: "The Pinkie Swear",
  publisher: "The Pinkie Swear",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thepinkieswear.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thepinkieswear.com',
    title: 'The Pinkie Swear | Luxury Custom Press-On Nails',
    description: 'Luxury custom press-on nails, handmade just for you. Create your dream nail set with personalized custom orders.',
    siteName: 'The Pinkie Swear',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Pinkie Swear | Luxury Custom Press-On Nails',
    description: 'Luxury custom press-on nails, handmade just for you.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
