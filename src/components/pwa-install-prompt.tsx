'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, X, Download } from 'lucide-react';

export function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if mobile
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileDevice = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

    if (!isMobileDevice) return;

    // Check if already dismissed or installed
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed) return;

    // Detect iOS
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent.toLowerCase());
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // For iOS, show banner after 3 seconds if not in standalone mode
      const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
      if (!isInStandaloneMode) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // Android / Chrome beforeinstallprompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      setShowPrompt(false);
    } else if (isIOS) {
      alert('To install LifeCreatesArt on your iOS device: tap the Share button in Safari and select "Add to Home Screen".');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md bg-card border border-border shadow-lg rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        <Smartphone className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-foreground">Install LifeCreatesArt</h3>
        <p className="text-xs text-muted-foreground truncate">
          {isIOS ? 'Add to your Home Screen for app experience.' : 'Install our app for quick access & offline gallery.'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={handleInstallClick} className="gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
