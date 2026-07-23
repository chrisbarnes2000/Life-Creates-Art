'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Warehouse, Target, Sparkles, GraduationCap, Globe, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <Card className="overflow-hidden border-none shadow-2xl bg-primary/5">
            <div className="bg-primary py-20 text-center text-primary-foreground relative">
              <h1 className="font-headline text-4xl font-bold md:text-5xl text-primary-foreground relative z-10">My Story, My Art</h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-bold opacity-95 leading-relaxed px-6 relative z-10 text-primary-foreground">
                Hi, I'm Tina Barnes. I am a single mother of five, a survivor of narcissistic abuse, and I have found my freedom and healing through art and the courage to start over.
              </p>
            </div>
            
            <CardContent className="space-y-16 p-8 md:p-16">
              <section className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  Breaking Free
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-foreground font-bold">
                  <p>
                    My journey has not been easy. I escaped the LDS church, leaving behind a life that was not my own. I have navigated the complexities of narcissistic abuse and rebuilt a life for myself and my five children.
                  </p>
                  <p>
                    Art became my sanctuary. Through photography, painting, and creating, I found the strength to express my truth and reclaim my identity. My family in Utah remains, but I have built my own path in the Pacific Northwest, where I am free to be who I truly am.
                  </p>
                  <p>
                    LifeCreatesArt is a testament to resilience, beauty, and the power of starting over.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
