import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { UserPreferencesProvider } from '@/context/UserPreferencesContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'LifeCreatesArt - Photo Gallery & Journey by Tina Croft Barnes',
  description:
    'Explore the photography and fine art gallery of Tina Croft Barnes, a story of resilience, strength, and creative freedom captured in every frame.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <UserPreferencesProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <FirebaseClientProvider>
              {children}
              <Toaster />
            </FirebaseClientProvider>
          </ThemeProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
