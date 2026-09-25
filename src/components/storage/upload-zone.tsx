'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, X, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage, convertHeicIfNecessary, getFriendlyDisplayName } from './storage-utils';
import { useFirebase } from '@/firebase';

export function UploadZone({
    albumSuggestions = [],
    onUploadComplete,
    layout = 'stack',
}: {
    albumSuggestions?: string[];
    onUploadComplete: () => void;
    layout?: 'grid' | 'stack';
}) {
    const { firestore } = useFirebase();
    const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);
    const [displayNames, setDisplayNames] = React.useState<Record<string, string>>({});
    const [uploadPath, setUploadPath] = React.useState('gallery/');
    const [uploadPrice, setUploadPrice] = React.useState('');
    const [autoAdoptUpload, setAutoAdoptUpload] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);
    const [dragActive, setDragActive] = React.useState(false);
    const [fetchedAlbums, setFetchedAlbums] = React.useState<string[]>(albumSuggestions);
    const { toast } = useToast();

    // Fetch dynamic album list if albumSuggestions is empty and we have firestore
    React.useEffect(() => {
        if (albumSuggestions.length > 0) {
            setFetchedAlbums(albumSuggestions);
            return;
        }
        if (!firestore) return;

        const fetchAlbums = async () => {
            try {
                const { getDocs, collection } = await import('firebase/firestore');
                const querySnapshot = await getDocs(collection(firestore, 'gallery'));
                const albums = new Set<string>();
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.album) {
                        albums.add(data.album);
                    }
                });
                setFetchedAlbums(Array.from(albums).filter(Boolean));
            } catch (err) {
                console.error('Failed to fetch album suggestions:', err);
            }
        };
        fetchAlbums();
    }, [firestore, albumSuggestions]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setUploadFiles(prev => [...prev, ...droppedFiles]);
            setDisplayNames(prev => {
                const next = { ...prev };
                droppedFiles.forEach(file => {
                    if (!next[file.name]) {
                        next[file.name] = getFriendlyDisplayName(file.name);
                    }
                });
                return next;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = Array.from(e.target.files);
            setUploadFiles(prev => [...prev, ...selected]);
            setDisplayNames(prev => {
                const next = { ...prev };
                selected.forEach(file => {
                    if (!next[file.name]) {
                        next[file.name] = getFriendlyDisplayName(file.name);
                    }
                });
                return next;
            });
        }
    };

    const removeQueuedFile = (index: number) => {
        const fileToRemove = uploadFiles[index];
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
        if (fileToRemove) {
            setDisplayNames(prev => {
                const next = { ...prev };
                delete next[fileToRemove.name];
                return next;
            });
        }
    };

    const handleUpload = async () => {
        if (uploadFiles.length === 0) return;
        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < uploadFiles.length; i++) {
                let file = uploadFiles[i];

                // Convert Apple HEIC/HEIF to JPEG client-side
                try {
                    file = await convertHeicIfNecessary(file);
                } catch (heicErr) {
                    console.warn('Failed to convert HEIC/HEIF file:', heicErr);
                }

                // Client-side compression for images > 1MB
                if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
                    try {
                        file = await compressImage(file);
                    } catch (compressErr) {
                        console.warn('Failed client-side compression, uploading original:', compressErr);
                    }
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('path', uploadPath);
                formData.append('autoAdopt', autoAdoptUpload ? 'true' : 'false');

                const customName = displayNames[file.name] || getFriendlyDisplayName(file.name);
                formData.append('description', customName);

                if (uploadPrice.trim()) {
                    formData.append('price', uploadPrice.trim());
                }

                try {
                    const response = await fetch('/api/storage/upload', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        console.error(`Upload failed for ${file.name}:`, response.statusText);
                        failCount++;
                    }
                } catch (fetchErr) {
                    console.error(`Network or fetch error during upload of ${file.name}:`, fetchErr);
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: 'Upload Successful',
                    description: `Successfully uploaded ${successCount} file(s) ${autoAdoptUpload ? 'and registered them in gallery' : ''}.`
                });
                setUploadFiles([]);
                setDisplayNames({});
                onUploadComplete();
            }

            if (failCount > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Upload Warnings',
                    description: `Failed to upload ${failCount} file(s).`
                });
            }
        } catch (error) {
            console.error('Error during batch upload:', error);
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: 'An unexpected error occurred during file upload.'
            });
        } finally {
            setUploading(false);
        }
    };

    // UI elements
    const settingsPanel = (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-primary tracking-wide">Folder / Album Path</Label>
                <Input
                    value={uploadPath}
                    onChange={(e) => setUploadPath(e.target.value)}
                    placeholder="e.g. gallery/Barns/"
                    className="h-10 font-bold text-xs bg-background border-primary/20"
                />
            </div>
            <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase text-primary tracking-wide">Print / Artwork Price ($ USD)</Label>
                <Input
                    value={uploadPrice}
                    onChange={(e) => setUploadPrice(e.target.value)}
                    placeholder="e.g. 150 (Optional)"
                    className="h-10 font-bold text-xs bg-background border-primary/20"
                    type="number"
                />
            </div>
            {fetchedAlbums.length > 0 && (
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-primary/70 tracking-wider">Existing Albums:</Label>
                    <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className={`cursor-pointer transition-all ${uploadPath === 'gallery/' ? 'bg-primary text-primary-foreground shadow-sm' : ''}`} onClick={() => setUploadPath('gallery/')}>Main</Badge>
                        {fetchedAlbums.map(album => (
                            <Badge key={album} variant="outline" className={`cursor-pointer transition-all ${uploadPath === `gallery/${album}/` ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-primary/20 hover:bg-primary/10 text-primary'}`} onClick={() => setUploadPath(`gallery/${album}/`)}>{album}</Badge>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                <Checkbox id="auto-adopt-upload" checked={autoAdoptUpload} onCheckedChange={(checked) => setAutoAdoptUpload(!!checked)} className="border-primary/40 data-[state=checked]:bg-primary" />
                <Label htmlFor="auto-adopt-upload" className="text-[10px] font-black uppercase tracking-wider text-primary cursor-pointer select-none">Publish Directly to Public Gallery</Label>
            </div>
        </div>
    );

    const mainPanel = (
        <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${dragActive ? 'border-primary bg-primary/10' : 'border-primary/20 bg-primary/5'}`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
            >
                <input id="file-upload-input" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20 text-primary">
                        <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider text-primary">Drag & Drop your images here</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Or click to browse files</p>
                </div>
            </div>

            {/* Upload Queue */}
            {uploadFiles.length > 0 && (
                <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                        <span className="text-[10px] font-black uppercase text-primary">Queue ({uploadFiles.length})</span>
                        <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black text-destructive" onClick={() => { setUploadFiles([]); setDisplayNames({}); }}>Clear Queue</Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {uploadFiles.map((file, idx) => (
                            <div key={idx} className="flex flex-col gap-2 bg-background p-3 rounded-lg border border-primary/10 text-xs shadow-sm animate-in fade-in zoom-in duration-150">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2 truncate">
                                        <ImageIcon className="h-4 w-4 text-primary/40" />
                                        <span className="truncate font-bold text-[11px] text-primary">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeQueuedFile(idx)}><X className="h-3.5 w-3.5" /></Button>
                                </div>
                                <Input value={displayNames[file.name] || ''} onChange={(e) => setDisplayNames(prev => ({ ...prev, [file.name]: e.target.value }))} placeholder="Title" className="h-8 text-[11px] border-primary/20" />
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleUpload} disabled={uploading} className="w-full h-9 font-black uppercase text-xs">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        {uploading ? 'Uploading...' : `Upload (${uploadFiles.length})`}
                    </Button>
                </div>
            )}
        </div>
    );

    if (layout === 'grid') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    {settingsPanel}
                </div>
                <div className="lg:col-span-2">
                    {mainPanel}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {settingsPanel}
            {mainPanel}
        </div>
    );
}
