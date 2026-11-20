import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import UploadZone from '@/components/dashboard/UploadZone';
import FlashCards from '@/components/dashboard/FlashCards';
import { useStudyStore } from '@/lib/store';

describe('Accessibility & WCAG 2.1 Compliance', () => {
  it('Sidebar contains proper landmark navigation with aria-label', () => {
    render(<Sidebar />);
    const navElement = screen.getByRole('navigation', { name: /Main Navigation/i });
    expect(navElement).toBeDefined();

    // Verify all navigation buttons have touch target >= 44px
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) {
      expect(btn.className).toContain('min-h-[44px]');
      expect(btn.className).toContain('focus-visible:ring-2');
    }
  });

  it('Sidebar identifies active item with aria-current="page"', () => {
    useStudyStore.getState().setActiveView('flashcards');
    render(<Sidebar />);
    const activeBtn = screen.getByRole('button', { name: /Flashcards/i });
    expect(activeBtn.getAttribute('aria-current')).toBe('page');
  });

  it('UploadZone buttons maintain accessible labels and min touch targets', () => {
    render(<UploadZone />);
    const quickStartButtons = screen.getAllByRole('button');
    expect(quickStartButtons.length).toBeGreaterThan(0);

    for (const btn of quickStartButtons) {
      expect(btn.className).toContain('min-h-[44px]');
      expect(btn.className).toContain('focus-visible:ring-2');
    }
  });

  it('FlashCards provides screen-reader accessible navigation labels', () => {
    useStudyStore.getState().setFlashcards([
      { id: '1', front: 'Front Q', back: 'Back A', difficulty: 'easy', mastered: false },
    ]);
    render(<FlashCards />);

    expect(screen.getByRole('button', { name: /Previous flashcard/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Next flashcard/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Mark Mastered/i })).toBeDefined();
  });
});
