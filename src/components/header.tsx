'use client';

import {
  Menu,
  Monitor,
  Moon,
  Settings,
  Shield,
  Warehouse,
  LogOut,
  LogIn,
  Loader2,
  BookOpen,
  Sun,
  Info,
  TrendingUp,
  Paintbrush,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { signOut } from 'firebase/auth';
import { useUser, useAuth } from '@/firebase';
import { useUserPreferences } from '@/context/UserPreferencesContext';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export function Header() {
  const { setTheme: setNextTheme } = useTheme();
  const { theme: customTheme, setTheme: setCustomTheme, affiliateEnabled } = useUserPreferences();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/');
      });
    }
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <Paintbrush className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary">
              LifeCreatesArt
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About Me</Link>
            <Link href="/resources" className="text-sm font-medium hover:text-primary transition-colors">Resources</Link>
            {affiliateEnabled && (
              <Link href="/affiliate" className="text-sm font-black text-primary hover:text-primary/80 transition-colors flex items-center gap-1 animate-pulse">
                <TrendingUp className="h-3 w-3" /> Affiliate
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {user && !user.isAnonymous && (
            <Button variant="outline" size="sm" asChild className="hidden md:flex">
              <Link href="/admin">Admin Panel</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account & Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/about">
                  <Info className="mr-2 h-4 w-4" />
                  <span>About Me</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/resources">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Resources</span>
                </Link>
              </DropdownMenuItem>
              {affiliateEnabled && (
                <DropdownMenuItem asChild>
                  <Link href="/affiliate">
                    <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">Affiliate Center</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {isUserLoading ? (
                <DropdownMenuItem disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </DropdownMenuItem>
              ) : user && !user.isAnonymous ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Admin Login</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Display Mode</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setNextTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNextTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNextTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Paintbrush className="mr-2 h-4 w-4 text-primary" />
                  <span>Custom Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setCustomTheme('dark-green')}>
                      <div className="w-3 h-3 rounded-full bg-[#1b4332] mr-2 border border-white/20" />
                      <span className={customTheme === 'dark-green' ? 'font-black' : ''}>PNW Forest Green</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCustomTheme('mint-green')}>
                      <div className="w-3 h-3 rounded-full bg-[#52b788] mr-2 border border-emerald-400" />
                      <span className={customTheme === 'mint-green' ? 'font-black' : ''}>Spring Mint Green</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
