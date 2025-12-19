'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  ShareIcon,
  LoadingSpinner,
  ZoomInIcon,
  ZoomOutIcon,
  ZoomResetIcon,
  PanelLeftIcon,
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
  const router = useRouter();
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
  const [imageTransition, setImageTransition] = useState<'idle' | 'exit-left' | 'exit-right' | 'enter'>('idle');
  const [textFade, setTextFade] = useState(false);

  // Panel collapsed states - use refs so they persist across item navigation
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Track if this is the initial load vs navigation
  const isInitialLoad = useRef(true);
  const hasContent = useRef(false);

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastPanPosition = useRef<{ x: number; y: number } | null>(null);

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

  // Navigation functions with smooth image transitions
  const goToPrev = useCallback(() => {
    if (itemNum > 1 && imageTransition === 'idle') {
      setImageTransition('exit-right'); // Image exits to right (going backwards)
      setTextFade(true);
      setTimeout(() => {
        router.push(`/item/${collection}/${volume}/${itemNum - 1}`);
      }, 200);
    }
  }, [router, collection, volume, itemNum, imageTransition]);

  const goToNext = useCallback(() => {
    if (imageTransition === 'idle') {
      setImageTransition('exit-left'); // Image exits to left (going forwards)
      setTextFade(true);
      setTimeout(() => {
        router.push(`/item/${collection}/${volume}/${itemNum + 1}`);
      }, 200);
    }
  }, [router, collection, volume, itemNum, imageTransition]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape' && zoom !== 1) {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext, zoom]);

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Touch handlers for pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && zoom > 1) {
      lastPanPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = distance - lastTouchDistance.current;
      const zoomDelta = delta * 0.01;

      setZoom(prev => Math.min(Math.max(prev + zoomDelta, 1), 4));
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && zoom > 1 && lastPanPosition.current) {
      const deltaX = e.touches[0].clientX - lastPanPosition.current.x;
      const deltaY = e.touches[0].clientY - lastPanPosition.current.y;

      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      lastPanPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
    lastPanPosition.current = null;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom(prev => {
        const newZoom = Math.min(Math.max(prev + delta, 1), 4);
        if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
        return newZoom;
      });
    }
  };

  useEffect(() => {
    // Only show loading spinner on initial load, not during navigation
    if (isInitialLoad.current) {
      setLoading(true);
    }

    fetch(`/api/item/${collection}/${volume}/${item}`)
      .then(res => res.json())
      .then(data => {
        setMetadata(data.metadata);
        setJapaneseText(data.japaneseText);
        setTranslationMarkdown(data.translationMarkdown);
        setImages(data.images);
        setLoading(false);
        hasContent.current = true;
        isInitialLoad.current = false;

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

  // Reset zoom and transition state when switching images/items
  useEffect(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    // Animate the image entering from the appropriate side
    setImageTransition('enter');
    // Small delay then reset to idle
    const timer = setTimeout(() => {
      setImageTransition('idle');
      setTextFade(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [item]);

  // Reset zoom when switching between oshigata/setsumei
  useEffect(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [showSetsumeiImage]);

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

  // Only show loading spinner on initial page load, not during navigation
  if (loading && !hasContent.current) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner className="w-6 h-6 text-[var(--accent)]" />
      </div>
    );
  }

  // Extended metadata for panel
  const period = metadata?.era?.period;
  const subPeriod = metadata?.era?.sub_period;
  const year = metadata?.era?.western_year;
  const nagasa = isBlade ? metadata?.measurements?.nagasa : undefined;
  const sori = isBlade ? metadata?.measurements?.sori : undefined;
  const motohaba = isBlade ? metadata?.measurements?.motohaba : undefined;
  const sakihaba = isBlade ? metadata?.measurements?.sakihaba : undefined;
  const kasane = isBlade ? metadata?.measurements?.kasane : undefined;
  const tradition = isBlade ? metadata?.smith?.tradition : undefined;
  const lineage = isBlade ? metadata?.smith?.lineage : undefined;
  const meiStatus = metadata?.mei?.status;
  const denrai = metadata?.provenance?.denrai?.join(', ');

  // Additional blade characteristics
  const sugataForm = isBlade ? metadata?.sugata?.form : undefined;
  const kissaki = isBlade ? metadata?.sugata?.kissaki : undefined;
  const mune = isBlade ? metadata?.sugata?.mune : undefined;
  const primaryHada = isBlade ? metadata?.kitae?.primary_hada?.join(', ') : undefined;
  const primaryHamon = isBlade ? metadata?.hamon?.primary_pattern?.join(', ') : undefined;
  const hamonStyle = isBlade ? metadata?.hamon?.style : undefined;
  const boshiPattern = isBlade ? metadata?.boshi?.pattern?.join(', ') : undefined;
  const hasHorimono = isBlade && metadata?.horimono?.present;
  const horimonoTypes = hasHorimono ? metadata?.horimono?.types?.join(', ') : undefined;
  const nakagoCondition = isBlade ? metadata?.nakago?.condition : undefined;
  const yasurime = isBlade ? metadata?.nakago?.yasurime?.join(', ') : undefined;
  const health = metadata?.condition?.health;
  const praiseTags = metadata?.assessment?.praise_tags;
  const documentaryValue = metadata?.assessment?.documentary_value;
  const overallSummary = metadata?.assessment?.overall_summary;

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
        {/* Left Panel: Setsumei Text (Desktop) - Collapsible */}
        {hasText && (
          <div className={`hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--surface)] flex-shrink-0 transition-all duration-300 ${
            leftPanelCollapsed ? 'w-0 min-w-0 overflow-hidden border-r-0' : 'w-[32vw] min-w-[320px] max-w-[480px]'
          } ${textFade ? 'opacity-0' : 'opacity-100'}`}>
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

            {/* Text Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {textLang === 'english' && translationMarkdown ? (
                <article className="text-[13px] leading-[1.7]">
                  {(() => {
                    const overallIdx = translationMarkdown.toLowerCase().indexOf('## overall');
                    const beforeOverall = overallIdx > 0 ? translationMarkdown.slice(0, overallIdx) : '';
                    const fromOverall = overallIdx > 0 ? translationMarkdown.slice(overallIdx) : translationMarkdown;

                    const baseComponents = {
                      h1: ({ children }: { children: React.ReactNode }) => (
                        <h1 className="text-base font-semibold text-[var(--text-primary)] mt-0 mb-3 pb-2 border-b border-[var(--border-subtle)]">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }: { children: React.ReactNode }) => (
                        <h2 className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-2 pb-1 border-b border-[var(--border-subtle)]">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }: { children: React.ReactNode }) => (
                        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }: { children: React.ReactNode }) => (
                        <p className="mb-3 text-[var(--text-secondary)]">
                          {children}
                        </p>
                      ),
                      strong: ({ children }: { children: React.ReactNode }) => (
                        <strong className="font-semibold text-[var(--text-primary)]">
                          {children}
                        </strong>
                      ),
                      ul: ({ children }: { children: React.ReactNode }) => (
                        <ul className="my-3 pl-4 space-y-1.5 list-disc list-outside marker:text-[var(--text-muted)]">
                          {children}
                        </ul>
                      ),
                      li: ({ children }: { children: React.ReactNode }) => (
                        <li className="text-[var(--text-secondary)]">
                          {children}
                        </li>
                      ),
                      hr: () => (
                        <hr className="my-4 border-[var(--border-subtle)]" />
                      ),
                      blockquote: ({ children }: { children: React.ReactNode }) => (
                        <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-3 italic text-[var(--text-tertiary)]">
                          {children}
                        </blockquote>
                      ),
                    };

                    return (
                      <>
                        {beforeOverall && (
                          <ReactMarkdown
                            components={{
                              ...baseComponents,
                              em: ({ children }: { children: React.ReactNode }) => (
                                <em className="italic text-[var(--text-secondary)]">{children}</em>
                              ),
                            }}
                          >
                            {beforeOverall}
                          </ReactMarkdown>
                        )}
                        <ReactMarkdown
                          components={{
                            ...baseComponents,
                            em: ({ children }: { children: React.ReactNode }) => (
                              <GlossaryTerm>{children}</GlossaryTerm>
                            ),
                          }}
                        >
                          {fromOverall}
                        </ReactMarkdown>
                      </>
                    );
                  })()}
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
          {/* Image Container with zoom */}
          <div
            ref={imageContainerRef}
            className="flex-1 relative flex items-center justify-center p-3 lg:p-6 min-h-0 overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {images && (
              <>
                {/* Main Image with zoom transform and navigation transition */}
                <div
                  className={`relative w-full h-full transition-all duration-200 ease-out ${
                    imageTransition === 'exit-left' ? 'opacity-0 -translate-x-12' :
                    imageTransition === 'exit-right' ? 'opacity-0 translate-x-12' :
                    imageTransition === 'enter' ? 'opacity-100 translate-x-0' :
                    'opacity-100 translate-x-0'
                  }`}
                  style={{
                    transform: imageTransition === 'idle'
                      ? `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`
                      : undefined,
                  }}
                >
                  <Image
                    src={showSetsumeiImage ? images.setsumei : images.oshigata}
                    alt={`${smithName} ${showSetsumeiImage ? 'setsumei' : 'oshigata'}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    draggable={false}
                  />
                </div>

                {/* Control buttons */}
                <div className="absolute bottom-5 right-5 flex items-center gap-2">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1 bg-[var(--surface)]/90 rounded border border-[var(--border)] p-1">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 1}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Zoom out"
                    >
                      <ZoomOutIcon className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-[var(--text-muted)] min-w-[3ch] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 4}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Zoom in"
                    >
                      <ZoomInIcon className="w-4 h-4" />
                    </button>
                    {zoom !== 1 && (
                      <button
                        onClick={handleZoomReset}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-l border-[var(--border)]"
                        title="Reset zoom"
                      >
                        <ZoomResetIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Image toggle */}
                  <button
                    onClick={() => setShowSetsumeiImage(!showSetsumeiImage)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      showSetsumeiImage
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface)]/90 text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {showSetsumeiImage ? 'Oshigata' : 'Setsumei'}
                  </button>
                </div>

                {/* Panel toggle button (left side) */}
                {hasText && (
                  <button
                    onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                    className="hidden lg:flex absolute top-3 left-3 p-2 bg-[var(--surface)]/90 rounded border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
                    title={leftPanelCollapsed ? 'Show text' : 'Hide text'}
                  >
                    <PanelLeftIcon className={`w-4 h-4 transition-transform ${leftPanelCollapsed ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Panel toggle button (right side) */}
                {metadata && (
                  <button
                    onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                    className="hidden lg:flex absolute top-3 right-3 p-2 bg-[var(--surface)]/90 rounded border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
                    title={rightPanelCollapsed ? 'Show metadata' : 'Hide metadata'}
                  >
                    <PanelLeftIcon className={`w-4 h-4 transition-transform ${rightPanelCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-[var(--border)] bg-[var(--surface)]/50 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrev}
                disabled={itemNum <= 1}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  itemNum > 1
                    ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <span className="text-[var(--text-muted)] text-xs">
                {itemNum} <span className="hidden sm:inline text-[var(--text-muted)]/50">· ← → to navigate</span>
              </span>
              <button
                onClick={goToNext}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Enhanced Metadata - Collapsible */}
        {metadata && (
          <div className={`hidden lg:flex flex-col border-l border-[var(--border)] bg-[var(--surface)] flex-shrink-0 transition-all duration-300 ${
            rightPanelCollapsed ? 'w-0 min-w-0 overflow-hidden border-l-0' : 'w-64 xl:w-80 overflow-y-auto'
          } ${textFade ? 'opacity-0' : 'opacity-100'}`}>
            <div className="p-4 space-y-3">
              {/* Primary Info */}
              <div className="pb-3 border-b border-[var(--border-subtle)]">
                {school && (
                  <div className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1">{school}</div>
                )}
                <h2 className="text-base font-medium text-[var(--text-primary)]">
                  {displayTitle}
                </h2>
                {smithKanji && hasKnownAuthor && (
                  <div className="text-sm text-[var(--text-accent)] font-jp mt-0.5">{smithKanji}</div>
                )}
                {lineage && (
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{lineage}</div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="badge badge-muted capitalize text-[10px]">{displayType}</span>
                  <span className="badge badge-muted text-[10px]">
                    {metadata.classification === 'tokubetsu-juyo' ? 'Tokuju' : 'Jūyō'}
                  </span>
                </div>
              </div>

              {/* Era & Tradition */}
              {(tradition || period) && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  {tradition && (
                    <div className="mb-2">
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

              {/* Sugata (Shape) for blades */}
              {isBlade && (sugataForm || kissaki) && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Sugata</div>
                  <div className="space-y-1.5">
                    {sugataForm && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Form</span>
                        <span className="text-[var(--text-primary)] capitalize">{sugataForm}</span>
                      </div>
                    )}
                    {kissaki && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Kissaki</span>
                        <span className="text-[var(--text-primary)] capitalize">{kissaki}</span>
                      </div>
                    )}
                    {mune && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Mune</span>
                        <span className="text-[var(--text-primary)] capitalize">{mune}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kitae & Hamon */}
              {isBlade && (primaryHada || primaryHamon) && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  {primaryHada && (
                    <div className="mb-2">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Kitae (Hada)</div>
                      <div className="text-sm text-[var(--text-primary)] capitalize">{primaryHada}</div>
                    </div>
                  )}
                  {primaryHamon && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Hamon</div>
                      <div className="text-sm text-[var(--text-primary)] capitalize">{primaryHamon}</div>
                      {hamonStyle && (
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{hamonStyle}</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Boshi */}
              {boshiPattern && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Boshi</div>
                  <div className="text-sm text-[var(--text-primary)] capitalize">{boshiPattern}</div>
                </div>
              )}

              {/* Horimono */}
              {hasHorimono && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Horimono</div>
                  <div className="text-sm text-[var(--text-primary)] capitalize">{horimonoTypes || 'Present'}</div>
                </div>
              )}

              {/* Measurements */}
              {isBlade && nagasa && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Measurements</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
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
                    {motohaba && (
                      <div>
                        <span className="text-[10px] text-[var(--text-tertiary)]">Motohaba</span>
                        <div className="text-sm text-[var(--text-primary)]">{motohaba} cm</div>
                      </div>
                    )}
                    {sakihaba && (
                      <div>
                        <span className="text-[10px] text-[var(--text-tertiary)]">Sakihaba</span>
                        <div className="text-sm text-[var(--text-primary)]">{sakihaba} cm</div>
                      </div>
                    )}
                    {kasane && (
                      <div>
                        <span className="text-[10px] text-[var(--text-tertiary)]">Kasane</span>
                        <div className="text-sm text-[var(--text-primary)]">{kasane} cm</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nakago */}
              {isBlade && (nakagoCondition || yasurime) && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Nakago</div>
                  <div className="space-y-1.5">
                    {nakagoCondition && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Condition</span>
                        <span className="text-[var(--text-primary)] capitalize">{nakagoCondition}</span>
                      </div>
                    )}
                    {yasurime && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Yasurime</span>
                        <span className="text-[var(--text-primary)] capitalize">{yasurime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mei */}
              {meiStatus && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Signature</div>
                  <div className="text-sm text-[var(--text-primary)] capitalize">{meiStatus.replace(/-/g, ' ')}</div>
                  {metadata.mei?.inscription_omote && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1.5 font-jp">
                      {metadata.mei.inscription_omote}
                    </div>
                  )}
                  {metadata.mei?.inscription_ura && (
                    <div className="text-xs text-[var(--text-tertiary)] mt-1 font-jp">
                      {metadata.mei.inscription_ura}
                    </div>
                  )}
                </div>
              )}

              {/* Condition */}
              {health && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Condition</div>
                  <div className="text-sm text-[var(--text-primary)] capitalize">{health}</div>
                </div>
              )}

              {/* Provenance */}
              {denrai && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Provenance</div>
                  <div className="text-xs text-[var(--text-primary)]">{denrai}</div>
                </div>
              )}

              {/* Assessment highlights */}
              {(praiseTags && praiseTags.length > 0) && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Notable Qualities</div>
                  <div className="flex flex-wrap gap-1">
                    {praiseTags.slice(0, 6).map((tag, i) => (
                      <span key={i} className="badge badge-accent text-[9px]">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentary Value */}
              {documentaryValue && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Documentary Value</div>
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{documentaryValue}</div>
                </div>
              )}

              {/* Overall Summary */}
              {overallSummary && (
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Summary</div>
                  <div className="text-xs text-[var(--text-secondary)] leading-relaxed">{overallSummary}</div>
                </div>
              )}

              {/* More Details Button */}
              <button
                onClick={() => setShowAnalytics(true)}
                className="w-full btn-accent text-xs py-2.5"
              >
                Full Details
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
