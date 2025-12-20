'use client';

import Image from 'next/image';
import { ZoomInIcon, ZoomOutIcon, PanelLeftIcon } from '@/components/icons';
import { useImageZoom } from '@/hooks/useImageZoom';

interface ImageViewerProps {
  oshigataUrl: string;
  setsumeiUrl: string;
  showSetsumei: boolean;
  onToggleSetsumei: (show: boolean) => void;
  smithName: string;
  imageTransition: 'idle' | 'exit-left' | 'exit-right' | 'enter';
  hasTextPanel: boolean;
  leftPanelCollapsed: boolean;
  onToggleLeftPanel: () => void;
}

export function ImageViewer({
  oshigataUrl,
  setsumeiUrl,
  showSetsumei,
  onToggleSetsumei,
  smithName,
  imageTransition,
  hasTextPanel,
  leftPanelCollapsed,
  onToggleLeftPanel,
}: ImageViewerProps) {
  const [{ zoom, panOffset, isDragging }, handlers] = useImageZoom();

  return (
    <div
      className={`flex-1 relative flex items-center justify-center p-3 lg:p-6 min-h-0 overflow-hidden touch-none select-none ${
        zoom > 1 ? 'cursor-grab' : 'cursor-default'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
      onTouchStart={handlers.handleTouchStart}
      onTouchMove={handlers.handleTouchMove}
      onTouchEnd={handlers.handleTouchEnd}
      onWheel={handlers.handleWheel}
      onMouseDown={handlers.handleMouseDown}
      onMouseMove={handlers.handleMouseMove}
      onMouseUp={handlers.handleMouseUp}
      onMouseLeave={handlers.handleMouseLeave}
      onDoubleClick={handlers.handleDoubleClick}
      onContextMenu={handlers.handleContextMenu}
    >
      {/* Main Image with zoom transform and navigation transition */}
      <div
        className={`relative w-full h-full transition-opacity duration-300 ease-in-out ${
          imageTransition === 'exit-left' || imageTransition === 'exit-right'
            ? 'opacity-0'
            : 'opacity-100'
        }`}
        style={{
          transform: imageTransition === 'idle'
            ? `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`
            : undefined,
        }}
      >
        <Image
          src={showSetsumei ? setsumeiUrl : oshigataUrl}
          alt={`${smithName} ${showSetsumei ? 'setsumei' : 'oshigata'}`}
          fill
          className="object-contain"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          draggable={false}
        />
      </div>

      {/* Panel toggle button (left side) */}
      {hasTextPanel && (
        <button
          onClick={onToggleLeftPanel}
          aria-label={leftPanelCollapsed ? 'Show text panel' : 'Hide text panel'}
          className="hidden lg:flex absolute top-3 left-3 p-2 bg-[var(--surface)]/90 rounded border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all"
          title={leftPanelCollapsed ? 'Show text' : 'Hide text'}
        >
          <PanelLeftIcon className={`w-4 h-4 transition-transform ${leftPanelCollapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Floating control bar - vertical, near metadata panel */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 px-1.5 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 shadow-lg">
        {/* Image toggle */}
        <div className="flex flex-col items-center gap-0.5 text-[10px] font-medium">
          <button
            onClick={() => onToggleSetsumei(false)}
            aria-pressed={!showSetsumei}
            className={`px-1.5 py-1 rounded transition-all ${
              !showSetsumei
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Oshigata"
          >
            押形
          </button>
          <button
            onClick={() => onToggleSetsumei(true)}
            aria-pressed={showSetsumei}
            className={`px-1.5 py-1 rounded transition-all ${
              showSetsumei
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
            title="Setsumei"
          >
            説明
          </button>
        </div>

        <div className="w-4 h-px bg-white/20" aria-hidden="true" />

        {/* Zoom controls */}
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={handlers.handleZoomIn}
            disabled={zoom >= 5}
            aria-label="Zoom in"
            className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            <ZoomInIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlers.handleZoomReset}
            disabled={zoom === 1}
            aria-label={`Reset zoom (currently ${Math.round(zoom * 100)}%)`}
            className="text-[9px] text-white/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors tabular-nums"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handlers.handleZoomOut}
            disabled={zoom <= 1}
            aria-label="Zoom out"
            className="p-1 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <ZoomOutIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
