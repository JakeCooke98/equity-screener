'use client';

import { Header } from './header';
import { Footer } from './footer';
import { FavoritesProvider } from '@/contexts/FavoritesContext';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </FavoritesProvider>
  );
} 