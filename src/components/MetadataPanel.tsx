'use client';

import type { ItemMetadata } from '@/types';
import { ChartIcon } from './icons';

interface MetadataPanelProps {
  metadata: ItemMetadata;
  onOpenAnalytics: () => void;
}

// Helper to get maker info based on item type
function getMakerInfo(metadata: ItemMetadata) {
  const itemType = metadata.item_type;

  if (itemType === 'tosogu') {
    return {
      name: metadata.maker?.name_romaji || metadata.mei?.smith_name_romaji || 'Unknown',
      kanji: metadata.maker?.name_kanji || metadata.mei?.smith_name_kanji,
      school: metadata.maker?.school,
      tradition: null, // tosogu doesn't have tradition
      lineage: metadata.maker?.lineage,
      label: 'Maker',
    };
  }

  if (itemType === 'koshirae') {
    return {
      name: metadata.fittings_maker?.primary_artisan || 'Unknown',
      kanji: metadata.fittings_maker?.primary_artisan_kanji,
      school: metadata.fittings_maker?.school,
      tradition: null,
      lineage: null,
      label: 'Artisan',
    };
  }

  // Default: token (blade)
  return {
    name: metadata.mei?.smith_name_romaji || metadata.smith?.name_romaji || 'Unknown',
    kanji: metadata.mei?.smith_name_kanji || metadata.smith?.name_kanji,
    school: metadata.smith?.school,
    tradition: metadata.smith?.tradition,
    lineage: metadata.smith?.lineage,
    label: 'Smith',
  };
}

// Helper to get display type based on item type
function getDisplayType(metadata: ItemMetadata) {
  const itemType = metadata.item_type;

  if (itemType === 'tosogu') {
    return metadata.fitting_type || 'tosogu';
  }

  if (itemType === 'koshirae') {
    return metadata.mounting_type || 'koshirae';
  }

  return metadata.blade_type || 'blade';
}

