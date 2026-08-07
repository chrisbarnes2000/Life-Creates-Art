'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Folder, File, Edit2, Check, X, FolderPlus, Trash2, ExternalLink, Database, RefreshCw, ShieldCheck, Link2, Eye, EyeOff, LayoutPanelLeft, FileText, ImageIcon, LayoutGrid, CheckSquare, Square, Trash, FolderArchive, ArrowRightLeft, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Session-level cache for storage listing to minimize network calls during admin session
let sessionFileCache: string[] | null = null;
let sessionBucketCache: string = '';

function compressImage(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

async function convertHeicIfNecessary(file: File): Promise<File> {
  const isHEIC = 
    file.type === 'image/heic' || 
    file.type === 'image/heif' || 
    file.name.toLowerCase().endsWith('.heic') || 
    file.name.toLowerCase().endsWith('.heif');
  
  if (!isHEIC) {
    return file;
  }

  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default;
    
    const converted = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });
    
    const blob = Array.isArray(converted) ? converted[0] : converted;
    const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    return new File([blob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    return file;
  }
}

export function StorageManager({ 
  albumSuggestions = [], 
  galleryItems = [],
  onRefresh
}: { 
  albumSuggestions?: string[],
  galleryItems?: any[],
  onRefresh?: () => void
}) {
  const [files, setFiles] = React.useState<string[]>(sessionFileCache || []);
  const [bucketName, setBucketName] = React.useState<string>(sessionBucketCache || '');
  const [loading, setLoading] = React.useState(false);
  const [processingFiles, setProcessingFiles] = React.useState<Set<string>>(new Set());
  const [editingFile, setEditingFile] = React.useState<string | null>(null);
  const [editPath, setEditPath] = React.useState('');
  
  // Metadata Edit States
  const [editingMetadata, setEditingMetadata] = React.useState<string | null>(null);
  const [metaDesc, setMetaDesc] = React.useState('');
  const [metaAlbum, setMetaAlbum] = React.useState('');
  const [metaSubAlbum, setMetaSubAlbum] = React.useState('');
  const [metaHover, setMetaHover] = React.useState('');
  const [metaPrice, setMetaPrice] = React.useState('');
  
  const [previewMode, setPreviewMode] = React.useState<'none' | 'adopted' | 'all'>('none');
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set());
  const [bulkMovePath, setBulkMovePath] = React.useState('');
  const { toast } = useToast();

  // Custom Confirmation Dialog State
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const triggerConfirm = React.useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfirmState({
      isOpen: true,
      ...options
    });
  }, []);

  // Upload States
  const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);
  const [uploadPath, setUploadPath] = React.useState('gallery/');
  const [autoAdoptUpload, setAutoAdoptUpload] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);

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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = Array.from(e.target.files);
      setUploadFiles(prev => [...prev, ...selected]);
    }
  };

  const removeQueuedFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
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

        // Client-side compression for images > 1MB to optimize upload size/speed and prevent timeouts
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
        fetchFiles(true);
        if (onRefresh) onRefresh();
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

  const existingPaths = React.useMemo(() => galleryItems.map(item => item.storagePath), [galleryItems]);

  const fetchFiles = React.useCallback(async (force = false) => {
    if (!force && sessionFileCache && sessionFileCache.length > 0) {
      setFiles(sessionFileCache);
      setBucketName(sessionBucketCache);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/storage/list');
      const data = await response.json();
      // Filter out directory markers (ends with /)
      const newFiles = (data.files || []).filter((f: string) => !f.endsWith('/'));
      const newBucket = data.bucketName || '';
      
      sessionFileCache = newFiles;
      sessionBucketCache = newBucket;
      
      setFiles(newFiles);
      setBucketName(newBucket);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to list files.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial fetch on mount
  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteFile = async (path: string, skipConfirm = false, skipStateUpdate = false) => {
    const proceed = async () => {
      setProcessingFiles(prev => new Set(prev).add(path));
      try {
        const response = await fetch('/api/storage', {
          method: 'POST',
          body: JSON.stringify({ oldPath: path, action: 'delete' }),
          headers: { 'Content-Type': 'application/json' },
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete file');
        
        if (!skipConfirm) toast({ title: 'System Updated', description: 'File permanently removed from storage.' });
        
        if (!skipStateUpdate) {
          // Update cache and state locally
          sessionFileCache = (sessionFileCache || []).filter(f => f !== path);
          setFiles([...sessionFileCache]);
          if (!skipConfirm && onRefresh) onRefresh();
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        if (!skipConfirm) toast({ variant: 'destructive', title: 'Error', description: 'Deletion sequence failed.' });
        throw error;
      } finally {
        setProcessingFiles(prev => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      }
    };

    if (skipConfirm) {
      await proceed();
    } else {
      triggerConfirm({
        title: 'Permanently Delete Asset',
        message: `Are you sure you want to permanently delete ${path}?\n\nThis action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
        onConfirm: proceed,
      });
    }
  };

  const moveFile = async (oldPath: string, newPath: string, skipConfirm = false, skipStateUpdate = false) => {
    if (!newPath || oldPath === newPath) {
      setEditingFile(null);
      return;
    }
    
    // Safety check for directory ending
    if (newPath.endsWith('/')) {
       if (!skipConfirm) toast({ variant: 'destructive', title: 'Invalid Path', description: 'Destination must include a filename, not just a folder.' });
       return;
    }

    setProcessingFiles(prev => new Set(prev).add(oldPath));
    try {
      const response = await fetch('/api/storage', {
        method: 'POST',
        body: JSON.stringify({ oldPath, newPath }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (!response.ok) {
        // If file was missing, our cache is likely stale. Force a reload.
        if (response.status === 404 && !skipConfirm) {
          fetchFiles(true);
        }
        throw new Error(data.error || 'Failed to move file');
      }
      
      if (!skipConfirm) {
        toast({ title: 'Success', description: data.message || `Moved to ${newPath}` });
        setEditingFile(null);
      }
      
      if (!skipStateUpdate) {
        // Update cache and state locally
        sessionFileCache = (sessionFileCache || []).map(f => f === oldPath ? newPath : f);
        setFiles([...sessionFileCache]);
        if (!skipConfirm && onRefresh) onRefresh();
      }
    } catch (error: any) {
      console.error('Error moving file:', error);
      if (!skipConfirm) toast({ variant: 'destructive', title: 'Action Desync', description: error.message || 'The filesystem appears out of sync.' });
      throw error;
    } finally {
      setProcessingFiles(prev => {
        const next = new Set(prev);
        next.delete(oldPath);
        return next;
      });
    }
  };

  const toggleSelect = (path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleGroupSelection = (groupFiles: string[]) => {
    const allInGroupSelected = groupFiles.every(f => selectedFiles.has(f));
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (allInGroupSelected) {
        groupFiles.forEach(f => next.delete(f));
      } else {
        groupFiles.forEach(f => next.add(f));
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const targets = Array.from(selectedFiles);
    
    const proceed = async () => {
      setSyncing(true);
      try {
        // Process in chunks of 5
        const chunks = [];
        for (let i = 0; i < targets.length; i += 5) {
          chunks.push(targets.slice(i, i + 5));
        }

        for (const chunk of chunks) {
          await Promise.all(chunk.map(file => deleteFile(file, true, true)));
        }

        // Bulk update cache
        const targetSet = new Set(targets);
        sessionFileCache = (sessionFileCache || []).filter(f => !targetSet.has(f));
        setFiles([...sessionFileCache]);

        toast({ title: 'Bulk Purge Complete', description: `${targets.length} assets removed successfully.` });
        setSelectedFiles(new Set());
        if (onRefresh) onRefresh();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Bulk Action Failed', description: 'Some files could not be removed.' });
        fetchFiles(true);
      } finally {
        setSyncing(false);
      }
    };

    triggerConfirm({
      title: 'Bulk Purge Assets',
      message: `Are you sure you want to PERMANENTLY delete ${targets.length} selected assets?\nThis action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: proceed,
    });
  };

  const handleBulkArchiveSelected = async () => {
    const targets = Array.from(selectedFiles);
    
    const proceed = async () => {
      setSyncing(true);
      try {
        const chunks = [];
        for (let i = 0; i < targets.length; i += 5) {
          chunks.push(targets.slice(i, i + 5));
        }

        let count = 0;
        const movedMappings: Record<string, string> = {};
        
        for (const chunk of chunks) {
          await Promise.all(chunk.map(file => {
            if (file.startsWith('archive/')) return Promise.resolve();
            const fileName = file.split('/').pop();
            const newPath = `archive/${fileName}`;
            count++;
            movedMappings[file] = newPath;
            return moveFile(file, newPath, true, true);
          }));
        }

        // Bulk update cache
        sessionFileCache = (sessionFileCache || []).map(f => movedMappings[f] || f);
        setFiles([...sessionFileCache]);

        toast({ title: 'Archive Sync Complete', description: `${count} assets moved to system repository.` });
        setSelectedFiles(new Set());
        if (onRefresh) onRefresh();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Bulk Action Failed', description: 'Some files could not be archived.' });
        fetchFiles(true);
      } finally {
        setSyncing(false);
      }
    };

    triggerConfirm({
      title: 'Move Selected to Archive',
      message: `Move ${targets.length} selected assets to the system archive?`,
      confirmText: 'Archive',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: proceed,
    });
  };

  const handleBulkMoveToSubdir = async () => {
    if (!bulkMovePath.trim()) {
       toast({ variant: 'destructive', title: 'Target Required', description: 'Enter a destination path suggestion.' });
       return;
    }
    
    const targets = Array.from(selectedFiles);
    const destBase = bulkMovePath.trim().endsWith('/') ? bulkMovePath.trim() : `${bulkMovePath.trim()}/`;
    
    const proceed = async () => {
      setSyncing(true);
      try {
        const chunks = [];
        for (let i = 0; i < targets.length; i += 5) {
          chunks.push(targets.slice(i, i + 5));
        }

        const movedMappings: Record<string, string> = {};
        for (const chunk of chunks) {
          await Promise.all(chunk.map(file => {
            const fileName = file.split('/').pop();
            const newPath = `${destBase}${fileName}`;
            movedMappings[file] = newPath;
            return moveFile(file, newPath, true, true);
          }));
        }

        // Bulk update cache
        sessionFileCache = (sessionFileCache || []).map(f => movedMappings[f] || f);
        setFiles([...sessionFileCache]);

        toast({ title: 'Migration Complete', description: `${targets.length} assets successfully relocated.` });
        setSelectedFiles(new Set());
        setBulkMovePath('');
        if (onRefresh) onRefresh();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Bulk Migration Error', description: 'Some assets failed to migrate.' });
        fetchFiles(true);
      } finally {
        setSyncing(false);
      }
    };

    triggerConfirm({
      title: 'Move Selected Assets',
      message: `Are you sure you want to move ${targets.length} selected assets to ${destBase}?`,
      confirmText: 'Move Assets',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: proceed,
    });
  };

  const applyAlbumToPath = (album: string) => {
    const parts = editPath.split('/');
    const fileName = parts[parts.length - 1];
    setEditPath(`gallery/${album}/${fileName}`);
  };

  const orphanItems = React.useMemo(() => {
    if (!files.length && loading) return [];
    const storagePathsSet = new Set(files);
    return galleryItems.filter(item => item.storagePath && !storagePathsSet.has(item.storagePath));
  }, [files, galleryItems, loading]);

  const groupedFiles = React.useMemo(() => {
    const groups: Record<string, string[]> = {};
    
    files.forEach(file => {
      if (!file) return;
      let groupName = 'Uncategorized';
      
      if (file.startsWith('archive/trash/')) {
        groupName = 'Trash Bin (System)';
      } else if (file.startsWith('archive/')) {
        groupName = 'System Archive';
      } else if (file.startsWith('gallery/')) {
        const parts = file.split('/');
        if (parts.length > 2) {
          groupName = parts[1]; // The album name
        } else {
          groupName = 'Gallery Root';
        }
      } else if (file.includes('/')) {
        groupName = file.split('/')[0];
      }
      
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(file);
    });
    
    // Sort keys: prioritize Gallery albums
    const result = Object.keys(groups)
      .sort((a, b) => {
        if (a === 'Gallery Root') return -1;
        if (b === 'Gallery Root') return 1;
        if (a === 'Trash Bin (System)') return 1;
        if (b === 'Trash Bin (System)') return -1;
        if (a === 'System Archive') return 1;
        if (b === 'System Archive') return -1;
        if (a === 'Uncategorized') return 1;
        if (b === 'Uncategorized') return -1;
        return a.localeCompare(b);
      })
      .map(key => ({
        name: key,
        files: groups[key].sort((a, b) => {
          const aParts = a.split('/');
          const bParts = b.split('/');
          if (a.startsWith('gallery/') && b.startsWith('gallery/')) {
             if (aParts.length !== bParts.length) return bParts.length - aParts.length;
          }
          return a.localeCompare(b);
        })
      }));

    // Add Orphans group if any
    if (orphanItems.length > 0) {
      result.unshift({
        name: '⚠️ ORPHANED METADATA (MISSING STORAGE)',
        files: orphanItems.map(item => item.storagePath)
      });
    }

    return result;
  }, [files, orphanItems]);

  const [syncing, setSyncing] = React.useState(false);
  const handleBulkArchive = async () => {
    const proceed = async () => {
      setSyncing(true);
      try {
        const response = await fetch('/api/storage', {
          method: 'POST',
          body: JSON.stringify({ action: 'archive-untracked' }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Archive sequence failed');
        toast({ title: 'Assets Archived', description: data.message });
        fetchFiles(true); // Full refresh to show new paths
        if (onRefresh) onRefresh();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Archive Error', description: 'System failed to move untracked assets.' });
      } finally {
        setSyncing(false);
      }
    };

    triggerConfirm({
      title: 'System Reconciliation & Archive',
      message: 'This will synchronize the database and cleaner storage:\n1. MOVE all untracked files to a system /archive folder.\n2. REMOVE any broken database entries (missing files or directory markers).\n\nContinue with system reconciliation?',
      confirmText: 'Reconcile',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: proceed,
    });
  };

  const handleIntegrityRepair = async () => {
    const proceed = async () => {
      setSyncing(true);
      try {
        const response = await fetch('/api/storage', {
          method: 'POST',
          body: JSON.stringify({ action: 'prune' }),
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Repair failed');
        toast({ title: 'System Repaired', description: data.message });
        fetchFiles(true);
        if (onRefresh) onRefresh();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Repair Error', description: 'Deep scan encountered a registry mismatch.' });
      } finally {
        setSyncing(false);
      }
    };

    triggerConfirm({
      title: 'Deep Integrity Scan & Repair',
      message: 'DEEP INTEGRITY SCAN:\n1. Prune all dead database records (404 assets).\n2. Automatically adopt untracked gallery/ files into database.\n\nThis will fix all current registry errors. Proceed?',
      confirmText: 'Repair Now',
      cancelText: 'Cancel',
      variant: 'default',
      onConfirm: proceed,
    });
  };

  const handleUpdateMetadata = async (file: string) => {
    const item = galleryItems.find(i => i.storagePath === file);
    if (!item) return;
    
    setSyncing(true);
    try {
      const response = await fetch('/api/gallery', {
        method: 'PATCH',
        body: JSON.stringify({
          id: item.id,
          description: metaDesc,
          album: metaAlbum.trim() || null,
          subAlbum: metaSubAlbum.trim() || null,
          hoverText: metaHover,
          price: metaPrice.trim() || null
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Metadata update failed');
      toast({ title: 'Metadata Saved', description: `Updated details for ${file}` });
      setEditingMetadata(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Error', description: 'Failed to push metadata changes.' });
    } finally {
      setSyncing(false);
    }
  };

  const adoptFile = async (path: string) => {
    setSyncing(true);
    try {
      const response = await fetch('/api/storage', {
        method: 'POST',
        body: JSON.stringify({ oldPath: path, action: 'adopt' }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Adopt sequence failed');
      toast({ title: 'Success', description: 'File added to live gallery archive.' });
      if (onRefresh) onRefresh();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to adopt file.' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary/5 dark:bg-primary/20 p-4 rounded-2xl border border-primary/10">
        <div className="space-y-1">
          <h4 className="font-black text-primary uppercase tracking-tight flex items-center gap-2">
            <Database className="h-4 w-4" />
            Project Archive System
          </h4>
          <p className="text-[10px] font-bold text-primary/60 uppercase">Unified Storage & Dynamic Metadata</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={`border-primary/20 font-bold text-[10px] uppercase shadow-sm ${previewMode !== 'none' ? 'bg-primary text-primary-foreground' : 'bg-background text-primary'}`}
              >
                {previewMode === 'none' ? <EyeOff className="h-3.5 w-3.5 mr-2" /> : <Eye className="h-3.5 w-3.5 mr-2" />}
                Previews: {previewMode}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent className="w-40">
                <DropdownMenuLabel className="text-[10px] uppercase font-black">Visibility Logic</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setPreviewMode('none')}>
                  <EyeOff className="h-4 w-4 mr-2" /> None
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPreviewMode('adopted')}>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Adopted Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPreviewMode('all')}>
                  <LayoutGrid className="h-4 w-4 mr-2" /> Show All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>

          <Button 
            onClick={handleIntegrityRepair} 
            disabled={loading || syncing} 
            variant="outline" 
            size="sm"
            className="border-primary/30 text-primary font-black text-[10px] uppercase shadow-sm hover:bg-primary/5"
          >
            {syncing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
            Repair Registry
          </Button>
          <Button 
            onClick={handleBulkArchive} 
            disabled={loading || syncing} 
            variant="outline" 
            size="sm"
            className="border-amber-200 text-amber-700 font-bold text-[10px] uppercase shadow-sm hover:bg-amber-100"
          >
            {syncing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldCheck className="h-3 w-3 mr-2" />}
            Archive Untracked
          </Button>
          <Button onClick={() => fetchFiles(true)} disabled={loading} size="sm" variant="outline" className="bg-background border-primary/20 text-primary font-bold text-[10px] uppercase shadow-sm">
            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
            System Refresh
          </Button>
        </div>
      </div>

      {/* Dynamic File Uploader Block */}
      <div className="bg-background dark:bg-black/30 rounded-2xl border border-primary/20 p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h5 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Upload New Assets to Storage
            </h5>
            <p className="text-[10px] text-muted-foreground font-semibold">Upload high-res artwork or photos into your system folder</p>
          </div>
          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tight border-primary/20 bg-primary/5 text-primary">
            Storage Engine Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings & Configuration Left */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary tracking-wide">
                Target Folder Path
              </Label>
              <Input
                value={uploadPath}
                onChange={(e) => setUploadPath(e.target.value)}
                placeholder="e.g. gallery/Barns/"
                className="h-9 font-bold text-xs"
              />
              <p className="text-[9px] text-muted-foreground font-medium">Specify the destination directory in your storage bucket.</p>
            </div>

            {albumSuggestions.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase text-primary/60 tracking-wider">
                  Quick Folder Select:
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant="secondary"
                    className={`cursor-pointer text-[9px] font-black py-0.5 px-2 ${uploadPath === 'gallery/' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                    onClick={() => setUploadPath('gallery/')}
                  >
                    gallery/ (Root)
                  </Badge>
                  {albumSuggestions.map(album => (
                    <Badge
                      key={album}
                      variant="outline"
                      className={`cursor-pointer text-[9px] font-black py-0.5 px-2 ${uploadPath === `gallery/${album}/` ? 'bg-primary border-primary text-primary-foreground' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                      onClick={() => setUploadPath(`gallery/${album}/`)}
                    >
                      {album}
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className={`cursor-pointer text-[9px] font-black py-0.5 px-2 ${uploadPath === 'archive/' ? 'bg-amber-600 border-amber-600 text-white' : 'border-primary/20 text-primary hover:bg-primary/10'}`}
                    onClick={() => setUploadPath('archive/')}
                  >
                    archive/
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
              <Checkbox
                id="auto-adopt-upload"
                checked={autoAdoptUpload}
                onCheckedChange={(checked) => setAutoAdoptUpload(!!checked)}
                className="border-primary/40 data-[state=checked]:bg-primary"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="auto-adopt-upload"
                  className="text-[10px] font-black uppercase tracking-wider text-primary cursor-pointer"
                >
                  Auto-Adopt into Registry
                </Label>
                <p className="text-[9px] text-muted-foreground font-medium">
                  Automatically register uploaded photos in the active portfolio gallery when saved under <code className="font-mono">gallery/</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Drag & Drop Zone Right */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative ${
                dragActive
                  ? 'border-primary bg-primary/10 scale-[0.99]'
                  : 'border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10'
              }`}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <div className="bg-primary/10 p-3 rounded-full border border-primary/20 text-primary animate-pulse">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-primary">
                    Drag & Drop your images here
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                    Or click to browse files
                  </p>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium">Supports JPG, PNG, WEBP, GIF (Max 10MB per file)</p>
              </div>
            </div>

            {uploadFiles.length > 0 && (
              <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Upload Queue ({uploadFiles.length} files)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[9px] font-black uppercase text-destructive hover:bg-destructive/10"
                    onClick={() => setUploadFiles([])}
                  >
                    Clear Queue
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {uploadFiles.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-background/80 p-2 rounded-lg border border-primary/10 text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <ImageIcon className="h-4 w-4 shrink-0 text-primary/40" />
                        <span className="truncate font-bold text-[11px] text-primary">{file.name}</span>
                        <span className="text-[9px] text-muted-foreground font-semibold shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQueuedFile(idx);
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase px-6 h-9 shadow-lg shadow-primary/20"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading Assets...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Start Upload ({uploadFiles.length} Files)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFiles.size > 0 && (
         <div className="sticky top-4 z-50 animate-in fade-in zoom-in slide-in-from-top-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/20">
               <div className="flex items-center gap-3 ml-2">
                  <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center font-black text-xs">
                     {selectedFiles.size}
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/60">Selection Active</p>
                     <p className="text-xs font-bold">Assets ready for batch action</p>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                     <Input 
                        placeholder="gallery/AlbumName/" 
                        className="h-8 text-[10px] w-40 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        value={bulkMovePath}
                        onChange={(e) => setBulkMovePath(e.target.value)}
                     />
                     <Button 
                        size="sm" 
                        className="h-8 px-3 bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase"
                        onClick={handleBulkMoveToSubdir}
                     >
                        <ArrowRightLeft className="h-3 w-3 mr-1" /> Move
                     </Button>
                  </div>

                  <Button 
                    size="sm" 
                    className="h-8 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase"
                    onClick={handleBulkArchiveSelected}
                    disabled={syncing || loading}
                  >
                    {syncing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <FolderArchive className="h-3 w-3 mr-1" />} Bulk Archive
                  </Button>

                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="h-8 font-black text-[10px] uppercase"
                    onClick={handleBulkDelete}
                    disabled={syncing || loading}
                  >
                    {syncing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Trash className="h-3 w-3 mr-1" />} Bulk Purge
                  </Button>

                  <Separator orientation="vertical" className="h-6 bg-white/20 hidden md:block" />

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase"
                    onClick={() => setSelectedFiles(new Set())}
                  >
                    Clear
                  </Button>
               </div>
            </div>
         </div>
      )}

      <div className="space-y-12 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar p-1">
        {groupedFiles.length === 0 && !loading && (
          <div className="text-center py-16 text-primary/40 border-4 border-dashed border-primary/10 rounded-3xl bg-primary/5">
            <Folder className="mx-auto h-16 w-16 opacity-20" />
            <p className="mt-4 font-black uppercase tracking-widest text-xs">No project files found</p>
          </div>
        )}
        
        {groupedFiles.map(group => (
          <div key={group.name} className="space-y-4">
            <div className="flex items-center gap-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 px-1 rounded-xl">
              <div className="flex items-center gap-2">
                 <Checkbox 
                    checked={group.files.every(f => selectedFiles.has(f))}
                    onCheckedChange={() => toggleGroupSelection(group.files)}
                    className="border-primary/30 data-[state=checked]:bg-primary"
                 />
                 <Badge className={`${group.name?.includes('Trash') ? 'bg-destructive' : group.name?.includes('Archive') ? 'bg-amber-600' : 'bg-primary'} font-black px-3 py-1 rounded-lg shadow-md uppercase tracking-tight text-primary-foreground`}>
                   {group.name}
                 </Badge>
              </div>
              <div className="h-px flex-grow bg-primary/10" />
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{group.files.length} Assets</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {group.files.map(file => {
                const galleryItem = galleryItems.find(i => i.storagePath === file);
                const isTracked = !!galleryItem;
                
                return (
                  <div key={file} className={`flex flex-col p-4 border-2 rounded-2xl bg-background transition-all shadow-sm ${isTracked ? 'border-primary/10' : 'border-dashed border-amber-500/30'} ${processingFiles.has(file) ? 'opacity-50 pointer-events-none' : ''} ${selectedFiles.has(file) ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}`}>
                    {editingFile === file ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary font-bold text-primary-foreground">MOVE ASSET</Badge>
                          <span className="text-[10px] font-bold text-primary/60 font-mono truncate max-w-[200px]">{file}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-grow">
                            <Input 
                              value={editPath} 
                              onChange={(e) => setEditPath(e.target.value)} 
                              className="h-10 bg-transparent font-bold border-primary/30 focus:ring-primary pr-10"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') moveFile(file, editPath);
                                if (e.key === 'Escape') setEditingFile(null);
                              }}
                            />
                            <FolderPlus className="absolute right-3 top-2.5 h-5 w-5 text-primary/30" />
                          </div>
                          <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => moveFile(file, editPath)}>
                            <Check className="h-5 w-5" />
                          </Button>
                          <Button className="h-10" variant="outline" onClick={() => setEditingFile(null)}>
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        {albumSuggestions.length > 0 && (
                          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                            <p className="text-[9px] font-black text-primary/60 uppercase mb-2">Smart Move Suggestions (SAM):</p>
                            <div className="flex flex-wrap gap-1">
                              {albumSuggestions.map(album => (
                                <Badge 
                                  key={album} 
                                  variant="secondary" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-[9px] font-bold py-1"
                                  onClick={() => applyAlbumToPath(album)}
                                >
                                  gallery/{album}/
                                </Badge>
                              ))}
                              <Badge 
                                variant="outline" 
                                className="cursor-pointer border-destructive/20 text-destructive hover:bg-destructive/10 text-[9px]"
                                onClick={() => {
                                  const parts = editPath.split('/');
                                  setEditPath(parts[parts.length - 1]);
                                }}
                              >
                                Root folder
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0 flex-grow">
                             <div className="pt-2">
                                <Checkbox 
                                   checked={selectedFiles.has(file)}
                                   onCheckedChange={() => toggleSelect(file)}
                                   className="border-primary/30 data-[state=checked]:bg-primary"
                                />
                             </div>
                             {previewMode === 'all' || (previewMode === 'adopted' && isTracked) ? (
                               <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 border-background shadow-md bg-background flex items-center justify-center">
                                 {isTracked ? (
                                   <img 
                                     src={galleryItem.imageUrl} 
                                     alt="" 
                                     className="h-full w-full object-cover" 
                                     onError={(e) => {
                                       (e.target as any).src = "https://placehold.co/100x100?text=Broken+Ref";
                                     }}
                                   />
                                 ) : file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                   <img 
                                     src={`/api/storage/preview?path=${encodeURIComponent(file)}`} 
                                     alt="" 
                                     className="h-full w-full object-cover" 
                                     onError={(e) => {
                                       (e.target as any).src = "https://placehold.co/100x100?text=Preview+Error";
                                     }}
                                   />
                                 ) : (
                                   <FileText className="h-8 w-8 text-primary/30" />
                                 )}
                               </div>
                             ) : (
                               <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-primary/5 text-primary/60">
                                 {file?.includes('/') ? <Folder className="h-6 w-6" /> : <File className="h-6 w-6" />}
                               </div>
                             )}
                            
                            <div className="flex flex-col min-w-0">
                              <span className="flex items-center gap-2 truncate text-sm font-black text-primary uppercase tracking-tight">
                                <span className="truncate">{file}</span>
                              </span>
                              <div className="flex flex-col gap-1 mt-1 ml-1">
                                <div className="flex items-center gap-3">
                                  <p className="text-[9px] font-black text-primary/40 uppercase flex items-center gap-1.5 line-clamp-1">
                                    <span className="opacity-50">PATH:</span> 
                                    <span className="truncate">gs://{bucketName}/{file}</span>
                                  </p>
                                  {isTracked ? (
                                     <Badge className="h-4 text-[7px] font-black bg-primary/10 text-primary border-primary/20 uppercase py-0 px-1 flex items-center gap-1 shadow-sm">
                                       <ShieldCheck className="h-2 w-2" /> ARCHIVED
                                     </Badge>
                                  ) : file.startsWith('gallery/') ? (
                                     <Badge variant="outline" className="h-4 text-[7px] font-black border-amber-500/30 text-amber-600 uppercase py-0 px-1">UNTRACKED CLOUD FILE</Badge>
                                  ) : (
                                     <Badge variant="outline" className="h-4 text-[7px] font-black border-primary/20 text-primary/60 uppercase py-0 px-1">SYSTEM DIR</Badge>
                                  )}
                                  
                                  {galleryItem?.hidden && (
                                    <Badge variant="destructive" className="h-4 text-[7px] font-black uppercase py-0 px-1">HIDDEN</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {isTracked ? (
                              <Button 
                                size="sm" 
                                variant={editingMetadata === file ? 'default' : 'ghost'}
                                className={`h-9 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl ${editingMetadata === file ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/10'}`}
                                onClick={() => {
                                  if (editingMetadata === file) {
                                    setEditingMetadata(null);
                                  } else {
                                    setEditingMetadata(file);
                                    setMetaDesc(galleryItem.description || '');
                                    setMetaAlbum(galleryItem.album || '');
                                    setMetaSubAlbum(galleryItem.subAlbum || '');
                                    setMetaHover(galleryItem.hoverText || '');
                                  }
                                }}
                                disabled={processingFiles.has(file)}
                              >
                                <LayoutPanelLeft className="h-3.5 w-3.5 mr-1" /> Meta
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1">
                                {!file.startsWith('archive/') && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 px-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl"
                                    onClick={() => adoptFile(file)}
                                    disabled={syncing || processingFiles.has(file)}
                                  >
                                    <Link2 className="h-3.5 w-3.5 mr-1" /> Adopt
                                  </Button>
                                )}
                                {!file.startsWith('archive/') && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-9 px-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-100 rounded-xl"
                                    onClick={() => {
                                      const fileName = file.split('/').pop();
                                      moveFile(file, `archive/${fileName}`);
                                    }}
                                    disabled={processingFiles.has(file)}
                                    title="Move to System Archive"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Archive
                                  </Button>
                                )}
                              </div>
                            )}

                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-9 px-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-xl"
                              onClick={() => { setEditingFile(file); setEditPath(file); }}
                              disabled={processingFiles.has(file)}
                            >
                               <Edit2 className="h-3.5 w-3.5 mr-1" /> Move
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                              onClick={() => {
                                if (file.startsWith('archive/trash/')) {
                                  deleteFile(file);
                                } else {
                                  const fileName = file.split('/').pop();
                                  moveFile(file, `archive/trash/${Date.now()}_${fileName}`);
                                }
                              }}
                              disabled={processingFiles.has(file)}
                              title={file.startsWith('archive/trash/') ? "Permanently Delete" : "Move to Trash Bin"}
                            >
                              {processingFiles.has(file) ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : file.startsWith('archive/trash/') ? (
                                <Trash2 className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Metadata Editor Inline */}
                        {editingMetadata === file && (
                          <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 space-y-4 animate-in slide-in-from-top-2 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                   <Label className="text-[10px] font-black text-primary/60 uppercase flex items-center gap-1.5">
                                      <FileText className="h-3 w-3" /> Description
                                   </Label>
                                   <Input 
                                      value={metaDesc} 
                                      onChange={(e) => setMetaDesc(e.target.value)}
                                      className="h-9 bg-transparent border-primary/20 font-bold text-xs"
                                      placeholder="Main photo title"
                                   />
                                </div>
                                <div className="space-y-1.5">
                                   <Label className="text-[10px] font-black text-primary/60 uppercase flex items-center gap-1.5">
                                      <ImageIcon className="h-3 w-3" /> Hover Context
                                   </Label>
                                   <Input 
                                      value={metaHover} 
                                      onChange={(e) => setMetaHover(e.target.value)}
                                      className="h-9 bg-transparent border-primary/20 text-xs"
                                      placeholder="Extra details on hover"
                                   />
                                </div>
                             </div>

                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-primary/60 uppercase flex items-center gap-1.5">
                                   <span>💰</span> Price / Print Rate
                                </Label>
                                <Input 
                                   value={metaPrice} 
                                   onChange={(e) => setMetaPrice(e.target.value)}
                                   className="h-9 bg-transparent border-primary/20 font-bold text-xs"
                                   placeholder="e.g. $150 or Prints from $75"
                                />
                             </div>

                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-primary/60 uppercase flex items-center gap-1.5">
                                   <Folder className="h-3 w-3" /> Archive Album
                                </Label>
                                <div className="flex gap-2">
                                  <Input 
                                    value={metaAlbum} 
                                    onChange={(e) => setMetaAlbum(e.target.value)}
                                    className="h-9 bg-transparent border-primary/20 font-black text-xs"
                                    placeholder="e.g. Barns, Rainy, Summer"
                                  />
                                </div>
                                {albumSuggestions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {albumSuggestions.map(album => (
                                      <Badge 
                                        key={album} 
                                        variant="outline" 
                                        className={`cursor-pointer text-[8px] font-bold ${metaAlbum === album ? 'bg-primary text-primary-foreground border-primary' : 'border-primary/20 text-primary/60 hover:bg-primary/10'}`}
                                        onClick={() => setMetaAlbum(album)}
                                      >
                                        {album}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                             </div>

                             <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-primary/60 uppercase flex items-center gap-1.5">
                                   <FolderArchive className="h-3 w-3" /> Sub-Album Selection
                                </Label>
                                <div className="flex gap-2">
                                  <Input 
                                    value={metaSubAlbum} 
                                    onChange={(e) => setMetaSubAlbum(e.target.value)}
                                    className="h-9 bg-transparent border-primary/20 font-black text-xs"
                                    placeholder="e.g. Interior, Exterior, Framing"
                                  />
                                  <Button 
                                    className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase shadow-lg shadow-primary/20"
                                    onClick={() => handleUpdateMetadata(file)}
                                    disabled={syncing}
                                  >
                                    {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply Updates'}
                                  </Button>
                                </div>
                                {albumSuggestions.length > 0 && metaAlbum && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Array.from(new Set(galleryItems.filter((i: any) => i.album === metaAlbum).map((i: any) => i.subAlbum).filter(Boolean))).map((sub: any) => (
                                      <Badge 
                                        key={sub} 
                                        variant="outline" 
                                        className={`cursor-pointer text-[8px] font-bold ${metaSubAlbum === sub ? 'bg-emerald-600 text-white border-emerald-600' : 'border-primary/20 text-primary/60 hover:bg-primary/10'}`}
                                        onClick={() => setMetaSubAlbum(sub)}
                                      >
                                        {sub}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {confirmState && (
        <AlertDialog 
          open={confirmState.isOpen} 
          onOpenChange={(open) => {
            if (!open) setConfirmState(null);
          }}
        >
          <AlertDialogContent className="border border-primary/20 rounded-xl bg-background shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-black uppercase tracking-tight text-primary">
                {confirmState.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs font-medium text-muted-foreground whitespace-pre-line leading-relaxed">
                {confirmState.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 gap-2">
              <AlertDialogCancel className="font-bold border-primary/20 text-primary uppercase text-[10px] tracking-wider rounded-xl h-9 hover:bg-primary/5">
                {confirmState.cancelText || 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={async () => {
                  try {
                    await confirmState.onConfirm();
                  } catch (e) {
                    console.error('Action failed:', e);
                  } finally {
                    setConfirmState(null);
                  }
                }}
                className={`font-bold uppercase text-[10px] tracking-wider rounded-xl h-9 text-white ${
                  confirmState.variant === 'destructive' 
                    ? 'bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20' 
                    : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                }`}
              >
                {confirmState.confirmText || 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
