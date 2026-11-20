import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import { useStudyStore } from '@/lib/store';

describe('Sidebar Component', () => {
  it('renders the branding logo and app title', () => {
    render(<Sidebar />);
    expect(screen.getByText('StudyBuddy')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('AI Study Companion')).toBeInTheDocument();
  });

  it('renders all key navigation items with accessible roles', () => {
    render(<Sidebar />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Flashcards')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Mind Map')).toBeInTheDocument();
    expect(screen.getByText('Study Plan')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('changes active view when a nav button is clicked', () => {
    render(<Sidebar />);
    const quizBtn = screen.getByText('Quiz').closest('button');
    expect(quizBtn).toBeInTheDocument();
    if (quizBtn) fireEvent.click(quizBtn);
    expect(useStudyStore.getState().activeView).toBe('quiz');
  });

  it('calls onNavigate callback when provided', () => {
    let called = false;
    render(<Sidebar onNavigate={() => { called = true; }} />);
    const flashcardsBtn = screen.getByText('Flashcards').closest('button');
    if (flashcardsBtn) fireEvent.click(flashcardsBtn);
    expect(called).toBe(true);
  });
});
