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
  title: "The PinkieSwear - Luxury Handmade Press-on Nails",
  description: "Discover premium handmade press-on nails at The PinkieSwear. Custom nail designs and luxury press-ons crafted for salon-quality results at home.",
  keywords: ["press-on nails", "custom nails", "handmade nails", "luxury nails", "nail art", "custom press-ons", "nail designs", "reusable nails", "press on nail sets"],
  authors: [{ name: "The Pinkie Swear" }],
  creator: "The Pinkie Swear",
  publisher: "The Pinkie Swear",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://thepinkieswear.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://thepinkieswear.com',
    title: 'The PinkieSwear - Luxury Handmade Press-on Nails',
    description: 'Discover premium handmade press-on nails at The PinkieSwear. Custom nail designs and luxury press-ons crafted for salon-quality results at home.',
    siteName: 'The Pinkie Swear',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Pinkie Swear - Luxury Handmade Press-on Nails',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The PinkieSwear - Luxury Handmade Press-on Nails',
    description: 'Discover premium handmade press-on nails at The PinkieSwear. Custom nail designs and luxury press-ons crafted for salon-quality results at home.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Pinkie Swear',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
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
