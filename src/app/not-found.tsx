import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-8xl font-black text-primary tracking-tighter mb-4">404</h1>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Gallery Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          The artwork or gallery page you are looking for may have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/">Return to Gallery</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">About Tina Barnes</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
