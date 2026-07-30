'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, ShieldCheck, ArrowRight, Sparkles, Eye } from 'lucide-react';
import Link from 'next/link';

export function AboutUs() {
  return (
    <Card className="mb-8 border-none bg-primary/5 shadow-none overflow-hidden rounded-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary" />
      <CardHeader className="pb-4 px-6 md:px-8 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-background rounded-xl shadow-sm border border-primary/10">
              <Info className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <CardTitle asChild>
              <h2 className="font-headline text-3xl text-primary font-bold tracking-tight">
                Meet Tina Barnes
              </h2>
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden md:flex hover:bg-primary hover:text-primary-foreground text-primary border-primary/30 font-semibold rounded-full px-6 transition-all">
            <Link href="/about" className="flex items-center gap-2">
              My Full Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription className="text-foreground text-base font-medium mt-2 opacity-80 pl-[68px]">
          Observation. Composure. Independence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-6 md:px-8 pb-8">
        <p className="text-lg leading-relaxed text-foreground/90 max-w-3xl">
          Hi, I'm Tina Barnes. With over a decade of experience managing businesses and prioritizing safety, I bring unwavering focus and independence to everything I do. Raising five children has taught me resilience, while my art allows me to channel my keen observation and strength into something beautiful and lasting. I pride myself on staying calm under pressure and building a life on my own terms.
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-3 p-5 bg-background rounded-xl border border-primary/10 hover:border-primary/30 transition-colors shadow-sm">
            <Sparkles className="h-6 w-6 text-accent" />
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Independence</h4>
              <p className="text-sm text-muted-foreground">
                Building a thriving life on my terms.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 p-5 bg-background rounded-xl border border-primary/10 hover:border-primary/30 transition-colors shadow-sm">
            <ShieldCheck className="h-6 w-6 text-accent" />
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Composure</h4>
              <p className="text-sm text-muted-foreground">
                Calm and decisive under pressure.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 p-5 bg-background rounded-xl border border-primary/10 hover:border-primary/30 transition-colors shadow-sm">
            <Eye className="h-6 w-6 text-accent" />
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Observation</h4>
              <p className="text-sm text-muted-foreground">
                Sharp attention to detail and safety.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 md:hidden">
          <Button variant="default" size="default" asChild className="w-full rounded-full font-semibold">
            <Link href="/about" className="flex items-center justify-center gap-2">
              My Full Story <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
