'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UploadZone } from '@/components/storage/upload-zone';

export function FloatingUploadButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/95 text-primary-foreground border border-primary/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
          size="icon"
          aria-label="Upload new item"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-black uppercase text-primary tracking-tight">Quick Upload</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            Add a new artwork or print directly to the gallery.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <UploadZone 
            layout="stack" 
            onUploadComplete={() => { 
              setOpen(false); 
              // Refresh to update the parent gallery components dynamically
              window.location.reload();
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
