import '@testing-library/jest-dom';

// Mock scrollTo for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
