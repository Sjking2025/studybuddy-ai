import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock scrollTo for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}

// Bypass framer-motion exit delay in JSDOM unit tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});
