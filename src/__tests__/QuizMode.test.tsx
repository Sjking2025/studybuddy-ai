import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import QuizMode from '@/components/dashboard/QuizMode';
import { useStudyStore } from '@/lib/store';
import { QuizQuestion } from '@/lib/types';

describe('QuizMode Component', () => {
  const testQuestions: QuizQuestion[] = [
    {
      id: 'tq-1',
      question: 'What does CPU stand for?',
      options: [
        'Central Processing Unit',
        'Computer Personal Unit',
        'Central Program Utility',
        'Control Processing User',
      ],
      correctAnswer: 0,
      explanation: 'CPU stands for Central Processing Unit.',
      topic: 'Hardware',
    },
    {
      id: 'tq-2',
      question: 'Which protocol is used for secure web browsing?',
      options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
      correctAnswer: 2,
      explanation: 'HTTPS provides encrypted communication over TLS/SSL.',
      topic: 'Networking',
    },
  ];

  beforeEach(() => {
    useStudyStore.getState().resetAll();
  });

  it('renders start screen with title and start demo quiz button', () => {
    render(<QuizMode />);
    expect(screen.getByRole('heading', { name: /Interactive/i, level: 1 })).toBeDefined();
    expect(screen.getByText(/Start Demo Quiz/i)).toBeDefined();
  });

  it('starts quiz session when demo button is clicked', () => {
    render(<QuizMode />);
    const startDemoBtn = screen.getByText(/Start Demo Quiz/i);
    fireEvent.click(startDemoBtn);

    expect(screen.getByText(/What is the primary function/i)).toBeDefined();
  });

  it('navigates through custom quiz questions and displays results', () => {
    useStudyStore.getState().setQuizQuestions(testQuestions);
    render(<QuizMode />);

    const startBtn = screen.getByText(/Start Quiz \(2 Qs\)/i);
    fireEvent.click(startBtn);

    expect(screen.getByText('What does CPU stand for?')).toBeDefined();
    expect(screen.getByText('Central Processing Unit')).toBeDefined();

    // Select the correct option for question 1
    const option0 = screen.getByText('Central Processing Unit');
    fireEvent.click(option0);

    // Click Next Question
    const nextBtn = screen.getByText(/Next Question/i);
    fireEvent.click(nextBtn);

    // Question 2 should now be visible
    expect(screen.getByText('Which protocol is used for secure web browsing?')).toBeDefined();

    // Select option for question 2
    const optionHttps = screen.getByText('HTTPS');
    fireEvent.click(optionHttps);

    // On last question, button text is 'View Results'
    const viewResultsBtn = screen.getByText(/View Results/i);
    fireEvent.click(viewResultsBtn);

    // Results screen should be visible
    expect(screen.getByText(/Per-Question Review/i)).toBeDefined();
    expect(screen.getByText(/Accuracy Rate/i)).toBeDefined();
    expect(useStudyStore.getState().quizResults).toHaveLength(1);
    expect(useStudyStore.getState().quizResults[0].score).toBe(2);
  });
});
