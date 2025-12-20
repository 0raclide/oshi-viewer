'use client';

import { useState, useRef, useCallback } from 'react';

interface ZoomState {
  zoom: number;
  panOffset: { x: number; y: number };
  isDragging: boolean;
}

interface ZoomHandlers {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  handleDoubleClick: () => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleContextMenu: (e: React.MouseEvent) => void;
  resetZoom: () => void;
}

export function useImageZoom(): [ZoomState, ZoomHandlers] {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const lastTouchDistance = useRef<number | null>(null);
  const lastPanPosition = useRef<{ x: number; y: number } | null>(null);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoom(2.5);
    }
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 && e.button === 0) {
      setIsDragging(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, [zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && lastMousePosition.current) {
      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    lastMousePosition.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    lastMousePosition.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1) {
      lastPanPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / lastTouchDistance.current;

      setZoom(prev => {
        const newZoom = Math.min(Math.max(prev * scale, 1), 5);
        if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
        return newZoom;
      });

      lastTouchDistance.current = distance;
    } else if (e.touches.length === 1 && lastPanPosition.current) {
      const deltaX = e.touches[0].clientX - lastPanPosition.current.x;
      const deltaY = e.touches[0].clientY - lastPanPosition.current.y;

      setZoom(currentZoom => {
        if (currentZoom > 1) {
          setPanOffset(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
        }
        return currentZoom;
      });
      lastPanPosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null;
    lastPanPosition.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => {
        const newZoom = Math.min(Math.max(prev * zoomDelta, 1), 5);
        if (newZoom === 1) setPanOffset({ x: 0, y: 0 });
        return newZoom;
      });
    } else if (zoom > 1) {
      e.preventDefault();
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [zoom]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
    }
  }, [zoom]);

  return [
    { zoom, panOffset, isDragging },
    {
      handleZoomIn,
      handleZoomOut,
      handleZoomReset,
      handleDoubleClick,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleWheel,
      handleContextMenu,
      resetZoom,
    },
  ];
}
