import * as React from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  Image as ImageIcon,
  Upload,
  Trash2,
  FileImage,
  FolderOpen,
  Database,
  Plus,
  Edit2,
  Check,
  X,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StorageManager } from '@/components/storage-manager';

export function GalleryTab({
  galleryItems,
  isLoadingGallery,
  googleAlbumsDoc,
  isLoadingGoogleAlbums,
  handleSaveGoogleAlbums,
  handleAddGalleryItems,
  handleAssetUpload,
  selectedFiles,
  setSelectedFiles,
  newGalleryDescription,
  setNewGalleryDescription,
  newGalleryHoverText,
  setNewGalleryHoverText,
  groupAsAlbum,
  setGroupAsAlbum,
  albumName,
  setAlbumName,
  subAlbumName,
  setSubAlbumName,
  uploading
}: any) {
  const [googleAlbumConfig, setGoogleAlbumConfig] = React.useState<any[]>([]);
  const [isGooglePhotosOpen, setIsGooglePhotosOpen] = React.useState(true);
  const [isMainArchiveOpen, setIsMainArchiveOpen] = React.useState(true);
  const [isCoreAssetsOpen, setIsCoreAssetsOpen] = React.useState(true);

  React.useEffect(() => {
    if (googleAlbumsDoc?.albums) {
       setGoogleAlbumConfig(googleAlbumsDoc.albums);
    } else if (!isLoadingGoogleAlbums) {
       setGoogleAlbumConfig([]);
    }
  }, [googleAlbumsDoc, isLoadingGoogleAlbums]);

  return (
    <div className="space-y-8 pb-12">
      {/* Google Photos Section */}
      <Collapsible open={isGooglePhotosOpen} onOpenChange={setIsGooglePhotosOpen}>
        <Card className="bg-background dark:bg-primary/10 border-primary/30 dark:border-primary/50 shadow-xl border-t-8 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-primary font-black text-3xl tracking-tight">Google Photos Integration</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Link public Google Photos albums. 
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                {isGooglePhotosOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 p-2 rounded border border-primary/20 text-xs mb-4">
                <strong>Pro-tip:</strong> To set a specific cover photo, right-click any image in Google Photos and select "Copy image address".
              </div>
              {isLoadingGoogleAlbums ? (
                <div className="flex justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
              ) : (
                <>
                  {googleAlbumConfig.map((album, index) => (
                <div key={album.id || index} className="flex flex-col lg:flex-row gap-3 items-start lg:items-center p-4 bg-background/80 rounded-xl border border-primary/20 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow w-full">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-primary">Display Name</Label>
                      <Input value={album.name} onChange={(e) => {
                         const newA = [...googleAlbumConfig]; newA[index].name = e.target.value; setGoogleAlbumConfig(newA);
                      }} placeholder="Album Name" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-primary">Album Share Link</Label>
                      <Input value={album.url} onChange={(e) => {
                         const newA = [...googleAlbumConfig]; newA[index].url = e.target.value; setGoogleAlbumConfig(newA);
                      }} placeholder="Google Photos URL" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-primary">Preview Memory Link (Optional)</Label>
                      <Input value={album.memoryUrl || ''} onChange={(e) => {
                         const newA = [...googleAlbumConfig]; newA[index].memoryUrl = e.target.value; setGoogleAlbumConfig(newA);
                      }} placeholder="Google Photos Memory URL" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-primary">Cover Image URL (Optional)</Label>
                      <Input value={album.coverImage || ''} onChange={(e) => {
                         const newA = [...googleAlbumConfig]; newA[index].coverImage = e.target.value; setGoogleAlbumConfig(newA);
                      }} placeholder="Direct image link" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-primary">Default Print Price (Optional)</Label>
                      <Input value={album.price || ''} onChange={(e) => {
                         const newA = [...googleAlbumConfig]; newA[index].price = e.target.value; setGoogleAlbumConfig(newA);
                      }} placeholder="e.g. 150" className="bg-background" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end lg:self-center bg-primary/10 dark:bg-black p-2 rounded-lg border border-primary/20 shadow-inner">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`hide-album-${index}`} className="text-[10px] font-black text-primary">PUBLISHED</Label>
                      <Switch 
                        id={`hide-album-${index}`}
                        checked={!album.hidden} 
                        onCheckedChange={(v) => {
                          const newA = [...googleAlbumConfig]; newA[index].hidden = !v; setGoogleAlbumConfig(newA);
                        }}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                        const newA = googleAlbumConfig.filter((_, i) => i !== index); setGoogleAlbumConfig(newA);
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-emerald-200/50">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 font-bold" onClick={() => setGoogleAlbumConfig([...googleAlbumConfig, { id: `gphoto-${Date.now()}`, name: '', url: '', memoryUrl: '', coverImage: '', price: '' }])}>
                   <Plus className="mr-2 h-4 w-4"/> New Album Connection
                </Button>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white shadow-md px-8 font-bold" onClick={() => handleSaveGoogleAlbums(googleAlbumConfig)}>Update Integration</Button>
              </div>
            </>
          )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Unified Custom Gallery Hub - System Explorer */}
      <Collapsible open={isMainArchiveOpen} onOpenChange={setIsMainArchiveOpen}>
        <Card className="bg-background dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-2xl border-t-8 border-t-primary overflow-hidden">
          <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-primary font-black text-3xl tracking-tight">Main Project Archive & System Explorer</CardTitle>
              <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Photo gallery archives and artwork storage metadata management (Upload Center disabled).</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                {isMainArchiveOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-8 text-black dark:text-white">
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-primary/10 pb-6 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-tighter">
                       <div className="bg-primary p-2 rounded-xl shadow-lg">
                         <Database className="h-6 w-6 text-primary-foreground" />
                       </div>
                       Production Archive Explorer
                    </h3>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-14">Central Repository & Metadata Synchronization (Note: Image upload center removed)</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 bg-primary/5 dark:bg-black/20 p-3 rounded-2xl border border-primary/10 shadow-inner">
                    <div className="flex items-center gap-2 pl-2 border-l border-primary/20 ml-1">
                      <span className="text-[10px] font-black text-primary/40 uppercase">Archive Health:</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="border-primary/30 text-primary font-bold h-7 px-3 rounded-lg text-[9px] uppercase tracking-tighter">
                          Verified Sync
                        </Badge>
                        <Badge className="bg-primary font-black px-3 h-7 rounded-lg shadow-md text-primary-foreground">
                          {galleryItems?.length || 0} Assets
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background dark:bg-black/20 rounded-3xl p-8 border-2 border-primary/10 shadow-xl overflow-hidden">
                  <StorageManager 
                    albumSuggestions={Array.from(new Set(galleryItems?.map((item: any) => item.album).filter(Boolean)))} 
                    galleryItems={galleryItems || []}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
</div>
  );
}
