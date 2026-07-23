'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, MapPin, ShieldCheck, Warehouse, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AboutUs() {
  return (
    <Card className="mb-8 border-primary/20 bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Info className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle asChild>
              <h2 className="font-headline text-2xl text-primary font-bold">
                Meet Tina Barnes
              </h2>
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden md:flex hover:bg-primary/10 text-primary border-primary/30 font-bold">
            <Link href="/about" className="flex items-center gap-2">
              My Full Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription className="text-foreground text-sm font-bold mt-1 opacity-80">
          Resilience. Creativity. Art.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-base leading-relaxed text-foreground font-bold">
          Hi, I'm Tina Barnes. I am a single mother of five who survived narcissistic abuse and broke free from a controlling past. My journey has not been easy, but through art, I found my freedom and strength.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 group transition-colors shadow-sm">
            <Sparkles className="h-6 w-6 shrink-0 text-accent" />
            <div>
              <h4 className="text-sm font-bold text-primary">Resilience</h4>
              <p className="text-xs text-foreground font-bold">
                Building a life of my own.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10 group transition-colors shadow-sm">
            <ShieldCheck className="h-6 w-6 shrink-0 text-accent" />
            <div>
              <h4 className="text-sm font-bold text-primary">Freedom</h4>
              <p className="text-xs text-foreground font-bold">
                Escaped and empowered.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 md:hidden">
          <Button variant="outline" size="sm" asChild className="w-full border-primary/30 text-primary font-bold">
            <Link href="/about" className="flex items-center justify-center gap-2">
              My Full Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
