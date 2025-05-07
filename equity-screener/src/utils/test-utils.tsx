import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { SymbolsProvider } from '@/contexts/SymbolsContext';

/**
 * Custom wrapper with necessary providers for component testing
 */
function AllProviders({ children }: PropsWithChildren<{}>): JSX.Element {
  return (
    <FavoritesProvider>
      <SymbolsProvider>
        {children}
      </SymbolsProvider>
    </FavoritesProvider>
  );
}

/**
 * Custom render function that includes global providers
 * 
 * @param ui - Component to render
 * @param options - Additional render options
 * @returns The Testing Library render result
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from Testing Library
export * from '@testing-library/react';

// Override the render method with our custom version
export { customRender as render }; 