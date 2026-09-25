'use client';

import * as React from 'react';
import Link from 'next/link';
import { Palette, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-20 bg-secondary/30 dark:bg-black/40 border-t border-primary/10 relative text-muted-foreground">
      {/* Subtle top brand-accent border line */}
      <div className="w-full h-[3px] bg-gradient-to-r from-accent/30 via-primary/30 to-accent/30" />
      
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & About Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-headline font-black text-primary tracking-tight">Life Creates Art</h3>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-black">
              Observation • Composure • Independence
            </p>
            <p className="text-sm text-muted-foreground/90 leading-relaxed w-full font-medium">
              Fine art, photography print purchases, custom memory albums, private digital galleries, and personalized creative consulting. Empowering visual storytelling through resilience.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-primary">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground/85 font-medium">
              <li>
                <Link href="/#gallery" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  Gallery & Prints
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  About Tina Barnes
                </Link>
              </li>
              <li>
                <Link href="/resources" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  Resources & Guides
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-primary">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground/85 font-medium">
              <li>
                <Link href="/terms" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
                  Artist & Admin Sign In
                </Link>
              </li>
              <li>
                <a
                  href="https://rapprt.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  RapportVerse <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Partnership */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-primary">
              Inquiries
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground/85 font-medium">
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <a
                  href="mailto:lifecreatesart@yahoo.com"
                  className="hover:text-primary underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  lifecreatesart@yahoo.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                <span>Pacific Northwest, USA</span>
              </div>
              <p className="text-xs text-muted-foreground/70 pt-1 leading-relaxed">
                Open for commissioned artworks, exhibition requests, and print reproductions.
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 border-t border-primary/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/75 text-center md:text-left font-medium">
          <p>
            © {currentYear} LifeCreatesArt & Tina Barnes. All rights reserved.
          </p>
          <p>
            Webmaster & Technology Architecture by Chris Barnes (Founder of{' '}
            <a
              href="https://rapprt.space"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
            >
              RapportVerse
            </a>
            ).
          </p>
        </div>
      </div>
    </footer>
  );
}
