'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { SearchIcon, XIcon, ChevronRightIcon } from '@/components/icons';
import type { CollectionFilters, FilterFacets, Collection, ItemType } from '@/types';

interface FilterPanelProps {
  filters: CollectionFilters;
  facets: FilterFacets;
  onFilterChange: <K extends keyof CollectionFilters>(key: K, value: CollectionFilters[K]) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  onCollapse?: () => void;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

// Distribution bar component
const DistributionBar = memo(function DistributionBar({
  count,
  maxCount,
  selected
}: {
  count: number;
  maxCount: number;
  selected: boolean;
}) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="absolute inset-0 overflow-hidden rounded">
      <div
        className={`h-full transition-all duration-200 ${
          selected
            ? 'bg-[var(--accent)]'
            : 'bg-[var(--accent)]/10'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});

// Searchable filter section with distribution bars
const SearchableFilterSection = memo(function SearchableFilterSection({
  title,
  options,
  selected,
  onSelect,
  searchable = false,
  defaultExpanded = false,
  showBars = true,
}: {
  title: string;
  options: FilterOption[];
  selected: string | undefined;
  onSelect: (value: string | undefined) => void;
  searchable?: boolean;
  defaultExpanded?: boolean;
  showBars?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded || !!selected);
  const [search, setSearch] = useState('');

  const maxCount = useMemo(() =>
    Math.max(...options.map(o => o.count), 1),
    [options]
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter(o =>
      o.label.toLowerCase().includes(query) ||
      o.value.toLowerCase().includes(query)
    );
  }, [options, search]);

  const handleSelect = useCallback((value: string) => {
    onSelect(selected === value ? undefined : value);
  }, [selected, onSelect]);

  if (options.length === 0) return null;

  return (
    <div className="border-b border-[var(--border-subtle)]">
      {/* Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="w-full flex items-center justify-between py-2.5 px-4 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {selected && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          )}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)] tabular-nums" aria-label={`${options.length} options`}>{options.length}</span>
          <ChevronRightIcon
            className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
              expanded ? 'rotate-90' : ''
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Expanded Content */}
      <div
        id={`filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? 'max-h-[400px]' : 'max-h-0'
        }`}
      >
        <div className="px-3 pb-2" role="listbox" aria-label={`${title} filter options`}>
          {/* Search Input */}
          {searchable && options.length > 8 && (
            <div className="relative mb-2">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full pl-7 pr-7 py-1.5 text-xs bg-[var(--surface-elevated)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] text-center py-3">
                No matches found
              </div>
            ) : (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={selected === option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`relative w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
                    selected === option.value
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {showBars && (
                    <DistributionBar
                      count={option.count}
                      maxCount={maxCount}
                      selected={selected === option.value}
                    />
                  )}
                  <span className="relative z-10 truncate flex-1 text-left">{option.label}</span>
                  <span className={`relative z-10 text-[10px] tabular-nums ml-2 ${
                    selected === option.value ? 'text-white/80' : 'text-[var(--text-muted)]'
                  }`}>
                    {option.count.toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// Active filter chip
const FilterChip = memo(function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-[10px] font-medium">
      <span className="truncate max-w-[100px]">{label}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="w-3.5 h-3.5 rounded-full bg-[var(--accent)]/20 hover:bg-[var(--accent)]/40 flex items-center justify-center transition-colors"
      >
        <XIcon className="w-2 h-2" aria-hidden="true" />
      </button>
    </span>
  );
});

// Quick filter button
const QuickFilter = memo(function QuickFilter({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={count !== undefined ? `${label}: ${count.toLocaleString()} items` : label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
        active
          ? 'bg-[var(--accent)] text-white'
          : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={active ? 'text-white/70' : 'text-[var(--text-muted)]'} aria-hidden="true">
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
});

export function FilterPanel({
  filters,
  facets,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
  onCollapse,
}: FilterPanelProps) {
  // Determine if we should show sword-specific filters
  const isSwordsContext = !filters.itemType || filters.itemType === 'token';

  // Get contextual labels based on item type
  const typeLabel = useMemo(() => {
    switch (filters.itemType) {
      case 'tosogu': return 'Fitting Type';
      case 'koshirae': return 'Mounting Type';
      default: return 'Type';
    }
  }, [filters.itemType]);

  const makerLabel = useMemo(() => {
    switch (filters.itemType) {
      case 'tosogu':
      case 'koshirae':
        return 'Maker';
      default: return 'Smith';
    }
  }, [filters.itemType]);

  // Tradition label - "Tradition" for swords (Yamashiro, Bizen), "Lineage" for tosogu/koshirae
  const traditionLabel = useMemo(() => {
    switch (filters.itemType) {
      case 'tosogu':
      case 'koshirae':
        return 'Lineage';
      default: return 'Tradition';
    }
  }, [filters.itemType]);

  // Build active filters list
  const activeFilters = useMemo(() => {
    const active: { key: keyof CollectionFilters; label: string; value: string }[] = [];

    if (filters.itemType) {
      const typeLabels: Record<ItemType, string> = {
        'token': 'Swords',
        'tosogu': 'Tosogu',
        'koshirae': 'Koshirae',
      };
      active.push({
        key: 'itemType',
        label: typeLabels[filters.itemType] || filters.itemType,
        value: filters.itemType,
      });
    }
    if (filters.collection) {
      active.push({
        key: 'collection',
        label: filters.collection === 'Tokuju' ? 'Tokubetsu Jūyō' : 'Jūyō',
        value: filters.collection,
      });
    }
    if (filters.isEnsemble) {
      active.push({ key: 'isEnsemble', label: 'Ensemble', value: 'true' });
    }
    if (filters.era) {
      active.push({ key: 'era', label: filters.era, value: filters.era });
    }
    if (filters.tradition) {
      active.push({ key: 'tradition', label: filters.tradition, value: filters.tradition });
    }
    if (filters.school) {
      active.push({ key: 'school', label: filters.school, value: filters.school });
    }
    if (filters.bladeType) {
      active.push({ key: 'bladeType', label: filters.bladeType, value: filters.bladeType });
    }
    if (filters.smith) {
      active.push({ key: 'smith', label: filters.smith, value: filters.smith });
    }
    if (filters.meiStatus) {
      active.push({ key: 'meiStatus', label: filters.meiStatus.replace(/-/g, ' '), value: filters.meiStatus });
    }
    if (filters.nakagoCondition) {
      active.push({ key: 'nakagoCondition', label: filters.nakagoCondition, value: filters.nakagoCondition });
    }
    if (filters.denrai) {
      active.push({ key: 'denrai', label: filters.denrai, value: filters.denrai });
    }
    if (filters.kiwame) {
      active.push({ key: 'kiwame', label: filters.kiwame, value: filters.kiwame });
    }

    return active;
  }, [filters]);

  // Top eras for quick filters
  const topEras = useMemo(() =>
    facets.eras.slice(0, 4),
    [facets.eras]
  );

  // Top types for quick filters (blade types, fitting types, or mounting types)
  const topTypes = useMemo(() =>
    facets.bladeTypes.slice(0, 4),
    [facets.bladeTypes]
  );

  const handleRemoveFilter = useCallback((key: keyof CollectionFilters) => {
    onFilterChange(key, undefined);
  }, [onFilterChange]);

  return (
    <nav className="h-full w-full flex flex-col bg-[var(--surface)]" role="navigation" aria-label="Collection filters">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] flex-shrink-0">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Filters</h2>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              aria-label={`Clear all ${activeFilterCount} filters`}
              className="text-xs text-[var(--accent)] hover:underline transition-colors"
            >
              Clear all
            </button>
          )}
          {onCollapse && (
            <button
              onClick={onCollapse}
              aria-label="Hide filters panel"
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevated)] transition-all"
              title="Hide filters"
            >
              <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-elevated)]/30">
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(f => (
              <FilterChip
                key={f.key}
                label={f.label}
                onRemove={() => handleRemoveFilter(f.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Item Type</div>

        {/* Item Type Toggle - Most important filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <QuickFilter
            label="Swords"
            active={filters.itemType === 'token'}
            onClick={() => onFilterChange('itemType', filters.itemType === 'token' ? undefined : 'token' as ItemType)}
          />
          <QuickFilter
            label="Tosogu"
            active={filters.itemType === 'tosogu'}
            onClick={() => onFilterChange('itemType', filters.itemType === 'tosogu' ? undefined : 'tosogu' as ItemType)}
          />
          <QuickFilter
            label="Koshirae"
            active={filters.itemType === 'koshirae'}
            onClick={() => onFilterChange('itemType', filters.itemType === 'koshirae' ? undefined : 'koshirae' as ItemType)}
          />
          <QuickFilter
            label="Ensembles"
            active={filters.isEnsemble === true}
            onClick={() => onFilterChange('isEnsemble', filters.isEnsemble ? undefined : true)}
          />
        </div>

        <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">Quick Filters</div>

        {/* Collection Toggle */}
        <div className="flex gap-1.5 mb-2">
          <QuickFilter
            label="Tokuju"
            active={filters.collection === 'Tokuju'}
            onClick={() => onFilterChange('collection', filters.collection === 'Tokuju' ? undefined : 'Tokuju' as Collection)}
          />
          <QuickFilter
            label="Jūyō"
            active={filters.collection === 'Juyo'}
            onClick={() => onFilterChange('collection', filters.collection === 'Juyo' ? undefined : 'Juyo' as Collection)}
          />
        </div>

        {/* Top Eras */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {topEras.map(era => (
            <QuickFilter
              key={era.value}
              label={era.label}
              count={era.count}
              active={filters.era === era.value}
              onClick={() => onFilterChange('era', filters.era === era.value ? undefined : era.value)}
            />
          ))}
        </div>

        {/* Top Types (adapts to item type context) */}
        {topTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topTypes.map(type => (
              <QuickFilter
                key={type.value}
                label={type.label}
                count={type.count}
                active={filters.bladeType === type.value}
                onClick={() => onFilterChange('bladeType', filters.bladeType === type.value ? undefined : type.value)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detailed Filter Sections */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Era */}
        <SearchableFilterSection
          title="Era"
          options={facets.eras}
          selected={filters.era}
          onSelect={(v) => onFilterChange('era', v)}
          defaultExpanded={false}
        />

        {/* Tradition/Lineage - Label adapts to context */}
        <SearchableFilterSection
          title={traditionLabel}
          options={facets.traditions}
          selected={filters.tradition}
          onSelect={(v) => onFilterChange('tradition', v)}
        />

        {/* School - Searchable */}
        <SearchableFilterSection
          title="School"
          options={facets.schools}
          selected={filters.school}
          onSelect={(v) => onFilterChange('school', v)}
          searchable
        />

        {/* Type - Label adapts to context */}
        <SearchableFilterSection
          title={typeLabel}
          options={facets.bladeTypes}
          selected={filters.bladeType}
          onSelect={(v) => onFilterChange('bladeType', v)}
        />

        {/* Maker/Smith - Label adapts to context */}
        <SearchableFilterSection
          title={makerLabel}
          options={facets.smiths}
          selected={filters.smith}
          onSelect={(v) => onFilterChange('smith', v)}
          searchable
        />

        {/* Mei Status */}
        <SearchableFilterSection
          title="Mei Status"
          options={facets.meiStatuses}
          selected={filters.meiStatus}
          onSelect={(v) => onFilterChange('meiStatus', v)}
          showBars
        />

        {/* Nakago Condition - Only for swords */}
        {isSwordsContext && (
          <SearchableFilterSection
            title="Nakago"
            options={facets.nakagoConditions}
            selected={filters.nakagoCondition}
            onSelect={(v) => onFilterChange('nakagoCondition', v)}
            showBars
          />
        )}

        {/* Denrai (Provenance) */}
        {facets.denrais && facets.denrais.length > 0 && (
          <SearchableFilterSection
            title="Denrai"
            options={facets.denrais}
            selected={filters.denrai}
            onSelect={(v) => onFilterChange('denrai', v)}
            searchable
          />
        )}

        {/* Kiwame (Appraiser) */}
        {facets.kiwames && facets.kiwames.length > 0 && (
          <SearchableFilterSection
            title="Kiwame"
            options={facets.kiwames}
            selected={filters.kiwame}
            onSelect={(v) => onFilterChange('kiwame', v)}
            searchable
          />
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
        {facets.eras.length > 0 && (
          <span>{facets.schools.length} schools · {facets.smiths.length} {isSwordsContext ? 'smiths' : 'makers'}</span>
        )}
      </div>
    </nav>
  );
}
