'use client';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink, BookOpen, Heart, Palette, Image as ImageIcon, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';

const resources = [
  {
    title: 'Print Types & Sizing Guide',
    description:
      'Understand the differences between Acrylic, Canvas, and Fine Art Paper prints to select the perfect display for your space.',
    url: '/about',
    icon: ImageIcon,
    category: 'Buying Guide'
  },
  {
    title: 'Custom Memory & Legacy Albums',
    description:
      'We design personalized high-end photography albums to preserve memories, celebrate life journeys, and honor milestones.',
    url: '/about',
    icon: BookOpen,
    category: 'Custom Services'
  },
  {
    title: 'Healing Through Creative Expression',
    description:
      'Inspiring studies and guides on utilizing photography, painting, and visual arts to navigate recovery and find freedom.',
    url: 'https://www.rtor.org/2018/06/13/art-therapy-for-abuse/',
    icon: Heart,
    category: 'Resilience'
  },
  {
    title: 'Private Listing Galleries',
    description:
      'Learn how we host password-protected, private collections for collectors, family circles, and customized viewing events.',
    url: '/about',
    icon: Sparkles,
    category: 'Galleries'
  },
];

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-3">
              <Palette className="h-10 w-10 text-accent" />
              Resource & Inspiration Hub
            </h1>
            <p className="mt-4 text-foreground font-bold text-lg max-w-2xl mx-auto opacity-90">
              Your guide to selecting prints, preserving legacy memories, and understanding the role of art in reclaiming personal strength.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => (
              <Card key={resource.title} className="group hover:shadow-lg transition-all duration-300 border-primary/20 shadow-sm overflow-hidden bg-primary/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      {resource.category}
                    </span>
                    <resource.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors text-primary font-bold">{resource.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed min-h-[40px] font-bold text-foreground">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={resource.url}
                    className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:gap-3 transition-all underline decoration-accent/30 underline-offset-4"
                  >
                    Learn More <ExternalLink className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 p-10 rounded-2xl bg-accent text-accent-foreground text-center shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10 text-accent-foreground">Need a Custom Commission or Private viewing?</h2>
            <p className="opacity-95 mb-8 max-w-xl mx-auto relative z-10 text-accent-foreground font-bold text-lg">
              Whether you are looking for custom prints, memory album curations, or would like to discuss a customized art consultation, we are here to support your creative vision.
            </p>
            <Link 
              href="/about"
              className="relative z-10 inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 text-base font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
            >
              Contact Tina
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}