export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = [
  {
    id: "hero",
    description: "A beautifully crafted wooden shed in a lush Pacific Northwest backyard.",
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1000",
    imageHint: "shed backyard"
  },
  {
    id: "hero2",
    description: "A beautifully crafted wooden shed in a lush Pacific Northwest backyard.",
    imageUrl: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1000",
    imageHint: "shed backyard"
  },
  {
    id: "geometric-dome",
    description: "A futuristic geometric dome structure in a natural setting.",
    imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    imageHint: "geodesic dome"
  },
  {
    id: "roof-gable",
    description: "A shed with a classic gable roof design.",
    imageUrl: "https://images.unsplash.com/photo-1754470277233-9a6a2dfe10d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxnYWJsZSUyMHJvb2Z8ZW58MHx8fHwxNzcxOTg0NTAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "gable roof"
  },
  {
    id: "roof-gambrel",
    description: "A shed with a barn-style gambrel roof, offering more headroom.",
    imageUrl: "https://images.unsplash.com/photo-1659386279394-0c008ef9c4fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHzfHxnYW1icmVsJTIwcm9vZnxlbnwwfHx8fDE3NzE5ODQ1MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "gambrel roof"
  },
  {
    id: "material-plywood",
    description: "Close-up of CDX plywood, showing its durable layers.",
    imageUrl: "https://images.unsplash.com/photo-1611072337226-1140ab367200?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwbHl3b29kJTIwdGV4dHVyZXxlbnwwfHx8fDE3NzE5ODQ1MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "plywood texture"
  },
  {
    id: "material-siding",
    description: "T1-11 siding on a shed, showcasing its vertical grooves.",
    imageUrl: "https://images.unsplash.com/photo-1604177421073-6cc94eae4f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHx3b29kJTIwc2lkaW5nfGVufDB8fHx8MTc3MTk4NDUwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "wood siding"
  }
];

export const fallbackGallery = [
  { id: "f1", imageUrl: "https://picsum.photos/seed/shed1/600/400", description: "Custom Gable Shed in Seattle" },
  { id: "f2", imageUrl: "https://picsum.photos/seed/shed2/600/400", description: "Garden Storage Unit - Sumner" },
  { id: "f3", imageUrl: "https://picsum.photos/seed/shed3/600/400", description: "Workshop with Double Doors" },
  { id: "f4", imageUrl: "https://picsum.photos/seed/shed4/600/400", description: "Geodesic Dome Studio" },
  { id: "f5", imageUrl: "https://picsum.photos/seed/shed5/600/400", description: "Classic Barn Style Storage" },
  { id: "f6", imageUrl: "https://picsum.photos/seed/shed6/600/400", description: "Backyard Office Space" }
];

export const testimonials: any[] = [];

// Unified mock data export matching old demo-data.json imports
const demoData = {
  placeholderImages: PlaceHolderImages,
  fallbackGallery,
  testimonials
};

export default demoData;
