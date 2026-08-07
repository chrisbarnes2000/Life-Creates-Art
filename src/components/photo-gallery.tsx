'use client';

import * as React from 'react';
import Image from 'next/image';
import { useCollection, useFirebase, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ImageIcon, FolderOpen, ArrowLeft, ExternalLink, Image as ImageIcon2, Share2, ChevronLeft, ChevronRight, Plus, Share, Clock } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import demoData from '@/lib/placeholder-images';
import { useSearchParams, useRouter } from 'next/navigation';
import { extractGooglePhotos } from '@/app/actions';
import { GalleryItem, GoogleAlbum } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Link configuration handled via Firebase appConfig/googleAlbums

type SelectedAlbumType = 
  | { type: 'google'; id: string; name: string; url: string; memoryUrl?: string }
  | { type: 'custom'; name: string; subAlbum?: string };

function GoogleAlbumCard({ 
  album, 
  onSelect, 
  googleCovers, 
  setGoogleCovers, 
  photoCache 
}: { 
  album: GoogleAlbum, 
  onSelect: (a: SelectedAlbumType) => void,
  googleCovers: Record<string, string>,
  setGoogleCovers: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  photoCache: React.MutableRefObject<Record<string, string[]>>
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (inView) {
      const defaultPlaceholders = [
        'https://placehold.co/800x600/e2e8f0/1e293b?text=Google+Photos+Album',
        'https://placehold.co/800x600/e2e8f0/1e293b?text=Album',
        'https://placehold.co/800x600/e2e8f0/1e293b?text=Collection'
      ];

      const isDirectImage = album.coverImage && 
                           (album.coverImage.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i) || 
                            album.coverImage.includes('googleusercontent.com'));

      const needsExtraction = !isDirectImage || 
                             album.coverImage?.includes('photos.app.goo.gl') || 
                             album.coverImage?.includes('photos.google.com/share') ||
                             (album.coverImage && defaultPlaceholders.includes(album.coverImage));

      if (needsExtraction) {
        if (photoCache.current[album.url]) {
          setGoogleCovers(prev => ({ ...prev, [album.id]: photoCache.current[album.url][0] }));
          return;
        }

        setLoading(true);
        extractGooglePhotos(album.url).then(urls => {
          if (urls.length > 0) {
            photoCache.current[album.url] = urls;
            setGoogleCovers(prev => ({ ...prev, [album.id]: urls[0] }));
          }
          setLoading(false);
        }).catch(err => {
          console.error("Cover extraction failed", err);
          setLoading(false);
        });
      }
    }
  }, [inView, album, photoCache, setGoogleCovers]);

  const coverSrc = React.useMemo(() => {
    const defaultPlaceholders = [
      'https://placehold.co/800x600/e2e8f0/1e293b?text=Google+Photos+Album',
      'https://placehold.co/800x600/e2e8f0/1e293b?text=Album',
      'https://placehold.co/800x600/e2e8f0/1e293b?text=Collection'
    ];
    
    const isDirectImage = album.coverImage && 
                         (album.coverImage.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)$/i) || 
                          album.coverImage.includes('googleusercontent.com'));

    const isGeneric = !isDirectImage || 
                     album.coverImage?.includes('photos.app.goo.gl') || 
                     album.coverImage?.includes('photos.google.com/share') ||
                     (album.coverImage && defaultPlaceholders.includes(album.coverImage));
    
    if (isGeneric && googleCovers[album.id]) {
      return googleCovers[album.id];
    }
    return album.coverImage || 'https://placehold.co/800x600/e2e8f0/1e293b?text=Album';
  }, [album, googleCovers]);

  return (
    <Card 
      ref={ref}
      className="group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onSelect({ 
        type: 'google', 
        id: album.id, 
        name: album.name, 
        url: album.url,
        memoryUrl: album.memoryUrl
      })}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] w-full bg-muted/30">
          <Image
            src={coverSrc}
            alt={album.name}
            fill
            unoptimized
            className={`object-cover transition-opacity duration-300 pointer-events-none ${loading ? 'opacity-50' : 'opacity-100'}`}
            onDragStart={(e) => e.preventDefault()}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e: any) => {
              e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Album+Cover+Unavailable";
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <FolderOpen className="h-5 w-5 text-zinc-300" />
                <p className="text-lg font-bold text-white tracking-tight">
                  {album.name}
                </p>
              </div>
              {album.price && (
                <p className="text-xs text-accent font-black uppercase tracking-wider pl-7">
                  Prints from ${album.price}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const formatDate = (dateValue: any) => {
  if (!dateValue) return '';
  let d: Date;
  if (typeof dateValue.toDate === 'function') {
    d = dateValue.toDate();
  } else if (dateValue instanceof Date) {
    d = dateValue;
  } else if (dateValue.seconds) {
    d = new Date(dateValue.seconds * 1000);
  } else {
    d = new Date(dateValue);
  }
  
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function PhotoGallery() {
  const { firestore } = useFirebase();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'), orderBy('uploadDate', 'desc'));
  }, [firestore]);

  const { data: firestoreItems, isLoading } = useCollection<GalleryItem>(galleryQuery);

  // Fetch google albums
  const googleAlbumsConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'googleAlbums');
  }, [firestore]);
  const { data: googleAlbumsDoc } = useDoc(googleAlbumsConfigRef);

  const googleAlbums = React.useMemo(() => {
    const rawAlbums = googleAlbumsDoc?.albums || [];
    // Filter out hidden albums and any entries that do not have a valid name and URL
    return rawAlbums.filter((a: GoogleAlbum) => !a.hidden && a.name?.trim() && a.url?.trim());
  }, [googleAlbumsDoc]);

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = React.useState<number | 'all'>(25);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<'uploadDate' | 'lastUpdated'>('uploadDate');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Combine Firestore items with demo data as a fallback if Firestore is empty
  const displayItems = React.useMemo(() => {
    const items = (firestoreItems && firestoreItems.length > 0) 
      ? firestoreItems 
      : demoData.fallbackGallery;
    
    // Filter out hidden items and malformed directory-marker items
    return items.filter((item: GalleryItem) => {
      if (item.hidden) return false;
      if (item.storagePath && item.storagePath.endsWith('/')) return false;
      // Filter out specific known broken path "gallery/"
      if (item.storagePath === 'gallery/') return false;
      return true;
    });
  }, [firestoreItems]);

  const [selectedAlbum, setSelectedAlbum] = React.useState<SelectedAlbumType | null>(null);
  const galleryHeaderRef = React.useRef<HTMLDivElement>(null);
  
  // Handle Deep Linking
  React.useEffect(() => {
    const albumId = searchParams.get('albumId');
    const albumName = searchParams.get('albumName');
    const subAlbumName = searchParams.get('subAlbum');

    if (albumId) {
      const googleAlbum = googleAlbums.find(a => a.id === albumId);
      if (googleAlbum) {
        setSelectedAlbum({ 
          type: 'google', 
          id: googleAlbum.id, 
          name: googleAlbum.name, 
          url: googleAlbum.url,
          memoryUrl: googleAlbum.memoryUrl 
        });
      }
    } else if (albumName) {
      setSelectedAlbum({ type: 'custom', name: albumName, subAlbum: subAlbumName || undefined });
    }
  }, [searchParams, googleAlbums]);

  const updateUrl = (album: SelectedAlbumType | null) => {
    const params = new URLSearchParams(searchParams);
    if (!album) {
      params.delete('albumId');
      params.delete('albumName');
      params.delete('subAlbum');
    } else if (album.type === 'google') {
      params.set('albumId', album.id);
      params.delete('albumName');
      params.delete('subAlbum');
    } else {
      params.set('albumName', album.name);
      if (album.subAlbum) {
        params.set('subAlbum', album.subAlbum);
      } else {
        params.delete('subAlbum');
      }
      params.delete('albumId');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSelectAlbum = (album: SelectedAlbumType | null) => {
    setSelectedAlbum(album);
    setCurrentPage(1); // Reset pagination
    updateUrl(album);
    if (galleryHeaderRef.current) {
      galleryHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Fetch site settings for watermark
  const siteSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'siteSettings');
  }, [firestore]);
  const { data: siteSettings } = useDoc(siteSettingsRef);
  const watermarkEnabled = siteSettings?.watermarkEnabled;
  const watermarkText = siteSettings?.watermarkText || '© Tina Barnes';

  // Helper for watermark overlay
  const renderWatermark = () => {
    if (!watermarkEnabled) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="bg-black/75 dark:bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-white/50 shadow-2xl rotate-[-25deg]">
          <span className="text-white text-sm sm:text-base font-black uppercase tracking-widest select-none whitespace-nowrap drop-shadow-md">
            {watermarkText}
          </span>
        </div>
      </div>
    );
  };

  // Extracting photos from Google Albums (Lazy Loading)
  const [googleCovers, setGoogleCovers] = React.useState<Record<string, string>>({});
  const photoCache = React.useRef<Record<string, string[]>>({});
  const [googlePhotos, setGooglePhotos] = React.useState<string[]>([]);
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false);

  React.useEffect(() => {
    if (selectedAlbum?.type === 'google') {
      let isMounted = true;
      
      if (photoCache.current[selectedAlbum.url]) {
        setGooglePhotos(photoCache.current[selectedAlbum.url]);
        return;
      }

      setIsLoadingGoogle(true);
      setGooglePhotos([]);
      extractGooglePhotos(selectedAlbum.url).then(urls => {
        if (isMounted) {
          photoCache.current[selectedAlbum.url] = urls;
          setGooglePhotos(urls);
          setIsLoadingGoogle(false);
        }
      }).catch(() => {
        if (isMounted) {
          setIsLoadingGoogle(false);
        }
      });
      return () => { isMounted = false; };
    }
  }, [selectedAlbum]);

  const customAlbums = React.useMemo(() => {
    const albums = new Map<string, { cover: string, subAlbums: Set<string> }>();
    
    displayItems.forEach(item => {
      if (item.album) {
        if (!albums.has(item.album)) {
          albums.set(item.album, { cover: item.imageUrl, subAlbums: new Set() });
        }
        if (item.subAlbum) {
          albums.get(item.album)!.subAlbums.add(item.subAlbum);
        }
      }
    });
    return Array.from(albums.entries()).map(([name, data]) => ({
      name,
      coverImage: data.cover,
      subAlbums: Array.from(data.subAlbums)
    }));
  }, [displayItems]);

  const currentAlbumData = React.useMemo(() => {
    if (selectedAlbum?.type === 'custom') {
      return customAlbums.find(a => a.name === selectedAlbum.name);
    }
    return null;
  }, [customAlbums, selectedAlbum]);

  const standalonePhotos = React.useMemo(() => {
    return displayItems.filter(item => !item.album);
  }, [displayItems]);

  // Photos to render if a custom album is selected
  const activeCustomPhotos = React.useMemo(() => {
    let items: GalleryItem[] = [];
    if (selectedAlbum?.type === 'custom') {
      if (selectedAlbum.name === 'All Photos') {
        items = [...standalonePhotos];
      } else {
        items = displayItems.filter(item => item.album === selectedAlbum.name);
        
        if (selectedAlbum.subAlbum) {
          items = items.filter(item => item.subAlbum === selectedAlbum.subAlbum);
        } else if (currentAlbumData?.subAlbums && currentAlbumData.subAlbums.length > 0) {
          // If we have subalbums but none selected, show photos that HAVE NO subalbum
          items = items.filter(item => !item.subAlbum);
        }
      }
    } else {
      return [];
    }

    // Sort client-side based on sortBy and sortOrder
    return [...items].sort((a: any, b: any) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      const getMs = (val: any) => {
        if (!val) return 0;
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (val.seconds) return val.seconds * 1000;
        return new Date(val).getTime() || 0;
      };

      const msA = getMs(valA);
      const msB = getMs(valB);

      if (sortOrder === 'desc') {
        return msB - msA;
      } else {
        return msA - msB;
      }
    });
  }, [displayItems, selectedAlbum, standalonePhotos, currentAlbumData, sortBy, sortOrder]);

  // Paginated View Items
  const paginatedPhotos = React.useMemo(() => {
    const allPhotos = selectedAlbum?.type === 'google' ? googlePhotos : activeCustomPhotos;
    if (itemsPerPage === 'all') return allPhotos;
    const start = (currentPage - 1) * itemsPerPage;
    return allPhotos.slice(start, start + itemsPerPage);
  }, [selectedAlbum, googlePhotos, activeCustomPhotos, itemsPerPage, currentPage]);

  const totalPages = React.useMemo(() => {
    const allPhotos = selectedAlbum?.type === 'google' ? googlePhotos : activeCustomPhotos;
    if (itemsPerPage === 'all') return 1;
    return Math.ceil(allPhotos.length / itemsPerPage);
  }, [selectedAlbum, googlePhotos, activeCustomPhotos, itemsPerPage]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "Deep link to this album copied to clipboard.",
      });
    });
  };

  const handleProtectContent = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Content Protected",
      description: "Right-click is disabled to protect project assets. Please contact us for high-resolution images.",
      variant: "destructive",
    });
  };

  return (
    <section className="py-12 select-none" onContextMenu={handleProtectContent} ref={galleryHeaderRef}>
      <div className="mb-10 text-center relative max-w-4xl mx-auto px-4">
        {selectedAlbum ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between min-h-[48px] border-b pb-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (selectedAlbum.type === 'custom' && selectedAlbum.subAlbum) {
                      handleSelectAlbum({ type: 'custom', name: selectedAlbum.name });
                    } else {
                      handleSelectAlbum(null);
                    }
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {selectedAlbum.type === 'custom' && selectedAlbum.subAlbum ? 'To Album' : 'Back'}
                </Button>
                
                {selectedAlbum.type === 'custom' && selectedAlbum.subAlbum && (
                   <Badge variant="outline" className="hidden sm:inline-flex bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[9px]">
                     {selectedAlbum.name} Archive
                   </Badge>
                )}
              </div>
              
              <h2 className="font-headline text-2xl font-bold text-primary truncate mx-4">
                {selectedAlbum.subAlbum || selectedAlbum.name}
              </h2>

              <div className="flex items-center gap-2">
                {selectedAlbum.type === 'custom' && selectedAlbum.subAlbum && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex text-xs font-bold text-muted-foreground hover:text-primary"
                    onClick={() => handleSelectAlbum(null)}
                  >
                    All Collections
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={handleShare} title="Copy Deep Link" className="h-8 w-8">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pagination & Sorting Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Show:</span>
                  <Select 
                    value={itemsPerPage.toString()} 
                    onValueChange={(v) => {
                      setItemsPerPage(v === 'all' ? 'all' : parseInt(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[80px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Sort By:</span>
                  <Select 
                    value={`${sortBy}-${sortOrder}`} 
                    onValueChange={(v) => {
                      const [field, order] = v.split('-');
                      setSortBy(field as 'uploadDate' | 'lastUpdated');
                      setSortOrder(order as 'desc' | 'asc');
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[160px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uploadDate-desc">Upload Date (Newest)</SelectItem>
                      <SelectItem value="uploadDate-asc">Upload Date (Oldest)</SelectItem>
                      <SelectItem value="lastUpdated-desc">Modified Date (Newest)</SelectItem>
                      <SelectItem value="lastUpdated-asc">Modified Date (Oldest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      galleryHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      galleryHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary md:text-4xl pr-2">Project Gallery</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              A look at some of our recent builds in the region, from custom garden sheds to precision-engineered domes. Explore our Google Photos albums and categorized projects.
            </p>
          </>
        )}
      </div>
      
      {/* --- Album Overview Mode --- */}
      {!selectedAlbum && (
        <div className="space-y-12">
          {/* Google Photos Albums */}
          {googleAlbums.length > 0 && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-6 flex items-center justify-center text-center">
                <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                  <ImageIcon2 className="h-5 w-5" />
                </span>
                Google Photos Albums
              </h3>
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {googleAlbums.map((album: any) => (
                  <div key={album.id} className="w-full sm:w-[300px] md:w-[340px]">
                    <GoogleAlbumCard
                      album={album}
                      onSelect={handleSelectAlbum}
                      googleCovers={googleCovers}
                      setGoogleCovers={setGoogleCovers}
                      photoCache={photoCache}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Grouped Albums */}
          {customAlbums.length > 0 && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-6 flex items-center justify-center text-center">
                <span className="bg-secondary/20 text-secondary-foreground p-2 rounded-lg mr-3">
                  <FolderOpen className="h-5 w-5" />
                </span>
                Project Collections
              </h3>
              <div className="flex flex-wrap justify-center gap-6 w-full">
                {customAlbums.map((album) => (
                  <Card 
                    key={album.name} 
                    className="w-full sm:w-[300px] md:w-[340px] group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleSelectAlbum({ type: 'custom', name: album.name })}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                           src={album.coverImage || 'https://placehold.co/800x600/e2e8f0/1e293b?text=Collection'}
                           alt={album.name}
                           fill
                           unoptimized
                           className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                           onDragStart={(e) => e.preventDefault()}
                           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                           onError={(e: any) => {
                             e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Collection+Unavailable";
                           }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-6 flex flex-col justify-end">
                          <p className="text-lg font-bold text-white tracking-tight text-center">
                            {album.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Individual Standalone Photos */}
          {standalonePhotos.length > 0 && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-6 flex items-center justify-center text-center">
                <span className="bg-accent/20 text-accent-foreground p-2 rounded-lg mr-3">
                  <ImageIcon2 className="h-5 w-5" />
                </span>
                Individual Projects
              </h3>
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {standalonePhotos.slice(0, 10).map((img) => (
                  <Card key={img.id} className="w-[140px] sm:w-[180px] md:w-[220px] group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                    <CardContent className="p-0">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={img.imageUrl || 'https://placehold.co/800x600/e2e8f0/1e293b?text=Image'}
                          alt={img.description}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                          onDragStart={(e) => e.preventDefault()}
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                          onError={(e: any) => {
                            e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Broken+Asset";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <div className="flex flex-col w-full">
                            {img.hoverText && (
                              <p className="text-[10px] font-black uppercase tracking-tighter text-accent-foreground mb-0.5 animate-in slide-in-from-bottom-2">
                                {img.hoverText}
                              </p>
                            )}
                            <p className="text-[10px] font-medium text-white line-clamp-2 leading-tight">
                              {img.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {standalonePhotos.length > 10 && (
                  <div 
                    className="w-[140px] sm:w-[180px] md:w-[220px] aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl hover:bg-muted/50 transition-colors cursor-pointer text-muted-foreground"
                    onClick={() => handleSelectAlbum({ type: 'custom', name: 'All Photos' })}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-tighter">View {standalonePhotos.length - 10} more</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback loose photos loading/empty states */}
          {isLoading && (!firestoreItems || firestoreItems.length === 0) ? (
            // Hide the blocking loader screen completely if we already have the local fallback items rendering!
            null
          ) : (
            !isLoading && customAlbums.length === 0 && standalonePhotos.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/10">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                <p className="mt-4 text-muted-foreground">No local projects to display yet.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* --- Detail/Album Mode --- */}
      {selectedAlbum && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selectedAlbum.type === 'google' && (
            <>
              {isLoadingGoogle ? (
                <div className="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-xl border border-dashed border-border/50">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground font-medium animate-pulse">Fetching high-res photos from Google...</p>
                </div>
              ) : paginatedPhotos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedPhotos.map((url, i) => (
                    <Card key={i} className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl bg-muted/20">
                      <CardContent className="p-0">
                        <div className="relative aspect-[4/3] w-full">
                          <Image
                            src={url as string}
                            alt={`Google Photo ${((currentPage - 1) * (itemsPerPage === 'all' ? 0 : itemsPerPage)) + i + 1}`}
                            fill
                            loading="lazy"
                            unoptimized
                            className="object-cover cursor-pointer pointer-events-none"
                            referrerPolicy="no-referrer"
                            onDragStart={(e) => e.preventDefault()}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            onError={(e: any) => {
                              e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Asset+Unavailable";
                            }}
                          />
                          {renderWatermark()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-muted/10 rounded-xl border border-dashed border-border/50">
                  <ImageIcon2 className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground font-medium">Could not load photos right now.</p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-primary"
                    asChild
                  >
                    <a href={selectedAlbum.url} target="_blank" rel="noopener noreferrer">
                      View directly on Google Photos
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}

          {selectedAlbum.type === 'custom' && (
            <div className="space-y-12">
              {/* If we are at the top level of a custom album and it has sub-albums, show them */}
              {!selectedAlbum.subAlbum && currentAlbumData?.subAlbums && currentAlbumData.subAlbums.length > 0 && (
                <div>
                   <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-6 border-l-4 border-primary pl-4">
                     Project Specializations
                   </h3>
                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                     {currentAlbumData.subAlbums.map(sub => {
                       const subCover = displayItems.find(i => i.album === selectedAlbum.name && i.subAlbum === sub)?.imageUrl;
                       return (
                        <Card 
                          key={sub} 
                          className="group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-muted/20"
                          onClick={() => handleSelectAlbum({ type: 'custom', name: selectedAlbum.name, subAlbum: sub })}
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-[16/9] w-full">
                              <Image
                                src={subCover || 'https://placehold.co/800x600/e2e8f0/1e293b?text=Collection'}
                                alt={sub}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                                onDragStart={(e) => e.preventDefault()}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                <p className="text-sm font-black text-white uppercase tracking-wider leading-tight">
                                  {sub}
                                </p>
                              </div>
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge className="bg-primary text-white font-bold text-[9px] uppercase">
                                   Explore Sub-Archive
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                       );
                     })}
                   </div>
                   {(activeCustomPhotos.length > 0) && (
                     <div className="mt-12">
                        <h3 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-6 border-l-4 border-zinc-300 pl-4">
                          Main {selectedAlbum.name} Collection
                        </h3>
                     </div>
                   )}
                </div>
              )}
              
              <div id="gallery-photos-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedPhotos.length > 0 ? paginatedPhotos.map((img: any) => (
                  <Card key={img.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl">
                    <CardContent className="p-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={img.imageUrl || 'https://placehold.co/800x600/e2e8f0/1e293b?text=Image'}
                          alt={img.description}
                          fill
                          loading="lazy"
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                          onDragStart={(e) => e.preventDefault()}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          onError={(e: any) => {
                            e.currentTarget.src = "https://placehold.co/800x600/e2e8f0/1e293b?text=Broken+Asset";
                          }}
                        />
                        {renderWatermark()}
                        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                           <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                              {img.price && (
                                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm">
                                  ${img.price}
                                </span>
                              )}
                              <Button size="sm" className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm text-xs font-bold" onClick={(e) => { e.stopPropagation(); toast({ title: "Order Prints", description: img.price ? `Order inquiry for "${img.description}" at $${img.price} is registered.` : "This feature is coming soon."})}}>
                                Order Prints
                              </Button>
                           </div>
                           <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0 flex flex-col">
                            {img.hoverText && (
                              <p className="text-xs font-black uppercase tracking-widest text-accent-foreground mb-1 drop-shadow-sm">
                                {img.hoverText}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-white drop-shadow-md">
                              {img.description}
                            </p>
                            {img.uploadDate && (
                              <p className="text-[10px] text-white/70 font-semibold mt-1.5 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-accent" />
                                Uploaded: {formatDate(img.uploadDate)}
                              </p>
                            )}
                            {img.lastUpdated && formatDate(img.lastUpdated) !== formatDate(img.uploadDate) && (
                              <p className="text-[10px] text-white/70 font-semibold mt-0.5 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-accent" />
                                Modified: {formatDate(img.lastUpdated)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                   !selectedAlbum.subAlbum && currentAlbumData?.subAlbums && currentAlbumData.subAlbums.length > 0 ? null : (
                    <div className="col-span-full py-20 text-center bg-muted/10 rounded-xl border-2 border-dashed">
                      <ImageIcon2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No direct photos in this collection category yet.</p>
                    </div>
                   )
                )}
              </div>
            </div>
          )}

          {/* Bottom Pagination for convenience */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 py-6 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  galleryHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  galleryHeaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
