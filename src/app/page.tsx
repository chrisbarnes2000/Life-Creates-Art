'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import dynamic from 'next/dynamic';

const PhotoGallery = dynamic(() => import('@/components/photo-gallery').then(mod => mod.PhotoGallery), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
});
const TestimonialCarousel = dynamic(() => import('@/components/testimonial-carousel').then(mod => mod.TestimonialCarousel), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});
const TestimonialForm = dynamic(() => import('@/components/testimonial-form').then(mod => mod.TestimonialForm), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false
});

import { AboutUs } from '@/components/about-us';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { firestore } = useFirebase();
  const [heroIndex, setHeroIndex] = React.useState(0);

  const heroCarouselDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'heroCarousel');
  }, [firestore]);

  const testimonialsConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'testimonials');
  }, [firestore]);

  const { data: heroCarouselConfig, isLoading: isHeroCarouselLoading } = useDoc(heroCarouselDocRef);
  const { data: testimonialsConfig, isLoading: isTestimonialsConfigLoading } = useDoc(testimonialsConfigRef);
  
  const showTestimonials = testimonialsConfig?.enabled !== false;

  // Hero Image Cycling Logic
  const heroSlides = React.useMemo(() => {
    if (heroCarouselConfig?.slides && heroCarouselConfig.slides.length > 0) {
      return heroCarouselConfig.slides.map((slide: any) => {
        if (slide.url && slide.url.includes('worldlandscapearchitect.com')) {
          return { ...slide, url: 'https://placehold.co/1920x1080/e2e8f0/1e293b?text=Image+Not+Found' };
        }
        return slide;
      });
    }
    return [
      { 
        url: PlaceHolderImages.find((p) => p.id === 'hero')?.imageUrl || '', 
        credit: 'Art and Photography by Tina Croft Barnes' 
      },
      { 
        url: PlaceHolderImages.find((p) => p.id === 'geometric-dome')?.imageUrl || '', 
        credit: 'Resilience & Strength Series' 
      },
      { 
        url: PlaceHolderImages.find((p) => p.id === 'hero2')?.imageUrl || PlaceHolderImages.find((p) => p.id === 'hero')?.imageUrl || '', 
        credit: 'Fine Art & Abstract Collections' 
      },
    ];
  }, [heroCarouselConfig]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Cycle every 6 seconds
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/30">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[500px] w-full text-white md:h-[650px] overflow-hidden bg-primary/10">
          {heroSlides.map((slide, idx) => {
            const isFirst = idx === 0;
            const isVisible = idx === heroIndex;
            return (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isVisible ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'}`}
              >
                <Image
                  src={
                    (slide.url && !slide.url.includes('photos.app.goo.gl')) 
                      ? slide.url 
                      : 'https://placehold.co/1920x1080/e2e8f0/1e293b?text=Image+Not+Found'
                  }
                  alt={`Hero image showing custom shed or dome ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={isFirst}
                  quality={90}
                  sizes="100vw"
                  data-ai-hint="shed backyard"
                  onError={(e: any) => {
                    e.target.src = "https://placehold.co/1920x1080/e2e8f0/1e293b?text=Visual+Asset+Missing";
                  }}
                />
                <div className="absolute bottom-4 right-4 z-10 hidden md:block">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {slide.credit}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4 text-center hero-gradient z-10">
            <div className="container max-w-4xl space-y-6">
              <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold drop-shadow-2xl text-white animate-in fade-in slide-in-from-bottom-4 duration-1000">
                Life Creates Art
              </h1>
              <p className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl text-gray-100 drop-shadow-lg opacity-90">
                Hi, I'm Tina. As an entrepreneur and mother of five, I have built a life rooted in independence and resilience. My career has taught me composure and decisive action—skills that now fuel my creative journey. This gallery is a reflection of my drive to thrive.
              </p>
              <div className="pt-4 flex items-center justify-center gap-4">
                <a href="#gallery" className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-bold text-accent-foreground shadow-lg transition-transform hover:scale-105 hover:bg-accent/90 relative z-20">
                  Explore Gallery
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto mt-[-80px] relative z-30 px-4">
          <div className="space-y-12">
            <AboutUs />
          </div>

          <div className="mt-24" id="gallery">
            <React.Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <PhotoGallery />
            </React.Suspense>
          </div>
        </div>
        
        {!isTestimonialsConfigLoading && showTestimonials && (
          <>
            <div className="mt-24">
              <TestimonialCarousel />
            </div>

            <div className="container mx-auto px-4 py-24">
              <TestimonialForm />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
