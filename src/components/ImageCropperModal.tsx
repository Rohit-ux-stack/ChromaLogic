import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw as ResetIcon,
  Move,
  Crop as CropIcon,
  RefreshCw,
} from 'lucide-react';
import {
  ASPECT_PRESETS,
  DEFAULT_TRANSFORM,
  clampTransform,
  computeCoverSize,
  loadImageElement,
  renderCroppedImage,
  type CropTransform,
  type RotationDeg,
} from '../utils/cropGeometry';

export interface CropResult {
  dataUrl: string;
  width: number;
  height: number;
}

export interface ImageCropperModalProps {
  /** Raw (uncropped) source images to move through, in order. */
  sources: string[];
  /** Which index to start on. */
  startIndex?: number;
  /** Force a single aspect ratio (e.g. 1 for avatar) and hide the preset picker. */
  lockAspectRatio?: number | null;
  /** 'circle' renders the frame + preview as a circular mask (avatars). */
  cropShape?: 'rect' | 'circle';
  /** Heading shown at the top of the modal. */
  title?: string;
  onCancel: () => void;
  /** Called once, with one processed result per source, in the same order. */
  onComplete: (results: CropResult[]) => void;
}

interface PerImageState {
  transform: CropTransform;
  aspectId: string; // preset id, or 'free'
  natural: { width: number; height: number } | null;
  touched: boolean;
}

const MAX_BOX = 340; // px - max on-screen crop frame bounding box
const PREVIEW_BOX = 108; // px - live preview window size (square bounding box)

function makeDefaultState(forcedAspectId: string | null): PerImageState {
  return {
    transform: { ...DEFAULT_TRANSFORM },
    aspectId: forcedAspectId ?? 'free',
    natural: null,
    touched: false,
  };
}

