import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FlashCards from '@/components/dashboard/FlashCards';
import { useStudyStore } from '@/lib/store';
import { Flashcard, UploadedDocument } from '@/lib/types';

describe('FlashCards Component', () => {
  const sampleDoc: UploadedDocument = {
    id: 'doc-bio-1',
    name: 'Biology Notes.txt',
    content: 'ATP synthase is an enzyme that creates the energy storage molecule ATP.',
    uploadedAt: new Date(),
  };

  const sampleCards: Flashcard[] = [
    {
      id: 'fc-1',
      front: 'What is the function of ATP synthase?',
      back: 'Synthesizes ATP from ADP and inorganic phosphate via a proton gradient.',
      difficulty: 'hard',
      mastered: false,
    },
    {
      id: 'fc-2',
      front: 'Where does glycolysis take place?',
      back: 'In the cytosol / cytoplasm of the cell.',
      difficulty: 'easy',
      mastered: false,
    },
  ];

  beforeEach(() => {
    useStudyStore.getState().resetAll();
  });

  it('renders empty prompt when no documents or flashcards are loaded', () => {
    render(<FlashCards />);
    expect(screen.getByText(/No study documents uploaded yet/i)).toBeDefined();
  });

  it('renders flashcard front question and navigation controls', () => {
    useStudyStore.getState().addDocument(sampleDoc);
    useStudyStore.getState().setFlashcards(sampleCards);
    render(<FlashCards />);

    expect(screen.getByText('What is the function of ATP synthase?')).toBeDefined();
    expect(screen.getByText(/0 of 2 Mastered/i)).toBeDefined();
  });

  it('flips flashcard to reveal back side answer on click', () => {
    useStudyStore.getState().addDocument(sampleDoc);
    useStudyStore.getState().setFlashcards(sampleCards);
    render(<FlashCards />);

    const card = screen.getByText('What is the function of ATP synthase?');
    fireEvent.click(card);

    expect(screen.getByText(/Synthesizes ATP from ADP/i)).toBeDefined();
  });

  it('navigates to next card and previous card', () => {
    useStudyStore.getState().addDocument(sampleDoc);
    useStudyStore.getState().setFlashcards(sampleCards);
    render(<FlashCards />);

    const nextBtn = screen.getByRole('button', { name: /Next flashcard/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Where does glycolysis take place?')).toBeDefined();

    const prevBtn = screen.getByRole('button', { name: /Previous flashcard/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText('What is the function of ATP synthase?')).toBeDefined();
  });

  it('toggles card mastery status and updates progress bar', () => {
    useStudyStore.getState().addDocument(sampleDoc);
    useStudyStore.getState().setFlashcards(sampleCards);
    render(<FlashCards />);

    const masterBtn = screen.getByRole('button', { name: /Mark Mastered/i });
    fireEvent.click(masterBtn);

    expect(screen.getByText(/1 of 2 Mastered/i)).toBeDefined();
    expect(useStudyStore.getState().flashcards[0].mastered).toBe(true);
  });
});
