'use client';

import ReactMarkdown from 'react-markdown';
import { GlossaryTerm } from '@/components/GlossaryTerm';

type TextLang = 'english' | 'japanese';

interface TextPanelProps {
  japaneseText: string | null;
  translationMarkdown: string | null;
  textLang: TextLang;
  onSetTextLang: (lang: TextLang) => void;
  collapsed: boolean;
}

// Markdown components for desktop view
const baseComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-base font-semibold text-[var(--text-primary)] mt-0 mb-3 pb-2 border-b border-[var(--border-subtle)]">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-2 pb-1 border-b border-[var(--border-subtle)]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 text-[var(--text-secondary)]">
      {children}
    </p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-[var(--text-primary)]">
      {children}
    </strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="my-3 pl-4 space-y-1.5 list-disc list-outside marker:text-[var(--text-muted)]">
      {children}
    </ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[var(--text-secondary)]">
      {children}
    </li>
  ),
  hr: () => (
    <hr className="my-4 border-[var(--border-subtle)]" />
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-3 italic text-[var(--text-tertiary)]">
      {children}
    </blockquote>
  ),
};

export function TextPanel({
  japaneseText,
  translationMarkdown,
  textLang,
  onSetTextLang,
  collapsed,
}: TextPanelProps) {
  const hasText = japaneseText || translationMarkdown;
  const hasBoth = japaneseText && translationMarkdown;
  if (!hasText) return null;

  return (
    <div
      className={`hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] flex-shrink-0 transition-all duration-300 ${
        collapsed ? 'w-0 min-w-0 overflow-hidden border-r-0' : 'w-[32vw] min-w-[320px] max-w-[480px]'
      }`}
      role="region"
      aria-label="Item text content"
    >
      {/* Language Toggle - Scholarly style */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3" role="tablist">
          {translationMarkdown && (
            <button
              role="tab"
              aria-selected={textLang === 'english'}
              onClick={() => onSetTextLang('english')}
              className={`text-[11px] uppercase tracking-widest transition-colors focus:outline-none ${
                textLang === 'english'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Translation
            </button>
          )}
          {hasBoth && (
            <span className="text-[var(--border)] select-none">·</span>
          )}
          {japaneseText && (
            <button
              role="tab"
              aria-selected={textLang === 'japanese'}
              onClick={() => onSetTextLang('japanese')}
              className={`text-[11px] transition-colors focus:outline-none ${
                textLang === 'japanese'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              原文
            </button>
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 overflow-y-auto p-4" role="tabpanel">
        {textLang === 'english' && translationMarkdown ? (
          <article className="text-[13px] leading-[1.7]">
            <ReactMarkdown
              components={{
                ...baseComponents,
                em: ({ children }: { children?: React.ReactNode }) => (
                  <GlossaryTerm>{children}</GlossaryTerm>
                ),
              }}
            >
              {translationMarkdown}
            </ReactMarkdown>
          </article>
        ) : japaneseText ? (
          <div className="font-jp text-[13px] whitespace-pre-wrap leading-[1.9] text-[var(--text-secondary)]">
            {japaneseText}
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm">No text available</p>
        )}
      </div>
    </div>
  );
}

// Mobile text panel component
export function MobileTextPanel({
  japaneseText,
  translationMarkdown,
  textLang,
  onSetTextLang,
  onShowDetails,
}: {
  japaneseText: string | null;
  translationMarkdown: string | null;
  textLang: TextLang;
  onSetTextLang: (lang: TextLang) => void;
  onShowDetails: () => void;
}) {
  const hasText = japaneseText || translationMarkdown;
  const hasBoth = japaneseText && translationMarkdown;

  return (
    <div className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Language toggle - scholarly style */}
        <div className="flex items-center gap-3" role="tablist">
          {translationMarkdown && (
            <button
              role="tab"
              aria-selected={textLang === 'english'}
              onClick={() => onSetTextLang('english')}
              className={`text-[11px] uppercase tracking-widest transition-colors focus:outline-none ${
                textLang === 'english' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              Translation
            </button>
          )}
          {hasBoth && (
            <span className="text-[var(--border)] select-none">·</span>
          )}
          {japaneseText && (
            <button
              role="tab"
              aria-selected={textLang === 'japanese'}
              onClick={() => onSetTextLang('japanese')}
              className={`text-[11px] transition-colors focus:outline-none ${
                textLang === 'japanese' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              原文
            </button>
          )}
        </div>

        <button
          onClick={onShowDetails}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          Details
        </button>
      </div>

      {/* Mobile Text Content */}
      {hasText && (
        <div className="max-h-56 overflow-y-auto p-4" role="tabpanel">
          {textLang === 'english' && translationMarkdown ? (
            <article className="text-[13px] leading-[1.7]">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-[13px] font-semibold text-[var(--text-primary)] mt-4 mb-1.5">{children}</h2>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2.5 text-[var(--text-secondary)]">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <GlossaryTerm>{children}</GlossaryTerm>
                  ),
                }}
              >
                {translationMarkdown}
              </ReactMarkdown>
            </article>
          ) : japaneseText ? (
            <div className="font-jp text-[13px] whitespace-pre-wrap text-[var(--text-secondary)] leading-[1.8]">
              {japaneseText}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
