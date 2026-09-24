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
    <footer className="mt-20 bg-primary text-primary-foreground relative">
      <div className="w-full h-1 bg-gradient-to-r from-accent via-primary-foreground/40 to-accent" />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & About Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-accent" aria-hidden="true" />
              <h3 className="text-xl font-headline font-bold text-accent">Life Creates Art</h3>
            </div>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/70 font-semibold">
              Observation • Composure • Independence
            </p>
            <p className="text-sm text-primary-foreground/85 leading-relaxed w-full">
              Fine art, photography print purchases, custom memory albums, private digital galleries, and personalized creative consulting. Empowering visual storytelling through resilience.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/80">
              <li>
                <Link href="/#gallery" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  Gallery & Prints
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  About Tina Barnes
                </Link>
              </li>
              <li>
                <Link href="/resources" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  Resources & Guides
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-primary-foreground/80">
              <li>
                <Link href="/terms" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded">
                  Artist & Admin Sign In
                </Link>
              </li>
              <li>
                <a
                  href="https://rapprt.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                >
                  RapportVerse <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Partnership */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Inquiries
            </h4>
            <div className="space-y-3 text-sm text-primary-foreground/85">
              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 mt-0.5 text-accent shrink-0" aria-hidden="true" />
                <a
                  href="mailto:lifecreatesart@yahoo.com"
                  className="hover:text-accent underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                >
                  lifecreatesart@yahoo.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <span>Pacific Northwest, USA</span>
              </div>
              <p className="text-xs text-primary-foreground/70 pt-1">
                Open for commissioned artworks, exhibition requests, and print reproductions.
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 border-t border-primary-foreground/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/75 text-center md:text-left">
          <p>
            © {currentYear} LifeCreatesArt & Tina Barnes. All rights reserved.
          </p>
          <p>
            Webmaster & Technology Architecture by Chris Barnes (Founder of{' '}
            <a
              href="https://rapprt.space"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
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
