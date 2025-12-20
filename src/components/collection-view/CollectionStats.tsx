'use client';

import type { CollectionStats } from '@/types';

interface CollectionStatsDisplayProps {
  stats: CollectionStats;
}

interface StatBarProps {
  label: string;
  count: number;
  total: number;
  color?: string;
}

function StatBar({ label, count, total, color = 'var(--accent)' }: StatBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--text-secondary)] truncate">{label}</span>
        <span className="text-[var(--text-muted)] ml-2">{count}</span>
      </div>
      <div className="h-1.5 bg-[var(--surface-elevated)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface StatSectionProps {
  title: string;
  data: Record<string, number>;
  total: number;
  maxItems?: number;
}

function StatSection({ title, data, total, maxItems = 6 }: StatSectionProps) {
  const entries = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{title}</div>
      <div className="space-y-2">
        {entries.map(([label, count]) => (
          <StatBar key={label} label={label} count={count} total={total} />
        ))}
      </div>
    </div>
  );
}

export function CollectionStatsDisplay({ stats }: CollectionStatsDisplayProps) {
  return (
    <div className="p-4 space-y-5">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface-elevated)] rounded-lg p-3 text-center">
          <div className="text-2xl font-light text-[var(--accent)]">{stats.totalItems}</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Total Items</div>
        </div>
        <div className="bg-[var(--surface-elevated)] rounded-lg p-3 text-center">
          <div className="text-2xl font-light text-[var(--text-primary)]">{stats.withTranslation}</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Translated</div>
        </div>
      </div>

      {/* Measurements */}
      {stats.avgNagasa !== null && (
        <div className="bg-[var(--surface-elevated)] rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Nagasa (Blade Length)</div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-secondary)]">Average</span>
            <span className="text-[var(--text-primary)]">{stats.avgNagasa.toFixed(1)} cm</span>
          </div>
          {stats.nagasaRange && (
            <div className="flex justify-between text-xs mt-1">
              <span className="text-[var(--text-secondary)]">Range</span>
              <span className="text-[var(--text-primary)]">
                {stats.nagasaRange.min.toFixed(1)} – {stats.nagasaRange.max.toFixed(1)} cm
              </span>
            </div>
          )}
        </div>
      )}

      {/* Era Distribution */}
      <StatSection title="By Era" data={stats.byEra} total={stats.totalItems} />

      {/* Tradition Distribution */}
      <StatSection title="By Tradition" data={stats.byTradition} total={stats.totalItems} maxItems={5} />

      {/* School Distribution */}
      <StatSection title="Top Schools" data={stats.bySchool} total={stats.totalItems} maxItems={5} />

      {/* Blade Type Distribution */}
      <StatSection title="By Blade Type" data={stats.byBladeType} total={stats.totalItems} />

      {/* Mei Status */}
      <StatSection title="Signature Status" data={stats.byMeiStatus} total={stats.totalItems} maxItems={4} />
    </div>
  );
}

/**
 * Utility function to compute stats from a list of items
 */
export function computeCollectionStats(items: {
  hasTranslation: boolean;
  bladeType?: string;
  school?: string;
  nagasa?: number;
  // Extended properties from full metadata if available
  era?: string;
  tradition?: string;
  meiStatus?: string;
}[]): CollectionStats {
  const stats: CollectionStats = {
    totalItems: items.length,
    withTranslation: 0,
    byEra: {},
    bySchool: {},
    byTradition: {},
    byBladeType: {},
    byMeiStatus: {},
    avgNagasa: null,
    nagasaRange: null,
  };

  let nagasaSum = 0;
  let nagasaCount = 0;
  let minNagasa = Infinity;
  let maxNagasa = -Infinity;

  items.forEach(item => {
    if (item.hasTranslation) stats.withTranslation++;

    if (item.era) {
      stats.byEra[item.era] = (stats.byEra[item.era] || 0) + 1;
    }

    if (item.school) {
      stats.bySchool[item.school] = (stats.bySchool[item.school] || 0) + 1;
    }

    if (item.tradition) {
      stats.byTradition[item.tradition] = (stats.byTradition[item.tradition] || 0) + 1;
    }

    if (item.bladeType) {
      stats.byBladeType[item.bladeType] = (stats.byBladeType[item.bladeType] || 0) + 1;
    }

    if (item.meiStatus) {
      stats.byMeiStatus[item.meiStatus] = (stats.byMeiStatus[item.meiStatus] || 0) + 1;
    }

    if (item.nagasa !== undefined && item.nagasa !== null) {
      nagasaSum += item.nagasa;
      nagasaCount++;
      minNagasa = Math.min(minNagasa, item.nagasa);
      maxNagasa = Math.max(maxNagasa, item.nagasa);
    }
  });

  if (nagasaCount > 0) {
    stats.avgNagasa = nagasaSum / nagasaCount;
    stats.nagasaRange = { min: minNagasa, max: maxNagasa };
  }

  return stats;
}
