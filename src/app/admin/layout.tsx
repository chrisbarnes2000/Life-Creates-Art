'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ALLOWED_ADMINS = ['chris.barnes.2000@me.com', 'lifecreatesart@yahoo.com'];

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

  const userEmail = user.email?.toLowerCase() || '';
  const isAuthorizedAdmin = ALLOWED_ADMINS.includes(userEmail);

  if (!isAuthorizedAdmin) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4 p-8 bg-card border rounded-2xl shadow-lg">
            <div className="flex justify-center">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Access Restricted</h1>
            <p className="text-muted-foreground text-sm">
              The account <span className="font-semibold text-foreground">{user.email || 'Current user'}</span> does not have administrative privileges for the LifeCreatesArt control portal.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default">
                <Link href="/">Return to Gallery</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Switch Account</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is authenticated and is an authorized admin, render the children.
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