export function ImageCropperModal({
  sources,
  startIndex = 0,
  lockAspectRatio = null,
  cropShape = 'rect',
  title = 'Crop Images',
  onCancel,
  onComplete,
}: ImageCropperModalProps) {
  const forcedPresetId = lockAspectRatio ? `locked-${lockAspectRatio}` : null;
  const presets = useMemo(() => {
    if (lockAspectRatio) {
      return [{ id: forcedPresetId as string, label: cropShape === 'circle' ? '1:1 (Avatar)' : 'Locked', ratio: lockAspectRatio }];
    }
    return ASPECT_PRESETS;
  }, [lockAspectRatio, forcedPresetId, cropShape]);

  const [index, setIndex] = useState(Math.min(startIndex, sources.length - 1));
  const [states, setStates] = useState<PerImageState[]>(() =>
    sources.map(() => makeDefaultState(forcedPresetId))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const imgElementsRef = useRef<(HTMLImageElement | null)[]>(sources.map(() => null));

  const current = states[index];

  // Preload the natural dimensions of the active image (and neighbors) as needed
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (imgElementsRef.current[index] && states[index].natural) return;
      try {
        const el = await loadImageElement(sources[index]);
        if (cancelled) return;
        imgElementsRef.current[index] = el;
        setStates((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            natural: { width: el.naturalWidth, height: el.naturalHeight },
          };
          return next;
        });
      } catch {
        // Ignore decode errors; leave natural null so frame renders empty gracefully
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, sources]);

  const activeAspectRatio = useMemo(() => {
    const preset = presets.find((p) => p.id === current.aspectId);
    if (preset && preset.ratio) return preset.ratio;
    // Free mode: fall back to the image's own natural aspect ratio (no forced crop)
    if (current.natural) return current.natural.width / current.natural.height;
    return 1;
  }, [presets, current.aspectId, current.natural]);

  const frame = useMemo(() => {
    let w = MAX_BOX;
    let h = MAX_BOX / activeAspectRatio;
    if (h > MAX_BOX) {
      h = MAX_BOX;
      w = MAX_BOX * activeAspectRatio;
    }
    return { width: Math.round(w), height: Math.round(h) };
  }, [activeAspectRatio]);

  const coverSize = useMemo(() => {
    if (!current.natural) return { width: frame.width, height: frame.height };
    return computeCoverSize(current.natural.width, current.natural.height, frame, current.transform.rotation);
  }, [current.natural, frame, current.transform.rotation]);

  const updateCurrent = useCallback(
    (updater: (s: PerImageState) => PerImageState) => {
      setStates((prev) => {
        const next = [...prev];
        next[index] = updater(next[index]);
        return next;
      });
    },
    [index]
  );

  const applyTransform = useCallback(
    (partial: Partial<CropTransform>, markTouched = true) => {
      updateCurrent((s) => {
        const merged: CropTransform = { ...s.transform, ...partial };
        const cSize = s.natural ? computeCoverSize(s.natural.width, s.natural.height, frame, merged.rotation) : frame;
        const clamped = clampTransform(merged, cSize, frame);
        return { ...s, transform: clamped, touched: markTouched ? true : s.touched };
      });
    },
    [updateCurrent, frame]
  );

  const setAspect = (aspectId: string) => {
    updateCurrent((s) => ({ ...s, aspectId }));
  };

  const handleRotate = () => {
    const nextRotation = (((current.transform.rotation + 90) % 360) as RotationDeg);
    applyTransform({ rotation: nextRotation });
  };

  const handleZoomDelta = (delta: number) => {
    const nextZoom = Math.min(4, Math.max(1, current.transform.zoom + delta));
    applyTransform({ zoom: nextZoom });
  };

  const handleReset = () => {
    updateCurrent((s) => ({ ...s, transform: { ...DEFAULT_TRANSFORM }, touched: false }));
  };

  // --- Drag-to-pan (mouse + single-touch) ---
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const pinchState = useRef<{ startDist: number; startZoom: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: current.transform.offsetX,
      originY: current.transform.offsetY,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    applyTransform({
      offsetX: dragState.current.originX + dx,
      offsetY: dragState.current.originY + dy,
    });
  };

  const endDrag = () => {
    dragState.current = null;
  };

  // Two-finger pinch-to-zoom (native touch events for multi-touch support)
  const onTouchStartNative = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchState.current = { startDist: dist, startZoom: current.transform.zoom };
    }
  };

  const onTouchMoveNative = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchState.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = dist / pinchState.current.startDist;
      const nextZoom = Math.min(4, Math.max(1, pinchState.current.startZoom * ratio));
      applyTransform({ zoom: nextZoom });
    }
  };

  const onTouchEndNative = () => {
    pinchState.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoomDelta(e.deltaY < 0 ? 0.08 : -0.08);
  };

  const imgTransformStyle = (scale: number): React.CSSProperties => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: coverSize.width * scale,
    height: coverSize.height * scale,
    transform: `translate(-50%, -50%) translate(${current.transform.offsetX * scale}px, ${
      current.transform.offsetY * scale
    }px) rotate(${current.transform.rotation}deg) scale(${current.transform.zoom})`,
    transformOrigin: '50% 50%',
    maxWidth: 'none',
    userSelect: 'none',
    pointerEvents: 'none',
    willChange: 'transform',
  });

  const previewFrame = useMemo(() => {
    let w = PREVIEW_BOX;
    let h = PREVIEW_BOX / activeAspectRatio;
    if (h > PREVIEW_BOX) {
      h = PREVIEW_BOX;
      w = PREVIEW_BOX * activeAspectRatio;
    }
    return { width: w, height: h };
  }, [activeAspectRatio]);
  const previewScaleFactor = previewFrame.width / frame.width;

  const goTo = (newIndex: number) => {
    setIndex(Math.min(Math.max(newIndex, 0), sources.length - 1));
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      const results: CropResult[] = [];
      for (let i = 0; i < sources.length; i++) {
        let el = imgElementsRef.current[i];
        if (!el) {
          el = await loadImageElement(sources[i]);
          imgElementsRef.current[i] = el;
        }
        const st = states[i];
        const preset = presets.find((p) => p.id === st.aspectId);
        const ratio = preset && preset.ratio ? preset.ratio : el.naturalWidth / el.naturalHeight;
        let fw = MAX_BOX;
        let fh = MAX_BOX / ratio;
        if (fh > MAX_BOX) {
          fh = MAX_BOX;
          fw = MAX_BOX * ratio;
        }
        const thisFrame = { width: Math.round(fw), height: Math.round(fh) };
        const cSize = computeCoverSize(el.naturalWidth, el.naturalHeight, thisFrame, st.transform.rotation);
        const clamped = clampTransform(st.transform, cSize, thisFrame);
        const result = renderCroppedImage(el, clamped, thisFrame, cSize, {
          maxDimension: cropShape === 'circle' ? 800 : 1600,
          quality: 0.88,
        });
        results.push(result);
      }
      onComplete(results);
    } finally {
      setIsProcessing(false);
    }
  };

  const isCircle = cropShape === 'circle';

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 cropper-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto glass-surface-elevated rounded-3xl border border-white/15 shadow-2xl flex flex-col cropper-modal-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <CropIcon className="w-4.5 h-4.5 text-purple-400" />
            <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl glass-surface hover:text-white text-neutral-400 transition-colors cursor-pointer touch-target"
            aria-label="Cancel cropping"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Batch thumbnail strip (Instagram-style) */}
        {sources.length > 1 && (
          <div className="flex items-center gap-2 px-5 sm:px-6 py-3 overflow-x-auto no-scrollbar border-b border-white/10 shrink-0">
            {sources.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  i === index ? 'border-purple-400 ring-2 ring-purple-500/40' : 'border-white/15 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                {states[i].touched && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Body: crop stage + live preview */}
        <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 sm:p-6">
          {/* Crop Stage */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div
              className="relative overflow-hidden bg-neutral-950 border border-white/10 shadow-inner cropper-stage touch-none"
              style={{
                width: frame.width,
                height: frame.height,
                borderRadius: isCircle ? '50%' : '16px',
                cursor: dragState.current ? 'grabbing' : 'grab',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
              onWheel={onWheel}
              onTouchStart={onTouchStartNative}
              onTouchMove={onTouchMoveNative}
              onTouchEnd={onTouchEndNative}
            >
              {current.natural ? (
                <img src={sources[index]} alt="" style={imgTransformStyle(1)} draggable={false} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
              )}
              {/* Rule-of-thirds guide grid */}
              <div className="absolute inset-0 pointer-events-none opacity-25 cropper-grid" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
              <Move className="w-3 h-3" />
              <span>Drag to reposition &bull; Scroll / pinch to zoom</span>
            </div>
          </div>

          {/* Controls + Live Preview */}
          <div className="flex-1 w-full space-y-5">
            {/* Live Preview */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Live Preview</div>
              <div
                className="relative overflow-hidden bg-neutral-950 border border-purple-400/30 shadow-lg mx-auto sm:mx-0"
                style={{
                  width: previewFrame.width,
                  height: previewFrame.height,
                  borderRadius: isCircle ? '50%' : '10px',
                }}
              >
                {current.natural && <img src={sources[index]} alt="" style={imgTransformStyle(previewScaleFactor)} draggable={false} />}
              </div>
            </div>

            {/* Aspect Presets */}
            {!lockAspectRatio && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Aspect Ratio</div>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAspect(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
                        current.aspectId === p.id
                          ? 'bg-purple-500 border-purple-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:border-purple-400/50 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Zoom</span>
                <span className="text-[10px] font-mono text-purple-300">{current.transform.zoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => handleZoomDelta(-0.1)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 cursor-pointer">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={current.transform.zoom}
                  onChange={(e) => applyTransform({ zoom: Number(e.target.value) })}
                  className="flex-1 accent-purple-500"
                />
                <button type="button" onClick={() => handleZoomDelta(0.1)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 cursor-pointer">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rotate + Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors touch-target"
              >
                <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Rotate 90°</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors touch-target"
              >
                <ResetIcon className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: batch nav + finish */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {sources.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-neutral-200 cursor-pointer touch-target"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-neutral-400">
                  {index + 1} / {sources.length}
                </span>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  disabled={index === sources.length - 1}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-neutral-200 cursor-pointer touch-target"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleFinish}
            disabled={isProcessing}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50 min-h-[44px] touch-target"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{sources.length > 1 ? 'Apply Crops & Save' : 'Apply Crop'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
