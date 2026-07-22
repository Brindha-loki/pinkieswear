export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    name: 'Vampy Red Gloss',
    description: 'Bold red glossy finish for a stunning look',
    price: 199,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082179553_vampy%20red%20gloss.jpeg',
    category: 'gloss'
  },
  {
    id: '2',
    name: 'Rich Romance (3d)',
    description: 'Romantic design with 3D embellishments',
    price: 249,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082178952_rich%20romance%20(3d).png',
    category: '3d'
  },
  {
    id: '3',
    name: 'Gold Glass',
    description: 'Elegant gold glass effect with shimmer',
    price: 199,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082178268_gold%20glass.jpeg',
    category: 'glitter'
  },
  {
    id: '4',
    name: 'Cooperate Girl (3d)',
    description: 'Professional look with 3D accents',
    price: 249,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082177539_cooperate%20girl%20(3d).jpeg',
    category: '3d'
  },
  {
    id: '5',
    name: 'Witch in Green',
    description: 'Mystical green with enchanting design',
    price: 199,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082179985_witch%20in%20green.png',
    category: 'artistic'
  },
  {
    id: '6',
    name: 'Golden Veil (3d)',
    description: 'Elegant golden veil with 3D elements',
    price: 249,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082178543_golden%20veil%20(3d).png',
    category: '3d'
  },
  {
    id: '7',
    name: 'Flesh in Gold',
    description: 'Nude base with golden accents',
    price: 199,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082178063_flesh%20in%20gold.jpeg',
    category: 'classic'
  },
  {
    id: '8',
    name: 'Cinnamon Girl (3d)',
    description: 'Warm cinnamon tones with 3D details',
    price: 249,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082176045_cinnamon%20girl%20(3d).webp',
    category: '3d'
  },
  {
    id: '9',
    name: 'Cotton Candy Glaze',
    description: 'Sweet cotton candy pink with glossy finish',
    price: 199,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082177856_cotton%20candy%20glaze.jpeg',
    category: 'gloss'
  },
  {
    id: '10',
    name: 'Whimsy Blue',
    description: 'Playful blue with whimsical design',
    price: 199,
    image: 'https://tbdouocfwvsxhrklffvj.supabase.co/storage/v1/object/public/gallery/gallery/1783082179783_whimsy%20blue.jpeg',
    category: 'artistic'
  }
];
