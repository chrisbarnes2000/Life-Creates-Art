'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading) {
      // If loading is finished and there's no user,
      // or the user is anonymous, redirect to login.
      if (!user || user.isAnonymous) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  // While checking auth or if user is not authorized, show a loader.
  if (isUserLoading || !user || user.isAnonymous) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated and not anonymous, render the children.
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
