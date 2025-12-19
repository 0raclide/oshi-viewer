'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ShareIcon,
  LoadingSpinner,
} from '@/components/icons';
import { DeepAnalytics } from '@/components/DeepAnalytics';
import { GlossaryTerm } from '@/components/GlossaryTerm';
import { useBookmarks } from '@/hooks/useBookmarks';
import type { ItemMetadata, ItemReference } from '@/types';

interface ItemPageProps {
  params: Promise<{ collection: string; volume: string; item: string }>;
}

type TextLang = 'english' | 'japanese';

export default function ItemPage({ params }: ItemPageProps) {
  const { collection, volume, item } = use(params);
  const volumeNum = parseInt(volume, 10);
  const itemNum = parseInt(item, 10);

  const [metadata, setMetadata] = useState<ItemMetadata | null>(null);
  const [japaneseText, setJapaneseText] = useState<string | null>(null);
  const [translationMarkdown, setTranslationMarkdown] = useState<string | null>(null);
  const [images, setImages] = useState<{ oshigata: string; setsumei: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [textLang, setTextLang] = useState<TextLang>('english');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSetsumeiImage, setShowSetsumeiImage] = useState(false);

  const { isBookmarked, toggleBookmark } = useBookmarks();

  const reference: ItemReference = {
    collection: collection as 'Tokuju' | 'Juyo',
    volume: volumeNum,
    item: itemNum,
  };

  const bookmarked = isBookmarked(reference);

  // Get maker name based on item type
  const getMakerName = () => {
    if (!metadata) return { romaji: 'Unknown', kanji: undefined };

    const itemType = metadata.item_type;

    if (itemType === 'tosogu') {
      return {
        romaji: metadata.maker?.name_romaji || metadata.mei?.smith_name_romaji || 'Unknown',
        kanji: metadata.maker?.name_kanji || metadata.mei?.smith_name_kanji,
      };
    }

    if (itemType === 'koshirae') {
      return {
        romaji: metadata.fittings_maker?.primary_artisan || 'Unknown',
        kanji: metadata.fittings_maker?.primary_artisan_kanji,
      };
    }

    // Default: token (blade)
    return {
      romaji: metadata.mei?.smith_name_romaji || metadata.smith?.name_romaji || 'Unknown',
      kanji: metadata.mei?.smith_name_kanji || metadata.smith?.name_kanji,
    };
  };

  // Get display type based on item type
  const getDisplayType = () => {
    if (!metadata) return 'unknown';

    const itemType = metadata.item_type;

    if (itemType === 'tosogu') {
      return metadata.fitting_type || 'tosogu';
    }

    if (itemType === 'koshirae') {
      return metadata.mounting_type || 'koshirae';
    }

    return metadata.blade_type || 'blade';
  };

  const makerName = getMakerName();
  const smithName = makerName.romaji;
  const smithKanji = makerName.kanji;
  const displayType = getDisplayType();
  const isTosogu = metadata?.item_type === 'tosogu';
  const isKoshirae = metadata?.item_type === 'koshirae';
  const isBlade = !isTosogu && !isKoshirae;

  // Get school for fallback display
  const school = isBlade ? metadata?.smith?.school : (isTosogu ? metadata?.maker?.school : metadata?.fittings_maker?.school);
  const hasKnownAuthor = smithName && smithName !== 'Unknown';
  const displayTitle = hasKnownAuthor ? smithName : (school || smithName);

  useEffect(() => {
    fetch(`/api/item/${collection}/${volume}/${item}`)
      .then(res => res.json())
      .then(data => {
        setMetadata(data.metadata);
        setJapaneseText(data.japaneseText);
        setTranslationMarkdown(data.translationMarkdown);
        setImages(data.images);
        setLoading(false);

        // Default to english if available, otherwise japanese
        if (data.translationMarkdown) {
          setTextLang('english');
        } else if (data.japaneseText) {
          setTextLang('japanese');
        }
      })
      .catch(err => {
        console.error('Error loading item:', err);
        setLoading(false);
      });
  }, [collection, volume, item]);

  const handleBookmark = () => {
    toggleBookmark(reference, smithName, displayType);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${smithName} - Oshi Viewer`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner className="w-6 h-6 text-[var(--accent)]" />
      </div>
    );
  }

  // Get key metadata for the panel
  const period = metadata?.era?.period;
  const subPeriod = metadata?.era?.sub_period;
  const year = metadata?.era?.western_year;
  const nagasa = isBlade ? metadata?.measurements?.nagasa : undefined;
  const sori = isBlade ? metadata?.measurements?.sori : undefined;
  const tradition = isBlade ? metadata?.smith?.tradition : undefined;
  const meiStatus = metadata?.mei?.status;
  const denrai = metadata?.provenance?.denrai?.join(', ');

  const hasText = japaneseText || translationMarkdown;

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/collection/${collection}/${volume}`}
                className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all flex-shrink-0"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 truncate">
                  {smithKanji && hasKnownAuthor && (
                    <span className="text-[var(--text-accent)] font-jp">{smithKanji}</span>
                  )}
                  <span className="font-sans truncate">{displayTitle}</span>
                </h1>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {collection === 'Tokuju' ? 'Tokuju' : 'Jūyō'} · Vol.{volumeNum} · #{itemNum}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleShare} className="btn-ghost p-2">
                <ShareIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleBookmark}
                className={`btn-ghost p-2 ${bookmarked ? 'text-[var(--accent)]' : ''}`}
              >
                <BookmarkIcon className="w-4 h-4" filled={bookmarked} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* Left Panel: Setsumei Text (Desktop) - Responsive width */}
        {hasText && (
          <div className="hidden lg:flex flex-col w-[28vw] min-w-[280px] max-w-[420px] border-r border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
            {/* Language Toggle */}
            <div className="flex border-b border-[var(--border)] flex-shrink-0">
              {translationMarkdown && (
                <button
                  onClick={() => setTextLang('english')}
                  className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                    textLang === 'english'
                      ? 'bg-[var(--background)] text-[var(--text-primary)] border-b-2 border-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  English
                </button>
              )}
              {japaneseText && (
                <button
                  onClick={() => setTextLang('japanese')}
                  className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                    textLang === 'japanese'
                      ? 'bg-[var(--background)] text-[var(--text-primary)] border-b-2 border-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  日本語
                </button>
              )}
            </div>

            {/* Text Content - Larger, more readable fonts */}
            <div className="flex-1 overflow-y-auto p-4">
              {textLang === 'english' && translationMarkdown ? (
                <article className="text-[13px] leading-[1.7]">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-base font-semibold text-[var(--text-primary)] mt-0 mb-3 pb-2 border-b border-[var(--border-subtle)]">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-2 pb-1 border-b border-[var(--border-subtle)]">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 text-[var(--text-secondary)]">
                          {children}
                        </p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[var(--text-primary)]">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <GlossaryTerm>{children}</GlossaryTerm>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-3 pl-4 space-y-1.5 list-disc list-outside marker:text-[var(--text-muted)]">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-[var(--text-secondary)]">
                          {children}
                        </li>
                      ),
                      hr: () => (
                        <hr className="my-4 border-[var(--border-subtle)]" />
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-3 italic text-[var(--text-tertiary)]">
                          {children}
                        </blockquote>
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
        )}

        {/* Center: Main Image */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--background)]">
          {/* Image Container - fills available space */}
          <div className="flex-1 relative flex items-center justify-center p-3 lg:p-6 min-h-0">
            {images && (
              <>
                {/* Main Oshigata Image */}
                <div className="relative w-full h-full">
                  <Image
                    src={showSetsumeiImage ? images.setsumei : images.oshigata}
                    alt={`${smithName} ${showSetsumeiImage ? 'setsumei' : 'oshigata'}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>

                {/* Setsumei Image Toggle */}
                <button
                  onClick={() => setShowSetsumeiImage(!showSetsumeiImage)}
                  className={`absolute bottom-5 right-5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    showSetsumeiImage
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface)]/90 text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {showSetsumeiImage ? 'Oshigata' : 'Setsumei'}
                </button>
              </>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-[var(--border)] bg-[var(--surface)]/50 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <Link
                href={itemNum > 1 ? `/item/${collection}/${volume}/${itemNum - 1}` : '#'}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  itemNum > 1
                    ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] cursor-not-allowed pointer-events-none'
                }`}
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
              <span className="text-[var(--text-muted)] text-xs">
                {itemNum}
              </span>
              <Link
                href={`/item/${collection}/${volume}/${itemNum + 1}`}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel: Metadata */}
        {metadata && (
          <div className="hidden lg:block w-60 xl:w-72 border-l border-[var(--border)] bg-[var(--surface)] overflow-y-auto flex-shrink-0">
            <div className="p-4 space-y-4">
              {/* Primary Info */}
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                {school && (
                  <div className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1">{school}</div>
                )}
                <h2 className="text-base font-medium text-[var(--text-primary)]">
                  {displayTitle}
                </h2>
                {smithKanji && hasKnownAuthor && (
                  <div className="text-sm text-[var(--text-accent)] font-jp mt-0.5">{smithKanji}</div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="badge badge-muted capitalize text-[10px]">{displayType}</span>
                  <span className="badge badge-muted text-[10px]">
                    {metadata.classification === 'tokubetsu-juyo' ? 'Tokuju' : 'Jūyō'}
                  </span>
                </div>
              </div>

              {/* Era & Tradition */}
              {(tradition || period) && (
                <div className="pb-4 border-b border-[var(--border-subtle)]">
                  {tradition && (
                    <div className="mb-2.5">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Tradition</div>
                      <div className="text-sm text-[var(--text-primary)]">{tradition}</div>
                    </div>
                  )}
                  {period && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Era</div>
                      <div className="text-sm text-[var(--text-primary)]">
                        {subPeriod && <span className="capitalize">{subPeriod} </span>}
                        {period}
                        {year && <span className="text-[var(--text-tertiary)] ml-1.5">ca. {year}</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Measurements (for blades) */}
              {isBlade && nagasa && (
                <div className="pb-4 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Measurements</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">Nagasa</span>
                      <div className="text-sm text-[var(--text-primary)]">{nagasa} cm</div>
                    </div>
                    {sori !== null && sori !== undefined && (
                      <div>
                        <span className="text-[10px] text-[var(--text-tertiary)]">Sori</span>
                        <div className="text-sm text-[var(--text-primary)]">{sori} cm</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mei */}
              {meiStatus && (
                <div className="pb-4 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Signature</div>
                  <div className="text-sm text-[var(--text-primary)] capitalize">{meiStatus.replace(/-/g, ' ')}</div>
                  {metadata.mei?.inscription_omote && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1.5 font-jp">
                      {metadata.mei.inscription_omote}
                    </div>
                  )}
                </div>
              )}

              {/* Provenance */}
              {denrai && (
                <div className="pb-4 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Provenance</div>
                  <div className="text-xs text-[var(--text-primary)]">{denrai}</div>
                </div>
              )}

              {/* More Details Button */}
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-full btn-accent text-xs py-2.5"
              >
                More Details
              </button>

              {/* Designation info */}
              {metadata.designation_date && (
                <div className="text-center text-[10px] text-[var(--text-muted)]">
                  Designated {metadata.designation_date}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Bottom Sheet for Text and Metadata */}
      <div className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        <div className="flex">
          {hasText && (
            <>
              {translationMarkdown && (
                <button
                  onClick={() => setTextLang('english')}
                  className={`flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    textLang === 'english'
                      ? 'border-[var(--accent)] text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-muted)]'
                  }`}
                >
                  English
                </button>
              )}
              {japaneseText && (
                <button
                  onClick={() => setTextLang('japanese')}
                  className={`flex-1 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                    textLang === 'japanese'
                      ? 'border-[var(--accent)] text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-muted)]'
                  }`}
                >
                  日本語
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex-1 px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] border-b-2 border-transparent"
          >
            Details
          </button>
        </div>

        {/* Mobile Text Content */}
        {hasText && (
          <div className="max-h-56 overflow-y-auto p-4">
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
              <div className="font-jp text-[13px] whitespace-pre-wrap text-[var(--text-secondary)] leading-[1.8]">{japaneseText}</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Deep Analytics Modal */}
      {showAnalytics && metadata && (
        <DeepAnalytics
          metadata={metadata}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
}
