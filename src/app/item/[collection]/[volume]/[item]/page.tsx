'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShareIcon,
  LoadingSpinner,
} from '@/components/icons';
import { DeepAnalytics } from '@/components/DeepAnalytics';
import { ImageViewer } from '@/components/item-view';
import { TextPanel, MobileTextPanel } from '@/components/item-view';
import { SaveToCollectionButton } from '@/components/collections';
import { useItemNavigation } from '@/hooks/useItemNavigation';
import type { ItemMetadata, ItemReference } from '@/types';

interface ItemPageProps {
  params: Promise<{ collection: string; volume: string; item: string }>;
}

type TextLang = 'english' | 'japanese';

export default function ItemPage({ params }: ItemPageProps) {
  const { collection, volume, item } = use(params);
  const initialVolumeNum = parseInt(volume, 10);
  const initialItemNum = parseInt(item, 10);
  const router = useRouter();

  // Current item state
  const [currentCollection, setCurrentCollection] = useState(collection);
  const [currentVolume, setCurrentVolume] = useState(initialVolumeNum);
  const [currentItemNum, setCurrentItemNum] = useState(initialItemNum);

  // Data state
  const [metadata, setMetadata] = useState<ItemMetadata | null>(null);
  const [japaneseText, setJapaneseText] = useState<string | null>(null);
  const [translationMarkdown, setTranslationMarkdown] = useState<string | null>(null);
  const [images, setImages] = useState<{ oshigata: string; setsumei: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [textLang, setTextLang] = useState<TextLang>('english');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSetsumeiImage, setShowSetsumeiImage] = useState(false);
  const [imageTransition, setImageTransition] = useState<'idle' | 'exit-left' | 'exit-right' | 'enter'>('idle');

  // Panel states
  const [leftPanelCollapsed, setLeftPanelCollapsedState] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsedState] = useState(false);

  // Track initial load vs navigation
  const isInitialLoad = useRef(true);
  const hasContent = useRef(false);

  // Navigation hook
  const handleNavigate = useCallback((col: string, vol: number, itm: number, direction: 'prev' | 'next') => {
    setImageTransition(direction === 'prev' ? 'exit-right' : 'exit-left');
    setTimeout(() => {
      setCurrentCollection(col);
      setCurrentVolume(vol);
      setCurrentItemNum(itm);
    }, 200);
  }, []);

  const [navState, navActions] = useItemNavigation(
    collection,
    initialVolumeNum,
    initialItemNum,
    handleNavigate
  );


  // Load panel states from localStorage
  useEffect(() => {
    const savedLeft = localStorage.getItem('oshi-left-panel-collapsed');
    const savedRight = localStorage.getItem('oshi-right-panel-collapsed');
    if (savedLeft === 'true') setLeftPanelCollapsedState(true);
    if (savedRight === 'true') setRightPanelCollapsedState(true);
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/item\/([^/]+)\/(\d+)\/(\d+)/);
      if (match) {
        const [, newCol, newVol, newItm] = match;
        if (newCol !== currentCollection || parseInt(newVol) !== currentVolume || parseInt(newItm) !== currentItemNum) {
          setCurrentCollection(newCol);
          setCurrentVolume(parseInt(newVol, 10));
          setCurrentItemNum(parseInt(newItm, 10));
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentCollection, currentVolume, currentItemNum]);

  // Panel state setters with localStorage
  const setLeftPanelCollapsed = (value: boolean) => {
    setLeftPanelCollapsedState(value);
    localStorage.setItem('oshi-left-panel-collapsed', String(value));
  };
  const setRightPanelCollapsed = (value: boolean) => {
    setRightPanelCollapsedState(value);
    localStorage.setItem('oshi-right-panel-collapsed', String(value));
  };

  // Current reference
  const reference: ItemReference = {
    collection: currentCollection as 'Tokuju' | 'Juyo',
    volume: currentVolume,
    item: currentItemNum,
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        router.back();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navActions.goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navActions.goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navActions, router]);

  // Save last viewed item
  useEffect(() => {
    localStorage.setItem('oshi-last-viewed-item', JSON.stringify({
      collection: currentCollection,
      volume: currentVolume,
      item: currentItemNum,
    }));
  }, [currentCollection, currentVolume, currentItemNum]);

  // Fetch item data
  useEffect(() => {
    if (isInitialLoad.current) setLoading(true);

    fetch(`/api/item/${currentCollection}/${currentVolume}/${currentItemNum}`)
      .then(res => res.json())
      .then(data => {
        setMetadata(data.metadata);
        setJapaneseText(data.japaneseText);
        setTranslationMarkdown(data.translationMarkdown);
        setImages(data.images);
        setLoading(false);

        // Only set language on initial load, preserve user's choice when navigating
        if (isInitialLoad.current) {
          setTextLang(data.translationMarkdown ? 'english' : 'japanese');
        } else {
          // If user was on Japanese but new item has no Japanese, fall back to English
          // If user was on English but new item has no translation, fall back to Japanese
          setTextLang(prev => {
            if (prev === 'japanese' && !data.japaneseText && data.translationMarkdown) return 'english';
            if (prev === 'english' && !data.translationMarkdown && data.japaneseText) return 'japanese';
            return prev;
          });
        }

        hasContent.current = true;
        isInitialLoad.current = false;
      })
      .catch(err => {
        console.error('Error loading item:', err);
        setLoading(false);
      });
  }, [currentCollection, currentVolume, currentItemNum]);

  // Reset on item change
  useEffect(() => {
    setImageTransition('enter');
    const timer = setTimeout(() => setImageTransition('idle'), 250);
    return () => clearTimeout(timer);
  }, [currentItemNum]);

  useEffect(() => {
    setShowSetsumeiImage(false);
  }, [currentItemNum]);

  // Derived values
  const getMakerName = () => {
    if (!metadata) return { romaji: 'Unknown', kanji: undefined };
    const itemType = metadata.item_type;
    if (itemType === 'tosogu') {
      return { romaji: metadata.maker?.name_romaji || 'Unknown', kanji: metadata.maker?.name_kanji };
    }
    if (itemType === 'koshirae') {
      return { romaji: metadata.fittings_maker?.primary_artisan || 'Unknown', kanji: metadata.fittings_maker?.primary_artisan_kanji };
    }
    return { romaji: metadata.mei?.smith_name_romaji || metadata.smith?.name_romaji || 'Unknown', kanji: metadata.mei?.smith_name_kanji || metadata.smith?.name_kanji };
  };

  const getDisplayType = () => {
    if (!metadata) return 'unknown';
    if (metadata.item_type === 'tosogu') return metadata.fitting_type || 'tosogu';
    if (metadata.item_type === 'koshirae') return metadata.mounting_type || 'koshirae';
    return metadata.blade_type || 'blade';
  };

  const makerName = getMakerName();
  const smithName = makerName.romaji;
  const smithKanji = makerName.kanji;
  const displayType = getDisplayType();
  const isBlade = metadata?.item_type !== 'tosogu' && metadata?.item_type !== 'koshirae';
  const school = isBlade ? metadata?.smith?.school : (metadata?.item_type === 'tosogu' ? metadata?.maker?.school : metadata?.fittings_maker?.school);
  const hasKnownAuthor = smithName && smithName !== 'Unknown';
  const displayTitle = hasKnownAuthor ? smithName : (school || smithName);
  const hasText = !!(japaneseText || translationMarkdown);

  // Handlers
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${smithName} - Oshi Viewer`, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  // Loading state
  if (loading && !hasContent.current) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <LoadingSpinner className="w-6 h-6 text-[var(--accent)]" />
      </div>
    );
  }

  // Metadata for panel
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
  const overallSummary = metadata?.assessment?.overall_summary;
  const documentaryValue = metadata?.assessment?.documentary_value;
  const praiseTags = metadata?.assessment?.praise_tags;

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        <div className="px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-all flex-shrink-0"
                title="Back to Browse"
                aria-label="Back to browse"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 truncate">
                  {smithKanji && hasKnownAuthor && <span className="text-[var(--text-accent)] font-jp">{smithKanji}</span>}
                  <span className="font-sans truncate">{displayTitle}</span>
                </h1>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {currentCollection === 'Tokuju' ? 'Tokuju' : 'Juyo'} · Vol.{currentVolume} · #{currentItemNum}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleShare} className="btn-ghost p-2" aria-label="Share">
                <ShareIcon className="w-4 h-4" />
              </button>
              <SaveToCollectionButton
                reference={reference}
                smithName={smithName}
                bladeType={displayType}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: Text Panel */}
        <TextPanel
          japaneseText={japaneseText}
          translationMarkdown={translationMarkdown}
          textLang={textLang}
          onSetTextLang={setTextLang}
          collapsed={leftPanelCollapsed}
        />

        {/* Center: Image */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--background)]">
          {images && (
            <ImageViewer
              oshigataUrl={images.oshigata}
              setsumeiUrl={images.setsumei}
              showSetsumei={showSetsumeiImage}
              onToggleSetsumei={setShowSetsumeiImage}
              smithName={smithName}
              imageTransition={imageTransition}
              hasTextPanel={hasText}
              leftPanelCollapsed={leftPanelCollapsed}
              onToggleLeftPanel={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            />
          )}

          {/* Navigation Footer */}
          <div className="border-t border-[var(--border)] bg-[var(--surface)]/50 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <button
                onClick={navActions.goToPrev}
                disabled={!navState.canGoPrev}
                aria-label="Previous item"
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  navState.canGoPrev ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]' : 'text-[var(--text-muted)] cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <span className="text-[var(--text-muted)] text-xs">
                {navState.hasBrowseResults ? (
                  <>
                    {navState.positionInResults} / {navState.totalInResults}
                    <span className="hidden sm:inline text-[var(--text-muted)]/50"> · ←→ navigate · ↑ browse</span>
                  </>
                ) : (
                  <span className="text-[var(--text-muted)]/50">No results to navigate</span>
                )}
              </span>
              <button
                onClick={navActions.goToNext}
                disabled={!navState.canGoNext}
                aria-label="Next item"
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  navState.canGoNext ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]' : 'text-[var(--text-muted)] cursor-not-allowed'
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Metadata Panel */}
        {metadata && (
          <aside className="hidden lg:flex flex-shrink-0 relative">
            {rightPanelCollapsed && (
              <button
                onClick={() => setRightPanelCollapsed(false)}
                aria-label="Show metadata panel"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-5 h-16 bg-[var(--surface)] border border-[var(--border)] border-r-0 rounded-l text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-elevated)] hover:w-6 transition-all shadow-sm"
              >
                <ChevronLeftIcon className="w-3 h-3" />
              </button>
            )}
            <div className={`flex flex-col border-l border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ${
              rightPanelCollapsed ? 'w-0 border-l-0 overflow-hidden' : 'w-64 xl:w-80'
            }`}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] flex-shrink-0">
                <h2 className="text-sm font-medium text-[var(--text-primary)]">Metadata</h2>
                <button onClick={() => setRightPanelCollapsed(true)} aria-label="Hide metadata" className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all">
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Primary Info */}
                <div className="pb-3 border-b border-[var(--border-subtle)]">
                  {school && <div className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1">{school}</div>}
                  <h2 className="text-base font-medium text-[var(--text-primary)]">{displayTitle}</h2>
                  {smithKanji && hasKnownAuthor && <div className="text-sm text-[var(--text-accent)] font-jp mt-0.5">{smithKanji}</div>}
                  {lineage && <div className="text-xs text-[var(--text-tertiary)] mt-1">{lineage}</div>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="badge badge-muted capitalize text-[10px]">{displayType}</span>
                    <span className="badge badge-muted text-[10px]">{metadata.classification === 'tokubetsu-juyo' ? 'Tokuju' : 'Juyo'}</span>
                  </div>
                </div>

                {/* Era & Tradition */}
                {(tradition || period) && (
                  <div className="pb-3 border-b border-[var(--border-subtle)]">
                    {tradition && <div className="mb-2"><div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Tradition</div><div className="text-sm text-[var(--text-primary)]">{tradition}</div></div>}
                    {period && <div><div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Era</div><div className="text-sm text-[var(--text-primary)]">{subPeriod && <span className="capitalize">{subPeriod} </span>}{period}{year && <span className="text-[var(--text-tertiary)] ml-1.5">ca. {year}</span>}</div></div>}
                  </div>
                )}

                {/* Summary */}
                {overallSummary && (
                  <div className="pb-3 border-b border-[var(--border-subtle)]">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Summary</div>
                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span>, em: ({ children }) => <em className="text-[var(--accent)] not-italic font-medium">{children}</em>, strong: ({ children }) => <strong className="font-semibold text-[var(--text-primary)]">{children}</strong> }}>{overallSummary}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Measurements */}
                {isBlade && nagasa && (
                  <div className="pb-3 border-b border-[var(--border-subtle)]">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Measurements</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div><span className="text-[10px] text-[var(--text-tertiary)]">Nagasa</span><div className="text-sm text-[var(--text-primary)]">{nagasa} cm</div></div>
                      {sori !== null && sori !== undefined && <div><span className="text-[10px] text-[var(--text-tertiary)]">Sori</span><div className="text-sm text-[var(--text-primary)]">{sori} cm</div></div>}
                      {motohaba && <div><span className="text-[10px] text-[var(--text-tertiary)]">Motohaba</span><div className="text-sm text-[var(--text-primary)]">{motohaba} cm</div></div>}
                      {sakihaba && <div><span className="text-[10px] text-[var(--text-tertiary)]">Sakihaba</span><div className="text-sm text-[var(--text-primary)]">{sakihaba} cm</div></div>}
                      {kasane && <div><span className="text-[10px] text-[var(--text-tertiary)]">Kasane</span><div className="text-sm text-[var(--text-primary)]">{kasane} cm</div></div>}
                    </div>
                  </div>
                )}

                {/* Documentary Value */}
                {documentaryValue && (
                  <div className="pb-3 border-b border-[var(--border-subtle)]">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Documentary Value</div>
                    <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <ReactMarkdown components={{ p: ({ children }) => <span>{children}</span>, em: ({ children }) => <em className="text-[var(--accent)] not-italic font-medium">{children}</em>, strong: ({ children }) => <strong className="font-semibold text-[var(--text-primary)]">{children}</strong> }}>{documentaryValue}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Signature */}
                {meiStatus && (
                  <div className="pb-3 border-b border-[var(--border-subtle)]">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Signature</div>
                    <div className="text-sm text-[var(--text-primary)] capitalize">{meiStatus.replace(/-/g, ' ')}</div>
                    {metadata.mei?.inscription_omote && <div className="text-xs text-[var(--text-secondary)] mt-1.5 font-jp">{metadata.mei.inscription_omote}</div>}
                  </div>
                )}

                {/* Notable Qualities */}
                {praiseTags && praiseTags.length > 0 && (
                  <div className="pb-3 border-b border-[var(--border-subtle)]">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Notable Qualities</div>
                    <div className="flex flex-wrap gap-1">{praiseTags.slice(0, 6).map((tag, i) => <span key={i} className="badge badge-accent text-[9px]">{tag}</span>)}</div>
                  </div>
                )}

                <button onClick={() => setShowAnalytics(true)} className="w-full btn-accent text-xs py-2.5">Full Details</button>
                {metadata.designation_date && <div className="text-center text-[10px] text-[var(--text-muted)]">Designated {metadata.designation_date}</div>}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      <MobileTextPanel
        japaneseText={japaneseText}
        translationMarkdown={translationMarkdown}
        textLang={textLang}
        onSetTextLang={setTextLang}
        onShowDetails={() => setShowAnalytics(true)}
      />

      {/* Deep Analytics Modal */}
      {showAnalytics && metadata && <DeepAnalytics metadata={metadata} onClose={() => setShowAnalytics(false)} />}
    </div>
  );
}
