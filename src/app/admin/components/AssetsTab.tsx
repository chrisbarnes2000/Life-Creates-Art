import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Plus } from 'lucide-react';

export function AssetsTab({ handleAssetUpload, uploading, heroCarouselDoc, isLoadingHeroCarousel, handleSaveHeroCarousel }: any) {
  const [heroCarousel, setHeroCarousel] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (heroCarouselDoc?.slides) {
       setHeroCarousel(heroCarouselDoc.slides);
    } else if (!isLoadingHeroCarousel) {
       setHeroCarousel([
           { url: '', credit: 'Photography and Art by Tina Croft Barnes' }
       ]);
    }
  }, [heroCarouselDoc, isLoadingHeroCarousel]);

  return (
    <div className="space-y-8">
      <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-2xl border-t-8 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-blue-950 dark:text-blue-50 font-black text-3xl tracking-tight">Dynamic Hero Carousel</CardTitle>
          <CardDescription className="text-blue-800 dark:text-blue-200 font-bold uppercase tracking-widest text-[10px]">Manage the rotating hero images displayed on the homepage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingHeroCarousel ? (
             <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
          ) : (
            <>
              {heroCarousel.map((slide, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 bg-background/80 rounded-xl border border-blue-200 shadow-sm">
                  <Input value={slide.url} onChange={(e) => {
                     const newA = [...heroCarousel]; newA[index].url = e.target.value; setHeroCarousel(newA);
                  }} placeholder="Image URL (Storage or External)" className="flex-1 bg-background" />
                  <Input value={slide.credit} onChange={(e) => {
                     const newA = [...heroCarousel]; newA[index].credit = e.target.value; setHeroCarousel(newA);
                  }} placeholder="Credit / Caption" className="flex-[2] bg-background" />
                  <Button variant="ghost" size="icon" className="text-destructive shrink-0 hover:bg-destructive/10" onClick={() => {
                      const newA = heroCarousel.filter((_, i) => i !== index); setHeroCarousel(newA);
                  }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-blue-200/50">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 font-bold" onClick={() => setHeroCarousel([...heroCarousel, { url: '', credit: '' }])}>
                   <Plus className="mr-2 h-4 w-4"/> Add Hero Slide
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold px-8" onClick={() => handleSaveHeroCarousel(heroCarousel)}>Save Carousel Updates</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
