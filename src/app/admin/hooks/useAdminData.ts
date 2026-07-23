import { useMemoFirebase, useCollection, useDoc, useFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';

export function useAdminData() {
  const { firestore, storage, auth } = useFirebase();

  // Testimonials Config
  const testimonialsConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'testimonials');
  }, [firestore]);
  const { data: testimonialsConfig } = useDoc(testimonialsConfigRef);

  // Inquiries
  const inquiriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Remove orderBy for now to ensure all documents appear even if missing requestDate
    return collection(firestore, 'allConsultationRequests');
  }, [firestore]);
  const { data: requests, isLoading: isLoadingReqs } = useCollection(inquiriesQuery);

  // Gallery
  const galleryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'gallery'), orderBy('uploadDate', 'desc'));
  }, [firestore]);
  const { data: galleryItems, isLoading: isLoadingGallery } = useCollection(galleryQuery);

  // Testimonials
  const testimonialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'allTestimonials'), orderBy('date', 'desc'));
  }, [firestore]);
  const { data: liveTestimonials, isLoading: isLoadingTestimonials } = useCollection(testimonialsQuery);

  // Google Photos Albums Config
  const googleAlbumsConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'googleAlbums');
  }, [firestore]);
  const { data: googleAlbumsDoc, isLoading: isLoadingGoogleAlbums } = useDoc(googleAlbumsConfigRef);

  // Hero Carousel Config
  const heroCarouselConfigRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'appConfig', 'heroCarousel');
  }, [firestore]);
  const { data: heroCarouselDoc, isLoading: isLoadingHeroCarousel } = useDoc(heroCarouselConfigRef);

  return {
    auth,
    firestore,
    storage,
    testimonialsConfig,
    googleAlbumsDoc,
    isLoadingGoogleAlbums,
    heroCarouselDoc,
    isLoadingHeroCarousel,
    requests,
    isLoadingReqs,
    galleryItems,
    isLoadingGallery,
    liveTestimonials,
    isLoadingTestimonials,
  };
}
