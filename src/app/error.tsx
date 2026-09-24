'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-8xl font-black text-destructive tracking-tighter mb-4">500</h1>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Something Went Wrong</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          {error?.message || 'We encountered an unexpected server error while loading this gallery page.'}
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/">Return to Gallery</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
