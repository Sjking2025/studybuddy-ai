import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import UploadZone from '@/components/dashboard/UploadZone';
import { useStudyStore } from '@/lib/store';

describe('UploadZone Component', () => {
  beforeEach(() => {
    useStudyStore.getState().resetAll();
  });

  it('renders title and evaluator quick-start presets', () => {
    render(<UploadZone />);
    expect(screen.getByText(/Upload Your/i)).toBeDefined();
    expect(screen.getByText(/Load Biology Notes \(Sample\)/i)).toBeDefined();
    expect(screen.getByText(/Load CS Algorithms \(Sample\)/i)).toBeDefined();
  });

  it('loads sample biology notes into store on button click', () => {
    render(<UploadZone />);
    const biologyBtn = screen.getByText(/Load Biology Notes \(Sample\)/i);
    fireEvent.click(biologyBtn);

    const storeDocs = useStudyStore.getState().documents;
    expect(storeDocs).toHaveLength(1);
    expect(storeDocs[0].name).toBe('Biology_Cell_Metabolism.txt');
    expect(storeDocs[0].content).toContain('Cellular respiration');
  });

  it('switches between Upload and Paste tabs', () => {
    render(<UploadZone />);
    const pasteTab = screen.getByRole('tab', { name: /Paste Notes/i });
    fireEvent.click(pasteTab);

    expect(screen.getByPlaceholderText(/Paste your syllabus/i)).toBeDefined();
  });

  it('allows manual note pasting and adds to knowledge base', () => {
    render(<UploadZone />);
    // Switch to paste tab
    const pasteTab = screen.getByRole('tab', { name: /Paste Notes/i });
    fireEvent.click(pasteTab);

    const titleInput = screen.getByPlaceholderText(/Biology Chapter 4/i);
    const contentTextarea = screen.getByPlaceholderText(/Paste your syllabus/i);

    fireEvent.change(titleInput, { target: { value: 'Quantum Physics' } });
    fireEvent.change(contentTextarea, {
      target: {
        value: 'Heisenberg uncertainty principle states that position and momentum cannot both be precisely measured.',
      },
    });

    const addBtn = screen.getByRole('button', { name: /Add Notes Document/i });
    fireEvent.click(addBtn);

    const storeDocs = useStudyStore.getState().documents;
    expect(storeDocs).toHaveLength(1);
    expect(storeDocs[0].name).toBe('Quantum Physics');
    expect(storeDocs[0].content).toContain('Heisenberg uncertainty');
  });
});
