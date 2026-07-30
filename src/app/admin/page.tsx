'use client';

import * as React from 'react';
import { useAdminData } from './hooks/useAdminData';
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { 
  doc, 
  addDoc, 
  setDoc, 
  serverTimestamp, 
  collection, 
  writeBatch 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Shield, Inbox, Image as ImageIcon, MessageSquare, Settings as SettingsIcon, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { syncAdminClaims } from '@/app/actions';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

// Helper to extract storage path from Firebase download URL
function getPathFromUrl(url: string) {
  if (!url || !url.includes('/o/')) return null;
  try {
    const pathPart = url.split('/o/')[1].split('?')[0];
    return decodeURIComponent(pathPart);
  } catch (e) {
    return null;
  }
}

// Helper to move file in storage using server-side API
async function moveStorageFile(storage: any, oldPath: string, newPath: string) {
  if (!oldPath || !newPath || oldPath === newPath) return null;
  try {
    const response = await fetch('/api/storage', {
      method: 'POST',
      body: JSON.stringify({ oldPath, newPath }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error('Server-side move failed:', data.error);
      throw new Error(data.error || 'Failed to move file');
    }

    // Get fresh download URL for the new path
    const newRef = ref(storage, newPath);
    return await getDownloadURL(newRef);
  } catch (e: any) {
    console.error('Error moving storage file:', e);
    throw e;
  }
}

import { InquiriesTab } from './components/InquiriesTab';
import { AssetsTab } from './components/AssetsTab';
import { GalleryTab } from './components/GalleryTab';
import { TestimonialsTab } from './components/TestimonialsTab';
import { SettingsTab } from './components/SettingsTab';

export default function AdminPage() {
  const { firestore, storage, auth, testimonialsConfig, googleAlbumsDoc, isLoadingGoogleAlbums, heroCarouselDoc, isLoadingHeroCarousel, requests, isLoadingReqs, galleryItems, isLoadingGallery, liveTestimonials, isLoadingTestimonials } = useAdminData();
  const { toast } = useToast();

  const [isSyncingAdmin, setIsSyncingAdmin] = React.useState(false);

  // Auto-sync admin claims on mount if user is logged in
  React.useEffect(() => {
    const sync = async () => {
      if (auth?.currentUser?.uid && auth.currentUser.email) {
        setIsSyncingAdmin(true);
        try {
          const result = await syncAdminClaims(auth.currentUser.uid, auth.currentUser.email);
          if (result.success) {
            // Force token refresh to pick up new claims
            await auth.currentUser.getIdToken(true);
          }
        } catch (e) {
          console.error('Admin sync failed:', e);
        } finally {
          setIsSyncingAdmin(false);
        }
      }
    };
    sync();
  }, [auth?.currentUser]);

  const [uploading, setUploading] = React.useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [newGalleryDescription, setNewGalleryDescription] = React.useState('');
  const [newGalleryHoverText, setNewGalleryHoverText] = React.useState('');
  const [groupAsAlbum, setGroupAsAlbum] = React.useState(false);
  const [albumName, setAlbumName] = React.useState('');
  const [subAlbumName, setSubAlbumName] = React.useState('');

  const [config, setConfig] = React.useState({
    theme: 'dark-green',
    limits: { minWidth: 8, minLength: 8, maxWidth: 12, maxLength: 20 },
    watermarkEnabled: false,
    watermarkText: '© Tina Barnes',
    pricing: {
      shedBase: 25, doorSingle: 200, doorDouble: 350, roofGable: 1.0, roofGambrel: 1.2,
      windowPrice: 150, ventPrice: 75, gutterPrice: 250, paintPrice: 500,
      rampPrice: 250, skirtPrice: 400,
      domeBase: 50, freq2v: 1.0, freq3v: 1.2, freq4v: 1.5, coverVinyl: 1.0, coverPoly: 1.8
    }
  });

  React.useEffect(() => {
    const stored = localStorage.getItem('minibarn_master_config');
    if (stored) setConfig(JSON.parse(stored));
  }, []);

  const handleSaveSettings = async () => {
    localStorage.setItem('minibarn_master_config', JSON.stringify(config));
    
    if (firestore) {
      await setDoc(doc(firestore, 'appConfig', 'siteSettings'), { ...config, lastUpdated: serverTimestamp() }, { merge: true });
    }
    
    toast({ title: 'Settings Saved', description: 'Pricing, size limits, and watermark settings updated.' });
  };

  const handleToggleTestimonials = (enabled: boolean) => {
    if (!firestore) return;
    setDoc(doc(firestore, 'appConfig', 'testimonials'), { enabled, lastUpdated: serverTimestamp() }, { merge: true });
    toast({ title: enabled ? 'Testimonials Enabled' : 'Testimonials Disabled' });
  };

  const handleUpdateTestimonial = (id: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'allTestimonials', id), { status });
    toast({ title: `Testimonial ${status}` });
  };

  const handleSetTestimonialCategory = (id: string, category: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'allTestimonials', id), { category });
    toast({ title: 'Category updated' });
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'allTestimonials', id));
    toast({ title: 'Testimonial removed' });
  };

  const handleDeleteAllInquiries = async () => {
    if (!firestore || !requests) return;
    
    try {
      const batch = writeBatch(firestore);
      
      requests.forEach(req => {
        // Delete from global collection
        const globalRef = doc(firestore, 'allConsultationRequests', req.id);
        batch.delete(globalRef);
        
        // Delete from user's subcollection if customerId exists
        if (req.customerId) {
          const userRef = doc(firestore, `customers/${req.customerId}/consultationRequests`, req.id);
          batch.delete(userRef);
        }
      });
      
      await batch.commit();
      toast({ title: 'Success', description: 'All inquiries have been cleared.' });
    } catch (e: any) {
      console.error('Clear All failed:', e);
      toast({ 
        variant: 'destructive', 
        title: 'Reset Failed', 
        description: e.message || 'Operation failed due to permission or network error.' 
      });
    }
  };

  const handleDeleteInquiry = async (id: string, customerId?: string) => {
    if (!firestore) return;
    
    try {
      const batch = writeBatch(firestore);
      batch.delete(doc(firestore, 'allConsultationRequests', id));
      if (customerId) {
        batch.delete(doc(firestore, `customers/${customerId}/consultationRequests`, id));
      }
      await batch.commit();
      toast({ title: 'Success', description: 'Inquiry has been deleted.' });
    } catch (e: any) {
      console.error('Delete inquiry failed:', e);
      toast({ 
        variant: 'destructive', 
        title: 'Delete Failed', 
        description: e.message || 'Operation failed due to permission or network error.' 
      });
    }
  };

  const handleMergeInquiries = async (sourceId: string, destId: string) => {
    if (!firestore || !requests) return;
    
    const source = requests.find((r: any) => r.id === sourceId);
    const dest = requests.find((r: any) => r.id === destId);
    
    if (!source || !dest) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected inquiries not found.' });
      return;
    }
    
    try {
      const batch = writeBatch(firestore);
      
      // Combine configuration details and notes
      const mergedSummary = dest.configSummary 
        ? (source.configSummary && source.configSummary !== dest.configSummary 
            ? `${dest.configSummary} & ${source.configSummary}` 
            : dest.configSummary)
        : source.configSummary;
        
      let mergedNotes = dest.notes || '';
      if (source.notes) {
        mergedNotes = mergedNotes 
          ? `${mergedNotes}\n\n[Merged notes from previous inquiry]: ${source.notes}`
          : source.notes;
      }
      
      const mergedData = {
        configSummary: mergedSummary || '',
        notes: mergedNotes || '',
        phone: dest.phone || source.phone || '',
        status: dest.status || source.status || 'pending',
        mergedFromId: sourceId,
        lastUpdated: serverTimestamp()
      };
      
      // Update destination inquiry
      const destGlobalRef = doc(firestore, 'allConsultationRequests', destId);
      batch.update(destGlobalRef, mergedData);
      if (dest.customerId) {
        const destUserRef = doc(firestore, `customers/${dest.customerId}/consultationRequests`, destId);
        batch.update(destUserRef, mergedData);
      }
      
      // Delete source inquiry
      const sourceGlobalRef = doc(firestore, 'allConsultationRequests', sourceId);
      batch.delete(sourceGlobalRef);
      if (source.customerId) {
        const sourceUserRef = doc(firestore, `customers/${source.customerId}/consultationRequests`, sourceId);
        batch.delete(sourceUserRef);
      }
      
      await batch.commit();
      toast({ title: 'Inquiries Merged', description: `Successfully merged details of ${source.name} into destination inquiry.` });
    } catch (e: any) {
      console.error('Merge inquiries failed:', e);
      toast({ 
        variant: 'destructive', 
        title: 'Merge Failed', 
        description: e.message || 'Operation failed due to permission or network error.' 
      });
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!firestore || !storage) return;
    const item = galleryItems?.find((i: any) => i.id === id);
    if (item) {
      const currentPath = item.storagePath || getPathFromUrl(item.imageUrl);
      if (currentPath) {
        const fileName = (currentPath.split('/').pop() || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '_');
        // Move to specialized trash directory
        try {
          await moveStorageFile(storage, currentPath, `archive/trash/${Date.now()}_${fileName}`);
        } catch (e) {
          console.warn('Failed to move to trash, deleting Firestore record anyway:', e);
        }
      }
    }
    deleteDocumentNonBlocking(doc(firestore, 'gallery', id));
    toast({ title: 'Item Archived', description: 'Photo removed from live gallery & moved to storage/trash.' });
  };

  const handleToggleGalleryItemVisibility = async (id: string, hidden: boolean) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'gallery', id), { hidden });
    toast({ title: hidden ? 'Item hidden' : 'Item visible' });
  };

  const handleUpdateGalleryItem = async (id: string, data: any) => {
    if (!firestore || !storage) return;
    const item = galleryItems?.find((i: any) => i.id === id);
    if (!item) return;

    let finalData = { ...data };
    const oldAlbum = (item.album || '').trim();
    const newAlbum = (data.album || '').trim();

    // If album changed, move the file in storage to match the new directory structure
    if (oldAlbum !== newAlbum) {
      const currentPath = item.storagePath || getPathFromUrl(item.imageUrl);
      if (currentPath) {
        const fileNameParts = currentPath.split('/');
        const fileName = fileNameParts[fileNameParts.length - 1];
        const albumPrefix = newAlbum ? `${newAlbum}/` : '';
        const newPath = `gallery/${albumPrefix}${fileName}`;
        
        try {
          const newUrl = await moveStorageFile(storage, currentPath, newPath);
          if (newUrl) {
            finalData.imageUrl = newUrl;
            finalData.storagePath = newPath;
            toast({ title: 'Syncing Storage', description: `Moving file to ${newPath}` });
          }
        } catch (e: any) {
          toast({ 
            variant: 'destructive', 
            title: 'Storage Sync Error', 
            description: e.message || 'Metadata updated, but physical storage move failed. The system might be out of sync.' 
          });
          // We continue updating Firestore metadata anyway if they wanted to, 
          // or we could block it. Let's block it if move fails to ensure consistency.
          return;
        }
      }
    }

    updateDocumentNonBlocking(doc(firestore, 'gallery', id), { 
      ...finalData, 
      lastUpdated: serverTimestamp() 
    });
    toast({ title: 'Changes Saved', description: 'Metadata successfully synchronized.' });
  };

  const handleAddGalleryItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !newGalleryDescription || !storage || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Select files and description.' });
      return;
    }
    if (groupAsAlbum && !albumName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Provide album name.' });
      return;
    }
    setUploading('gallery');
    let successCount = 0;
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const albumPrefix = groupAsAlbum ? `${albumName.trim()}/` : '';
        const storagePath = `gallery/${albumPrefix}${fileName}`;
        
        const storageRef = ref(storage, storagePath);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(uploadResult.ref);
        
        await addDoc(collection(firestore, 'gallery'), {
          imageUrl: downloadUrl,
          storagePath: storagePath,
          description: selectedFiles.length > 1 && !groupAsAlbum ? `${newGalleryDescription} (${i + 1})` : newGalleryDescription,
          hoverText: newGalleryHoverText,
          album: groupAsAlbum ? albumName.trim() : null,
          subAlbum: groupAsAlbum ? subAlbumName.trim() || null : null,
          uploadDate: serverTimestamp()
        });
        successCount++;
      }
      toast({ title: 'Upload Successful', description: `${successCount} photo(s) added.` });
      setNewGalleryDescription('');
      setNewGalleryHoverText('');
      setAlbumName('');
      setSubAlbumName('');
      setSelectedFiles([]);
      setGroupAsAlbum(false);
      const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed' });
    } finally {
      setUploading(null);
    }
  };

  const handleAssetUpload = async (assetId: string, file: File | null) => {
    if (!file || !storage || !firestore) return;
    setUploading(assetId);
    try {
      const storageRef = ref(storage, `assets/${assetId}_${Date.now()}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      await setDoc(doc(firestore, 'appConfig', assetId), { imageUrl: downloadUrl, lastUpdated: serverTimestamp() });
      toast({ title: 'Asset Updated' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed' });
    } finally {
      setUploading(null);
    }
  };

  const handleSaveGoogleAlbums = async (albums: any[]) => {
    if (!firestore) return;
    try {
      const validAlbums = albums.filter((a: any) => a.name?.trim() || a.url?.trim());
      await setDoc(doc(firestore, 'appConfig', 'googleAlbums'), { albums: validAlbums, lastUpdated: serverTimestamp() });
      toast({ title: 'Google Albums Updated' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  const handleSaveHeroCarousel = async (slides: any[]) => {
    if (!firestore) return;
    try {
      await setDoc(doc(firestore, 'appConfig', 'heroCarousel'), { slides, lastUpdated: serverTimestamp() });
      toast({ title: 'Hero Carousel Updated' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  return (
    <div className="flex-grow bg-background py-12">
      <div className="container mx-auto max-w-6xl space-y-8 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-3xl font-bold text-primary">Master Enterprise Control</h1>
          </div>
          {isSyncingAdmin && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              Syncing permissions...
            </div>
          )}
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="flex flex-wrap h-auto w-full mb-8 gap-2 bg-primary/10 dark:bg-primary/20 p-2 rounded-xl border border-primary/20">
            <TabsTrigger className="flex-1 min-w-[120px] rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold" value="gallery"><ImageIcon className="mr-2 h-4 w-4" /> Archive & Media</TabsTrigger>
            <TabsTrigger className="flex-1 min-w-[120px] rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold" value="settings"><SettingsIcon className="mr-2 h-4 w-4" /> Configuration & Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            <div className="space-y-8">
              <AssetsTab 
                heroCarouselDoc={heroCarouselDoc} 
                isLoadingHeroCarousel={isLoadingHeroCarousel} 
                handleSaveHeroCarousel={handleSaveHeroCarousel} 
              />
              <GalleryTab
                galleryItems={galleryItems || []} isLoadingGallery={isLoadingGallery}
                googleAlbumsDoc={googleAlbumsDoc} isLoadingGoogleAlbums={isLoadingGoogleAlbums}
                handleSaveGoogleAlbums={handleSaveGoogleAlbums}
                handleUpdateGalleryItem={handleUpdateGalleryItem}
                handleAddGalleryItems={handleAddGalleryItems} 
                handleAssetUpload={handleAssetUpload}
                handleDeleteGalleryItem={handleDeleteGalleryItem}
                handleToggleGalleryItemVisibility={handleToggleGalleryItemVisibility}
                selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}
                newGalleryDescription={newGalleryDescription} setNewGalleryDescription={setNewGalleryDescription}
                newGalleryHoverText={newGalleryHoverText} setNewGalleryHoverText={setNewGalleryHoverText}
                groupAsAlbum={groupAsAlbum} setGroupAsAlbum={setGroupAsAlbum}
                albumName={albumName} setAlbumName={setAlbumName}
                subAlbumName={subAlbumName} setSubAlbumName={setSubAlbumName}
                uploading={uploading}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-12">
            <SettingsTab
              config={config} setConfig={setConfig} handleSaveSettings={handleSaveSettings}
              testimonialsConfig={testimonialsConfig} handleToggleTestimonials={handleToggleTestimonials}
            />
            
            <div className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-primary border-b pb-4">
                <Inbox className="h-6 w-6" /> Customer Operations
              </h2>
              
              <InquiriesTab 
                requests={requests || []} 
                isLoadingReqs={isLoadingReqs} 
                handleDeleteAllInquiries={handleDeleteAllInquiries}
                handleDeleteInquiry={handleDeleteInquiry}
                handleMergeInquiries={handleMergeInquiries}
              />
              
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-primary mb-6">
                  <MessageSquare className="h-6 w-6" /> Public Testimonials Management
                </h2>
                <TestimonialsTab
                  liveTestimonials={liveTestimonials || []} isLoadingTestimonials={isLoadingTestimonials}
                  handleUpdateTestimonial={handleUpdateTestimonial} handleSetTestimonialCategory={handleSetTestimonialCategory}
                  handleDeleteTestimonial={handleDeleteTestimonial}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
