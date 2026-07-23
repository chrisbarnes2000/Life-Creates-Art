
'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Loader2, MessageSquareOff, BadgeCheck } from 'lucide-react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import demoData from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: string;
  author: string;
  location: string;
  text: string;
  rating: number;
  status: string;
  category?: string;
  date?: any;
}

export function TestimonialCarousel() {
  const { firestore } = useFirebase();

  // Simplified query to avoid immediate composite index requirements.
  // We'll filter for 'approved' status in the React logic below.
  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'allTestimonials'),
      orderBy('date', 'desc')
    );
  }, [firestore]);

  const { data: allTestimonials, isLoading } = useCollection<Testimonial>(testimonialsQuery);

  // Determine which testimonials to display
  const displayTestimonials = React.useMemo(() => {
    const approvedFromDb = allTestimonials?.filter(t => t.status === 'approved') || [];
    
    // If we have any approved items in the live DB, use them.
    if (approvedFromDb.length > 0) {
      return approvedFromDb;
    }
    
    // Only fall back to demo data if the DB is actually empty of approved items.
    return demoData.testimonials;
  }, [allTestimonials]);

  if (isLoading) {
    return (
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm font-bold text-muted-foreground animate-pulse">Fetching live community stories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-primary md:text-4xl">What Our Customers Say</h2>
          <p className="mt-4 text-foreground font-bold opacity-80">Trusted by homeowners and venue owners across the Pacific Northwest.</p>
        </div>
        
        {displayTestimonials.length > 0 ? (
          <Carousel className="mx-auto w-full max-w-4xl px-4 md:px-12">
            <CarouselContent>
              {displayTestimonials.map((t) => (
                <CarouselItem key={t.id}>
                  <Card className="h-full border-none bg-background shadow-lg transition-transform duration-300 hover:scale-[1.01]">
                    <CardContent className="flex h-full flex-col items-center p-8 text-center md:p-12 relative">
                      <Quote className="mb-6 h-10 w-10 text-accent opacity-50" />
                      
                      {t.category && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter opacity-70">
                            {t.category}
                          </Badge>
                        </div>
                      )}

                      <div className="mb-6 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < t.rating ? 'fill-accent text-accent' : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <p className="mb-8 text-lg italic leading-relaxed text-foreground font-bold md:text-xl">
                        "{t.text}"
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-lg font-bold text-primary">{t.author}</p>
                          <BadgeCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-sm uppercase font-bold tracking-wider text-muted-foreground">{t.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-12 bg-background shadow-md hover:bg-accent hover:text-accent-foreground border-primary/20" />
              <CarouselNext className="-right-12 bg-background shadow-md hover:bg-accent hover:text-accent-foreground border-primary/20" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-12 bg-background rounded-xl border border-dashed border-primary/20">
            <MessageSquareOff className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="font-bold text-muted-foreground">Be the first to share your gallery experience!</p>
          </div>
        )}
      </div>
    </section>
  );
}
