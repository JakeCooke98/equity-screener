import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SymbolsProvider } from "@/contexts/SymbolsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Equity Screener",
  description: "Search for stocks, ETFs, and other securities using Alpha Vantage data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash on page load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme') || 'light';
              document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch (e) {}
          })()
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <SymbolsProvider>
            {children}
          </SymbolsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
