'use client';

import type { CollectionStats as CollectionStatsType } from '@/types';

interface ContextPanelProps {
  stats: CollectionStatsType;
  filteredCount: number;
  totalCount: number;
}

interface StatBarProps {
  label: string;
  count: number;
  maxCount: number;
}

function StatBar({ label, count, maxCount }: StatBarProps) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-[var(--text-secondary)] truncate flex-1 min-w-0">{label}</span>
      <div className="w-16 h-1 bg-[var(--surface-elevated)] rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] text-[var(--text-muted)] w-8 text-right tabular-nums flex-shrink-0">
        {count}
      </span>
    </div>
  );
}

interface StatSectionProps {
  title: string;
  data: Record<string, number>;
  maxItems?: number;
}

function StatSection({ title, data, maxItems = 5 }: StatSectionProps) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems);

  if (entries.length === 0) return null;

  const maxCount = entries[0]?.[1] || 1;

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">{title}</div>
      <div>
        {entries.map(([label, count]) => (
          <StatBar key={label} label={label} count={count} maxCount={maxCount} />
        ))}
      </div>
    </div>
  );
}

export function ContextPanel({ stats, filteredCount, totalCount }: ContextPanelProps) {
  const isFiltered = filteredCount !== totalCount;

  return (
    <div className="h-full w-full flex flex-col bg-[var(--surface)] border-l border-[var(--border)]">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[var(--border)] flex-shrink-0">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Overview</h2>
        {isFiltered && (
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
            {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} items
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Key Numbers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[var(--surface-elevated)] rounded-lg p-3 text-center">
            <div className="text-xl font-light text-[var(--accent)] tabular-nums">
              {stats.totalItems.toLocaleString()}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Items</div>
          </div>
          <div className="bg-[var(--surface-elevated)] rounded-lg p-3 text-center">
            <div className="text-xl font-light text-[var(--text-primary)] tabular-nums">
              {stats.withTranslation.toLocaleString()}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Translated</div>
          </div>
        </div>

        {/* Blade Length */}
        {stats.avgNagasa !== null && (
          <div className="bg-[var(--surface-elevated)] rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Blade Length</div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-secondary)]">Average</span>
              <span className="text-[var(--text-primary)] tabular-nums">{stats.avgNagasa.toFixed(1)} cm</span>
            </div>
            {stats.nagasaRange && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[var(--text-secondary)]">Range</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  {stats.nagasaRange.min.toFixed(1)}–{stats.nagasaRange.max.toFixed(1)} cm
                </span>
              </div>
            )}
          </div>
        )}

        {/* Distribution Sections */}
        <StatSection title="By Era" data={stats.byEra} maxItems={5} />
        <StatSection title="By Type" data={stats.byBladeType} maxItems={5} />
        <StatSection title="Top Schools" data={stats.bySchool} maxItems={5} />
        <StatSection title="By Tradition" data={stats.byTradition} maxItems={4} />
      </div>
    </div>
  );
}
