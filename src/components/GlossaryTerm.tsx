'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { findTerm, type GlossaryEntry } from '@/lib/glossary';

interface GlossaryTermProps {
  children: React.ReactNode;
}

export function GlossaryTerm({ children }: GlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<GlossaryEntry | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
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

  // Position tooltip relative to viewport using portal
  useEffect(() => {
    if (isOpen && termRef.current) {
      const rect = termRef.current.getBoundingClientRect();
      const tooltipWidth = 288; // w-72 = 18rem = 288px
      const tooltipHeight = 150; // approximate height
      const padding = 8;

      // Calculate horizontal position
      let left = rect.left;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      if (left < padding) {
        left = padding;
      }

      // Calculate vertical position
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top: number;
      if (spaceBelow >= tooltipHeight + padding || spaceBelow >= spaceAbove) {
        // Show below
        top = rect.bottom + 8;
      } else {
        // Show above
        top = rect.top - tooltipHeight - 8;
      }

      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
      });
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

    // Close on scroll
    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // If no glossary entry found, just render as styled text
  if (!entry) {
    return (
      <span className="text-[var(--accent)] font-medium">
        {children}
      </span>
    );
  }

  const tooltip = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="z-[9999] p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xl animate-fadeIn"
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
            {entry.category.replace(/_/g, ' ')}
          </span>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={termRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-[var(--accent)] font-medium hover:text-[var(--accent-light)] cursor-pointer transition-colors"
      >
        {children}
      </button>
      {tooltip}
    </>
  );
}
