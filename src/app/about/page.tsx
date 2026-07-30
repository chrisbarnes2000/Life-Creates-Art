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
                Hi, I'm Tina Barnes. I am an artist, an entrepreneur, a mother of five, and a woman who has found profound strength and independence in creating a life I truly love.
              </p>
            </div>
            
            <CardContent className="space-y-16 p-8 md:p-16">
              <section className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-primary">
                  Thriving Through Creation
                </h2>
                <div className="space-y-4 text-lg leading-relaxed text-foreground font-bold">
                  <p>
                    My journey is one of resilience and transformation. Building a life for myself and my five children in the beautiful Pacific Northwest has taught me the value of unyielding composure, keen observation, and independent determination.
                  </p>
                  <p>
                    Throughout my career—from successfully owning and operating my own salon to managing fast-paced hospitality environments—I have always prided myself on my ability to remain calm under pressure, solve problems decisively, and prioritize the safety and well-being of those around me. Those same professional skills fuel my personal life and artistic expression.
                  </p>
                  <p>
                    Art is the space where my strength and creativity meet. Through photography, painting, and design, I channel my experiences into something beautiful and lasting. I am no longer just navigating life; I am thriving, embracing my true identity, and moving forward with purpose.
                  </p>
                  <p>
                    LifeCreatesArt is a testament to the power of independence, unwavering focus, and the beauty of building a fulfilling life on your own terms.
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
