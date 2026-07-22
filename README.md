# The Pinkie Swear

A luxury custom press-on nail business website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Hero Section**: Stunning hero with floating decorative elements (hearts, bows, sparkles, pearls)
- **Gallery**: Portfolio-style showcase of 12 nail designs with pricing
- **Why Choose Us**: Feature cards highlighting brand benefits
- **How It Works**: Timeline section explaining the custom order process
- **Customer Reviews**: Testimonial section with star ratings
- **About Us**: Brand story and mission
- **Instagram Section**: Social media integration with image grid
- **FAQ**: Expandable accordion for common questions
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Glassmorphism UI**: Modern glass-effect cards and navigation
- **SEO Optimized**: Complete with metadata, sitemap, and robots.txt

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Playfair Display** (serif font)
- **Inter** (sans-serif font)

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles and animations
│   └── sitemap.ts          # SEO sitemap
├── components/
│   ├── Navigation.tsx      # Sticky glassmorphism navbar
│   ├── Hero.tsx            # Hero section with animations
│   ├── Gallery.tsx         # Nail design gallery
│   ├── WhyChooseUs.tsx     # Feature cards
│   ├── HowItWorks.tsx      # Timeline section
│   ├── Reviews.tsx         # Customer testimonials
│   ├── About.tsx           # Brand story
│   ├── Instagram.tsx       # Social media section
│   ├── FAQ.tsx             # Accordion FAQ
│   ├── Footer.tsx          # Footer with links
│   └── ui/
│       ├── Button.tsx      # Reusable button component
│       ├── Card.tsx        # Glassmorphism card
│       └── Section.tsx     # Section wrapper
└── data/
    ├── galleryData.ts      # Gallery items data
    └── mockData.ts         # Mock data for backend integration
```

## Design System

### Colors
- **Baby Pink**: #ffd6e0
- **Blush Pink**: #ffb6c1
- **Rose Gold**: #b76e79
- **Soft Lavender**: #e6e6fa
- **Background**: Gradient from #fff5f7 to #ffeef2

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Effects
- Glassmorphism cards with blur and transparency
- Floating animations for decorative elements
- Smooth hover transitions
- Subtle sparkle and pulse animations

## Future Backend Integration

The project includes mock data structures ready for:
- **InsForge Authentication**: User management
- **InsForge Database**: Nail sets, orders, reviews
- **InsForge Storage**: Image uploads
- **Razorpay**: Payment processing
- **Admin Dashboard**: Order and content management

See `src/data/mockData.ts` for the complete data structure.

## Deployment

This project is ready for Vercel deployment:

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## SEO

- Complete metadata configuration
- Open Graph tags
- Twitter Card tags
- XML sitemap
- robots.txt
- Semantic HTML structure

## Performance

- Optimized font loading
- Component-based architecture
- Lazy loading ready
- Minimal dependencies
- Clean code structure
