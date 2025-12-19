'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, XIcon } from './icons';

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ initialQuery = '', placeholder = 'Search items...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, router]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative group">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors duration-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg py-3 pl-11 pr-10 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-glow)] focus:bg-[var(--surface)] transition-all duration-300 shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all duration-200"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
