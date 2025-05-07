import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | number | string[]): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveClass(...classNames: string[]): R;
      toHaveFocus(): R;
    }
  }
}

export {}; 