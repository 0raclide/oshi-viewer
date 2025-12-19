'use client';

import { useState, useRef, useEffect } from 'react';
import { findTerm, type GlossaryEntry } from '@/lib/glossary';

interface GlossaryTermProps {
  children: React.ReactNode;
}

export function GlossaryTerm({ children }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<GlossaryEntry | null>(null);
  const [position, setPosition] = useState<'above' | 'below'>('below');
  const termRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Extract text content from children
  const termText = typeof children === 'string'
    ? children
    : (children as React.ReactElement)?.props?.children || '';

  useEffect(() => {
    if (termText) {
      const found = findTerm(termText);
      setEntry(found || null);
    }
  }, [termText]);

  useEffect(() => {
    if (isOpen && termRef.current) {
      const rect = termRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If less than 200px below, show above
      setPosition(spaceBelow < 200 && spaceAbove > spaceBelow ? 'above' : 'below');
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        termRef.current &&
        !termRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // If no glossary entry found, just render as styled text
  if (!entry) {
    return (
      <span className="text-[var(--accent)] font-medium">
        {children}
      </span>
    );
  }

  return (
    <span className="relative inline">
      <button
        ref={termRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-[var(--accent)] font-medium hover:text-[var(--accent-light)] border-b border-[var(--accent)]/40 hover:border-[var(--accent)] cursor-pointer transition-all"
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 left-0 w-72 p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] shadow-lg animate-fadeIn ${
            position === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* Header */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {entry.term}
            </span>
            {entry.kanji && (
              <span className="text-sm text-[var(--accent)] font-jp">
                {entry.kanji}
              </span>
            )}
            {entry.reading && (
              <span className="text-xs text-[var(--text-muted)] italic">
                {entry.reading}
              </span>
            )}
          </div>

          {/* Definition */}
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {entry.definition}
          </p>

          {/* Category badge */}
          {entry.category && (
            <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                {entry.category}
              </span>
            </div>
          )}
        </div>
      )}
    </span>
  );
}
