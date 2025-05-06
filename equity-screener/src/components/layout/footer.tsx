'use client';

export function Footer() {
  return (
    <footer className="py-6 px-6 md:px-10 border-t">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Equity Screener. Powered by Alpha Vantage API.
        </p>
        <p className="text-sm text-muted-foreground">
          Built with Next.js, Tailwind CSS, and Shadcn UI
        </p>
      </div>
    </footer>
  );
} 