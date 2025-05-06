'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { usePathname } from 'next/navigation';
import { BarChart2, Home, Zap } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="flex h-16 items-center justify-between border-b px-6 md:px-10">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold">Equity Screener</h1>
        <nav className="hidden md:flex items-center space-x-2">
          <Button 
            variant={pathname === '/' ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          <Button 
            variant={pathname === '/dashboard' ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link href="/dashboard">
              <BarChart2 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button 
            variant={pathname === '/lazy-loading-demo' ? 'default' : 'ghost'} 
            size="sm" 
            asChild
          >
            <Link href="/lazy-loading-demo">
              <Zap className="h-4 w-4 mr-2" />
              Demo
            </Link>
          </Button>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
} 