export function MetadataPanel({ metadata, onOpenAnalytics }: MetadataPanelProps) {
  const makerInfo = getMakerInfo(metadata);
  const displayType = getDisplayType(metadata);
  const isTosogu = metadata.item_type === 'tosogu';
  const isKoshirae = metadata.item_type === 'koshirae';
  const isBlade = !isTosogu && !isKoshirae;

  const period = metadata.era?.period;
  const subPeriod = metadata.era?.sub_period;
  const year = metadata.era?.western_year;

  // Format measurements (primarily for blades)
  const nagasa = metadata.measurements?.nagasa;
  const sori = metadata.measurements?.sori;
  const motohaba = metadata.measurements?.motohaba;
  const sakihaba = metadata.measurements?.sakihaba;
  const nakago = metadata.measurements?.nakago_nagasa;

  // Provenance
  const denrai = metadata.provenance?.denrai?.join(', ');
  const meiStatus = metadata.mei?.status;

  return (
    <div className="bg-[var(--surface)] border-l border-[var(--border)] h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Maker Header */}
        <div className="pb-6 border-b border-[var(--border-subtle)]">
          {makerInfo.school && (
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-2">{makerInfo.school}</div>
          )}
          <h2 className="text-2xl font-medium text-[var(--text-primary)] tracking-wide">
            {makerInfo.name.toUpperCase()}
          </h2>
          {makerInfo.kanji && (
            <div className="text-xl text-[var(--text-accent)] mt-1 font-jp">{makerInfo.kanji}</div>
          )}
          {makerInfo.lineage && (
            <div className="text-sm text-[var(--text-muted)] mt-2 italic">— {makerInfo.lineage}</div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-[var(--surface-elevated)] rounded text-sm text-[var(--text-secondary)] capitalize">
              {displayType}
            </span>
            <span className="px-2 py-1 bg-[var(--surface-elevated)] rounded text-sm text-[var(--text-secondary)]">
              {metadata.classification === 'tokubetsu-juyo' ? 'Tokuju' : 'Jūyō'} {metadata.session_number}
            </span>
            {(isTosogu || isKoshirae) && (
              <span className="px-2 py-1 bg-[var(--accent)]/20 rounded text-sm text-[var(--accent)] capitalize">
                {metadata.item_type}
              </span>
            )}
          </div>
          {isBlade && nagasa && (
            <div className="text-sm text-[var(--text-muted)] mt-3">
              {nagasa} cm · {(nagasa / 30.3).toFixed(2)} 尺
            </div>
          )}
        </div>

        {/* Tradition & Era */}
        {(makerInfo.tradition || period) && (
          <div className="pb-6 border-b border-[var(--border-subtle)]">
            {makerInfo.tradition && (
              <>
                <div className="meta-label">Tradition · 伝</div>
                <div className="meta-value text-lg">{makerInfo.tradition}</div>
              </>
            )}
            {period && (
              <div className={makerInfo.tradition ? "text-sm text-[var(--text-secondary)] mt-1" : ""}>
                {!makerInfo.tradition && <div className="meta-label">Era · 時代</div>}
                <div className={makerInfo.tradition ? "" : "meta-value"}>
                  {subPeriod && <span className="capitalize">{subPeriod} </span>}
                  {period}
                  {year && <span className="text-[var(--text-muted)]"> · ca. {year}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Signature/Mei */}
        {meiStatus && (
          <div className="pb-6 border-b border-[var(--border-subtle)]">
            <div className="meta-label">Mei · 銘</div>
            <div className="meta-value capitalize">{meiStatus.replace(/-/g, ' ')}</div>
            {metadata.mei?.inscription_omote && (
              <div className="text-sm text-[var(--text-secondary)] mt-2 font-jp">
                <span className="text-[var(--text-muted)]">表:</span> {metadata.mei.inscription_omote}
              </div>
            )}
            {metadata.mei?.inscription_ura && (
              <div className="text-sm text-[var(--text-secondary)] font-jp">
                <span className="text-[var(--text-muted)]">裏:</span> {metadata.mei.inscription_ura}
              </div>
            )}
          </div>
        )}

        {/* Provenance */}
        {denrai && (
          <div className="pb-6 border-b border-[var(--border-subtle)]">
            <div className="meta-label">Denrai · 伝来</div>
            <div className="meta-value">{denrai}</div>
          </div>
        )}

        {/* Measurements - only for blades */}
        {isBlade && nagasa && (
          <div className="pb-6 border-b border-[var(--border-subtle)]">
            <div className="meta-label">Measurements · 法量</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Nagasa</span>
                <div className="text-[var(--text-primary)]">{nagasa} cm</div>
              </div>
              {sori !== null && sori !== undefined && (
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Sori</span>
                  <div className="text-[var(--text-primary)]">{sori} cm</div>
                </div>
              )}
              {motohaba && (
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Motohaba</span>
                  <div className="text-[var(--text-primary)]">{motohaba} cm</div>
                </div>
              )}
              {sakihaba && (
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Sakihaba</span>
                  <div className="text-[var(--text-primary)]">{sakihaba} cm</div>
                </div>
              )}
              {nakago && (
                <div>
                  <span className="text-xs text-[var(--text-muted)]">Nakago</span>
                  <div className="text-[var(--text-primary)]">{nakago} cm</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tosogu set info */}
        {isTosogu && metadata.set_type && (
          <div className="pb-6 border-b border-[var(--border-subtle)]">
            <div className="meta-label">Set Type</div>
            <div className="meta-value capitalize">{metadata.set_type.type}</div>
            {metadata.set_type.components && metadata.set_type.components.length > 0 && (
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                {metadata.set_type.components.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Koshirae style info */}
        {isKoshirae && metadata.style?.overall && (
          <div className="pb-6 border-b border-[var(--border-subtle)]">
            <div className="meta-label">Style</div>
            <div className="meta-value">{metadata.style.overall}</div>
            {metadata.style.style_tags && metadata.style.style_tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {metadata.style.style_tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[var(--surface-elevated)] rounded text-xs text-[var(--text-secondary)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Button */}
        <button
          onClick={onOpenAnalytics}
          className="w-full btn-accent flex items-center justify-center gap-2"
        >
          <ChartIcon className="w-5 h-5" />
          View Full Analytics
        </button>

        {/* Designation info */}
        {metadata.designation_date && (
          <div className="text-center text-xs text-[var(--text-muted)] pt-2">
            Designated {metadata.designation_date}
          </div>
        )}
      </div>
    </div>
  );
}
