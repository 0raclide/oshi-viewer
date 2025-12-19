'use client';

import { useState } from 'react';
import type { ItemMetadata } from '@/types';
import { XIcon, ChevronRightIcon } from './icons';

interface DeepAnalyticsProps {
  metadata: ItemMetadata;
  onClose: () => void;
}

interface SectionProps {
  title: string;
  titleJa?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, titleJa, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 bg-[var(--surface)] flex items-center justify-between hover:bg-[var(--hover)] transition-colors"
      >
        <span className="font-medium text-[var(--text-primary)]">
          {title}
          {titleJa && <span className="text-[var(--text-muted)] ml-2 font-jp">({titleJa})</span>}
        </span>
        <ChevronRightIcon
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-5 py-4 bg-[var(--background)] space-y-3 border-t border-[var(--border-subtle)]">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, labelJa }: { label: string; value: React.ReactNode; labelJa?: string }) {
  if (!value && value !== 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <span className="text-sm text-[var(--text-muted)] min-w-[160px]">
        {label}
        {labelJa && <span className="ml-1 font-jp">({labelJa})</span>}
      </span>
      <span className="text-sm text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function ArrayField({ label, values, labelJa }: { label: string; values?: string[]; labelJa?: string }) {
  if (!values || values.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <span className="text-sm text-[var(--text-muted)] min-w-[160px]">
        {label}
        {labelJa && <span className="ml-1 font-jp">({labelJa})</span>}
      </span>
      <span className="text-sm text-[var(--text-primary)]">{values.join(', ')}</span>
    </div>
  );
}

// Helper to get maker info based on item type
function getMakerInfo(metadata: ItemMetadata) {
  const itemType = metadata.item_type;

  if (itemType === 'tosogu') {
    return {
      name: metadata.maker?.name_romaji || metadata.mei?.smith_name_romaji || 'Unknown',
      kanji: metadata.maker?.name_kanji || metadata.mei?.smith_name_kanji,
      label: 'Maker',
    };
  }

  if (itemType === 'koshirae') {
    return {
      name: metadata.fittings_maker?.primary_artisan || 'Unknown',
      kanji: metadata.fittings_maker?.primary_artisan_kanji,
      label: 'Artisan',
    };
  }

  // Default: token (blade)
  return {
    name: metadata.mei?.smith_name_romaji || metadata.smith?.name_romaji || 'Unknown',
    kanji: metadata.mei?.smith_name_kanji || metadata.smith?.name_kanji,
    label: 'Smith',
  };
}

export function DeepAnalytics({ metadata, onClose }: DeepAnalyticsProps) {
  const makerInfo = getMakerInfo(metadata);
  const isTosogu = metadata.item_type === 'tosogu';
  const isKoshirae = metadata.item_type === 'koshirae';
  const isBlade = !isTosogu && !isKoshirae;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl bg-[var(--background)] border-l border-[var(--border)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-medium text-[var(--text-primary)]">
              Deep Analytics
              {(isTosogu || isKoshirae) && (
                <span className="ml-2 text-sm text-[var(--accent)] capitalize">({metadata.item_type})</span>
              )}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {makerInfo.name}
              {makerInfo.kanji && <span className="ml-2 font-jp text-[var(--text-accent)]">{makerInfo.kanji}</span>}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 -mr-2">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Classification */}
          <Section title="Classification" titleJa="分類">
            <Field label="Item Type" value={metadata.item_type} />
            <Field label="Classification" value={metadata.classification} />
            <Field label="Session Number" value={metadata.session_number} />
            <Field label="Designation Date" value={metadata.designation_date} />
            {isBlade && (
              <>
                <Field label="Blade Type" value={metadata.blade_type} labelJa="刀種" />
                <Field label="Length Category" value={metadata.blade_length_category} />
              </>
            )}
            {isTosogu && (
              <>
                <Field label="Fitting Type" value={metadata.fitting_type} labelJa="金具" />
                <Field label="Piece Count" value={metadata.piece_count} />
                <Field label="Set Type" value={metadata.set_type?.type} />
                <ArrayField label="Components" values={metadata.set_type?.components} />
              </>
            )}
            {isKoshirae && (
              <>
                <Field label="Mounting Type" value={metadata.mounting_type} labelJa="拵" />
                <Field label="Intended Blade" value={metadata.blade_type_intended} />
                <Field label="Style" value={metadata.style?.overall} />
                <ArrayField label="Style Tags" values={metadata.style?.style_tags} />
              </>
            )}
          </Section>

          {/* Attribution (Mei) */}
          <Section title="Attribution" titleJa="銘">
            <Field label="Status" value={metadata.mei?.status} />
            <Field label="Smith Name" value={metadata.mei?.smith_name_romaji} />
            <Field label="Smith Kanji" value={metadata.mei?.smith_name_kanji} />
            <Field label="Attribution Type" value={metadata.mei?.attribution_type} />
            <Field label="Inscription Omote" value={metadata.mei?.inscription_omote} labelJa="表" />
            <Field label="Inscription Ura" value={metadata.mei?.inscription_ura} labelJa="裏" />
            {metadata.mei?.appraiser && (
              <Field
                label="Appraiser"
                value={`${metadata.mei.appraiser.name} (${metadata.mei.appraiser.kanji})`}
              />
            )}
          </Section>

          {/* Maker Information - varies by item type */}
          {isBlade && (
            <Section title="Smith" titleJa="刀工">
              <Field label="Name (Romaji)" value={metadata.smith?.name_romaji} />
              <Field label="Name (Kanji)" value={metadata.smith?.name_kanji} />
              <Field label="School" value={metadata.smith?.school} labelJa="派" />
              <Field label="Tradition" value={metadata.smith?.tradition} labelJa="伝" />
              <Field label="Lineage" value={metadata.smith?.lineage} />
              <Field label="Generation" value={metadata.smith?.generation} />
              <Field label="Active Period" value={metadata.smith?.active_period} />
            </Section>
          )}

          {isTosogu && (
            <Section title="Maker" titleJa="金工">
              <Field label="Name (Romaji)" value={metadata.maker?.name_romaji} />
              <Field label="Name (Kanji)" value={metadata.maker?.name_kanji} />
              <Field label="School" value={metadata.maker?.school} labelJa="派" />
              <Field label="Lineage" value={metadata.maker?.lineage} />
              <Field label="Generation" value={metadata.maker?.generation} />
              <Field label="Branch" value={metadata.maker?.branch} />
              <Field label="Active Period" value={metadata.maker?.active_period} />
            </Section>
          )}

          {isKoshirae && (
            <Section title="Artisan" titleJa="職人">
              <Field label="Primary Artisan" value={metadata.fittings_maker?.primary_artisan} />
              <Field label="Artisan (Kanji)" value={metadata.fittings_maker?.primary_artisan_kanji} />
              <Field label="School" value={metadata.fittings_maker?.school} labelJa="派" />
              <Field label="Unified Set" value={metadata.fittings_maker?.unified_set ? 'Yes' : 'No'} />
            </Section>
          )}

          {/* Era */}
          <Section title="Era" titleJa="時代">
            <Field label="Period" value={metadata.era?.period} />
            <Field label="Sub-period" value={metadata.era?.sub_period} />
            <Field label="Nengo" value={metadata.era?.nengo} labelJa="年号" />
            <Field label="Western Year" value={metadata.era?.western_year ? `ca. ${metadata.era.western_year}` : null} />
          </Section>

          {/* Blade-specific sections */}
          {isBlade && (
            <>
              {/* Measurements */}
              <Section title="Measurements" titleJa="法量">
                <Field label="Nagasa (Blade Length)" value={metadata.measurements?.nagasa ? `${metadata.measurements.nagasa} cm` : null} labelJa="長さ" />
                <Field label="Sori (Curvature)" value={metadata.measurements?.sori !== null ? `${metadata.measurements?.sori} cm` : null} labelJa="反り" />
                <Field label="Motohaba (Base Width)" value={metadata.measurements?.motohaba ? `${metadata.measurements.motohaba} cm` : null} labelJa="元幅" />
                <Field label="Sakihaba (Point Width)" value={metadata.measurements?.sakihaba ? `${metadata.measurements.sakihaba} cm` : null} labelJa="先幅" />
                <Field label="Kissaki Nagasa" value={metadata.measurements?.kissaki_nagasa ? `${metadata.measurements.kissaki_nagasa} cm` : null} labelJa="切先長" />
                <Field label="Kasane (Thickness)" value={metadata.measurements?.kasane ? `${metadata.measurements.kasane} cm` : null} labelJa="重ね" />
                <Field label="Nakago Nagasa" value={metadata.measurements?.nakago_nagasa ? `${metadata.measurements.nakago_nagasa} cm` : null} labelJa="茎長" />
                <Field label="Nakago Sori" value={metadata.measurements?.nakago_sori !== null ? `${metadata.measurements?.nakago_sori} cm` : null} labelJa="茎反り" />
              </Section>

              {/* Sugata (Form) */}
              <Section title="Sugata (Form)" titleJa="姿">
                <Field label="Construction" value={metadata.sugata?.form} labelJa="造込" />
                <Field label="Mune (Spine)" value={metadata.sugata?.mune} labelJa="棟" />
                <Field label="Kissaki (Point)" value={metadata.sugata?.kissaki} labelJa="切先" />
                <Field label="Mihaba" value={metadata.sugata?.mihaba} labelJa="身幅" />
                <ArrayField label="Features" values={metadata.sugata?.features} />
              </Section>

              {/* Kitae (Grain) */}
              <Section title="Kitae (Steel Grain)" titleJa="鍛え">
                <ArrayField label="Primary Hada" values={metadata.kitae?.primary_hada} labelJa="肌" />
                <ArrayField label="Characteristics" values={metadata.kitae?.characteristics} />
              </Section>

              {/* Hamon (Temper Line) */}
              <Section title="Hamon (Temper Line)" titleJa="刃文">
                <ArrayField label="Primary Pattern" values={metadata.hamon?.primary_pattern} />
                <ArrayField label="Activities" values={metadata.hamon?.activities} />
                <Field label="Style" value={metadata.hamon?.style} />
              </Section>

              {/* Boshi (Point) */}
              <Section title="Boshi (Point Hardening)" titleJa="帽子">
                <ArrayField label="Pattern" values={metadata.boshi?.pattern} />
                <ArrayField label="Features" values={metadata.boshi?.features} />
              </Section>

              {/* Nakago (Tang) */}
              <Section title="Nakago (Tang)" titleJa="茎">
                <Field label="Condition" value={metadata.nakago?.condition} />
                <Field label="Shape" value={metadata.nakago?.shape} />
                <ArrayField label="Yasurime (File Marks)" values={metadata.nakago?.yasurime} labelJa="鑢目" />
                <Field label="Mekugi-ana" value={metadata.nakago?.mekugi_ana} labelJa="目釘穴" />
              </Section>

              {/* Horimono (Carvings) */}
              <Section title="Horimono (Carvings)" titleJa="彫物">
                <Field label="Present" value={metadata.horimono?.present ? 'Yes' : 'No'} />
                {metadata.horimono?.present && (
                  <>
                    <ArrayField label="Omote" values={metadata.horimono?.omote} labelJa="表" />
                    <ArrayField label="Ura" values={metadata.horimono?.ura} labelJa="裏" />
                    <ArrayField label="Types" values={metadata.horimono?.types} />
                  </>
                )}
              </Section>
            </>
          )}

          {/* Provenance */}
          <Section title="Provenance" titleJa="伝来">
            <ArrayField label="Denrai" values={metadata.provenance?.denrai} labelJa="伝来" />
            <Field
              label="Origami"
              value={metadata.provenance?.origami?.present
                ? `Present${metadata.provenance.origami.appraiser ? ` (${metadata.provenance.origami.appraiser})` : ''}`
                : 'Not present'
              }
              labelJa="折紙"
            />
            <Field
              label="Sayagaki"
              value={metadata.provenance?.sayagaki?.present
                ? `Present${metadata.provenance.sayagaki.author ? ` by ${metadata.provenance.sayagaki.author}` : ''}`
                : 'Not present'
              }
              labelJa="鞘書"
            />
            <ArrayField label="Publications" values={metadata.provenance?.publications} />
          </Section>

          {/* Assessment */}
          <Section title="Assessment" titleJa="評価">
            <Field label="Significance" value={metadata.assessment?.significance} />
            <ArrayField label="Praise Tags" values={metadata.assessment?.praise_tags} />
            {metadata.assessment?.documentary_value && (
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-sm text-[var(--text-muted)] mb-2">Documentary Value</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{metadata.assessment.documentary_value}</p>
              </div>
            )}
            {metadata.assessment?.overall_summary && (
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-sm text-[var(--text-muted)] mb-2">Overall Summary</div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{metadata.assessment.overall_summary}</p>
              </div>
            )}
          </Section>

          {/* Source */}
          <Section title="Source Information" titleJa="出典" defaultOpen={false}>
            <Field label="Collection" value={metadata._source?.collection} />
            <Field label="Volume" value={metadata._source?.volume} />
            <Field label="Item" value={metadata._source?.item} />
            <Field label="Translation Date" value={metadata._source?.translation_date} />
            {metadata.article_author && (
              <Field
                label="Article Author"
                value={`${metadata.article_author.name_romaji || ''} ${metadata.article_author.name_kanji ? `(${metadata.article_author.name_kanji})` : ''}`}
              />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
