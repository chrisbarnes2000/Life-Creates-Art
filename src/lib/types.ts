export type ShedConfiguration = {
  width: number;
  length: number;
  roofStyle: 'gable' | 'gambrel';
  doors: 'single' | 'double';
  windows: number;
  hasVents: boolean;
  hasGutters: boolean;
  hasPaint: boolean;
  paintColor?: string;
  hasRamp: boolean;
  hasSkirt: boolean;
  notes?: string;
};

export type GalleryItem = {
  id: string;
  imageUrl: string;
  description: string;
  hoverText?: string;
  album?: string;
  subAlbum?: string;
  uploadDate?: any;
  hidden?: boolean;
};

export type GoogleAlbum = {
  id: string;
  name: string;
  url: string;
  coverImage?: string;
  memoryUrl?: string;
  hidden?: boolean;
  price?: string;
};

export type RoofStyle = {
  id: 'gable' | 'gambrel';
  name: string;
  description: string;
  priceModifier: number;
  image: string;
  imageHint: string;
};

export type DomeConfiguration = {
  diameter: number;
  frequency: '2v' | '3v' | '4v';
  covering: 'vinyl' | 'polycarbonate';
  coveringColor?: string;
  notes?: string;
};
