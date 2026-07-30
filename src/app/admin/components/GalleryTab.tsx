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
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 font-bold" onClick={() => setGoogleAlbumConfig([...googleAlbumConfig, { id: `gphoto-${Date.now()}`, name: '', url: '', memoryUrl: '', coverImage: '' }])}>
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

      {/* Unified Custom Gallery Hub */}
      <Collapsible open={isMainArchiveOpen} onOpenChange={setIsMainArchiveOpen}>
        <Card className="bg-background dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 shadow-2xl border-t-8 border-t-primary overflow-hidden">
          <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-primary font-black text-3xl tracking-tight">Main Project Archive</CardTitle>
              <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Photo gallery archives, artwork storage, and media uploads.</CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                {isMainArchiveOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="p-0 text-black dark:text-white">
              <Tabs defaultValue="manage" className="w-full">
            <TabsList className="w-full justify-start rounded-none bg-primary/10 dark:bg-primary/20 p-0 h-16 border-b-2 border-primary/20 mb-0">
              <TabsTrigger value="upload" className="rounded-none px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs border-r border-primary/20 uppercase tracking-widest transition-all">
                <Upload className="h-5 w-5 mr-3" /> Upload Center
              </TabsTrigger>
              <TabsTrigger value="manage" className="rounded-none px-10 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-xs border-r border-primary/20 uppercase tracking-widest transition-all">
                <Database className="h-5 w-5 mr-3" /> System Explorer
              </TabsTrigger>
            </TabsList>

            <div className="p-8">
              {/* Upload Tab */}
              <TabsContent value="upload" className="mt-0 space-y-8 animate-in fade-in slide-in-from-top-2 duration-400">
                {/* Brand & Site Media Elements */}
                <Collapsible open={isCoreAssetsOpen} onOpenChange={setIsCoreAssetsOpen} className="bg-primary/5 dark:bg-black/20 p-8 rounded-3xl border-2 border-primary/10 shadow-inner">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-primary uppercase tracking-tighter flex items-center gap-2">
                        <FileImage className="h-5 w-5" />
                        Brand & Site Media Elements
                      </h4>
                      <p className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.1em]">Manage logos, portraits, and key site design accents</p>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10">
                        {isCoreAssetsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'site-logo', label: 'Brand Logo' },
                        { id: 'profile-portrait', label: 'Artist Portrait' },
                        { id: 'home-accent', label: 'About Accent Image' }
                      ].map((asset) => (
                        <div key={asset.id} className="relative p-4 rounded-2xl border border-primary/20 bg-background dark:bg-black/20 shadow-sm overflow-hidden group">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-[10px] font-black text-primary uppercase">{asset.label}</Label>
                            {uploading === asset.id && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                          </div>
                          <Input
                            type="file"
                            accept="image/*,.heic,.heif"
                            onChange={(e) => handleAssetUpload(asset.id, e.target.files?.[0] || null)}
                            disabled={!!uploading}
                            className="h-8 text-[9px] bg-transparent border-primary/10 dark:border-primary/80"
                          />
                          <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="outline" className="text-[7px] font-bold border-primary/20 text-primary uppercase">ASSET_ID: {asset.id}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-primary/10 pb-6 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-tighter">
                       <div className="bg-primary p-2 rounded-xl shadow-lg">
                         <ImageIcon className="h-6 w-6 text-primary-foreground" />
                       </div>
                       Batch Project Deployment
                    </h3>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-14">Archive high-resolution captures for the public gallery</p>
                  </div>
                </div>

                <form onSubmit={handleAddGalleryItems} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-4 p-6 bg-primary/5 dark:bg-black/20 rounded-xl border border-primary/10 shadow-inner">
                      <Label className="font-extrabold text-primary flex items-center gap-2">
                        <Plus className="h-4 w-4" /> 1. Select High-Res Photos
                      </Label>
                      <Input
                        id="gallery-file-input"
                        type="file"
                        accept="image/*,.heic,.heif"
                        multiple
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                        className="cursor-pointer bg-transparent border-primary/20 h-12"
                      />
                      {selectedFiles.length > 0 && (
                        <Badge variant="default" className="bg-primary">
                          {selectedFiles.length} assets staged
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-4 p-6 bg-primary/5 dark:bg-black/20 rounded-xl border border-primary/10 shadow-inner">
                      <Label className="font-extrabold text-primary flex items-center gap-2">
                        <Edit2 className="h-4 w-4" /> 2. Archive Metadata
                      </Label>
                      <div className="space-y-3">
                        <Input
                          placeholder="Project Headline (e.g., Cascades Loft)"
                          value={newGalleryDescription}
                          onChange={(e) => setNewGalleryDescription(e.target.value)}
                          className="bg-transparent border-primary/20"
                        />
                        <Input
                          placeholder="Supplemental Hover Context"
                          value={newGalleryHoverText}
                          onChange={(e) => setNewGalleryHoverText(e.target.value)}
                          className="bg-transparent border-primary/20 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-6 bg-primary/5 dark:bg-black/20 rounded-xl border border-primary/10 shadow-inner">
                      <Label className="font-extrabold text-primary flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" /> 3. Architectural Grouping
                      </Label>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 bg-transparent p-3 rounded-lg border border-primary/10">
                          <Switch
                            id="album-mode-tab"
                            checked={groupAsAlbum}
                            onCheckedChange={setGroupAsAlbum}
                            className="data-[state=checked]:bg-primary"
                          />
                          <Label htmlFor="album-mode-tab" className="font-bold cursor-pointer text-xs">
                            Active Album Archive
                          </Label>
                        </div>
                        {groupAsAlbum && (
                          <div className="space-y-3 animate-in zoom-in-95 duration-200">
                            <Label className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Album Name</Label>
                            <Input
                              placeholder="e.g. Modern Barns"
                              value={albumName}
                              onChange={(e) => setAlbumName(e.target.value)}
                              className="bg-transparent border-primary/40 h-10 font-bold"
                            />
                            
                            {/* SAM (Smart Album Manager) for Upload */}
                            {Array.from(new Set(galleryItems?.map((item: any) => item.album).filter(Boolean))).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-[9px] font-black text-primary/40 uppercase w-full">Quick Pick:</span>
                                {Array.from(new Set(galleryItems.map((item: any) => item.album).filter(Boolean)))
                                  .map((albName: any) => (
                                    <Badge 
                                      key={albName} 
                                      variant="outline" 
                                      className={`cursor-pointer transition-all text-[9px] font-bold ${albumName === albName ? 'bg-primary text-primary-foreground border-primary scale-105' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                                      onClick={() => setAlbumName(albName)}
                                    >
                                      {albName}
                                    </Badge>
                                  ))
                                }
                              </div>
                            )}
                            <Label className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Sub-Album Name (Optional)</Label>
                            <Input
                              placeholder="e.g. Interior Designs"
                              value={subAlbumName}
                              onChange={(e) => setSubAlbumName(e.target.value)}
                              className="bg-transparent border-primary/40 h-10 font-bold"
                            />
                            
                            {/* SMART SUB-ALBUM SUGGESTIONS */}
                            {albumName && Array.from(new Set(galleryItems?.filter((i: any) => i.album === albumName).map((item: any) => item.subAlbum).filter(Boolean))).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-[9px] font-black text-primary/40 uppercase w-full">Quick Pick Sub:</span>
                                {Array.from(new Set(galleryItems.filter((i: any) => i.album === albumName).map((item: any) => item.subAlbum).filter(Boolean)))
                                  .map((sub: any) => (
                                    <Badge 
                                      key={sub} 
                                      variant="outline" 
                                      className={`cursor-pointer transition-all text-[9px] font-bold ${subAlbumName === sub ? 'bg-emerald-600 text-white border-emerald-600 scale-105' : 'border-primary/20 text-primary hover:bg-emerald-50'}`}
                                      onClick={() => setSubAlbumName(sub)}
                                    >
                                      {sub}
                                    </Badge>
                                  ))
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-white shadow-xl text-xl font-black rounded-2xl transition-all active:scale-[0.98]" disabled={!!uploading || selectedFiles.length === 0 || !newGalleryDescription}>
                    {uploading === 'gallery' ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        DEPLOYING TO CLOUD...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-3 h-6 w-6" />
                        INITIATE BATCH UPLOAD
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Archive Explorer Tab Content */}
              <TabsContent value="manage" className="mt-0 animate-in fade-in slide-in-from-top-2 duration-400">
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-primary/10 pb-6 gap-4">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-primary flex items-center gap-3 uppercase tracking-tighter">
                         <div className="bg-primary p-2 rounded-xl shadow-lg">
                           <Database className="h-6 w-6 text-primary-foreground" />
                         </div>
                         Production Archive Explorer
                      </h3>
                      <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-14">Central Repository & Metadata Synchronization</p>
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
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
</div>
  );
}
