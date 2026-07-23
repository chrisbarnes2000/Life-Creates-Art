'use client';

import * as React from 'react';
import { Palette } from 'lucide-react';

export function Footer() {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Palette className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-accent">Life Creates Art</h3>
        </div>
        <p className="text-sm text-primary-foreground/80 max-w-xl mx-auto">
          Fine art, photography print purchases, custom memory albums, private digital galleries, and personalized creative consulting. Empowering visual storytelling through resilience.
        </p>
        <p className="mt-4 text-xs text-primary-foreground/90">
          © {currentYear} LifeCreatesArt & Tina Barnes. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
