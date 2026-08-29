import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  /** Tailwind aspect-ratio class for the frame, e.g. 'aspect-video' or 'aspect-[4/3]'. */
  aspectClassName?: string;
  onImageClick?: (index: number) => void;
  /** Show numeric counter badge (e.g. "2 / 5") instead of dots when there are many images. */
  showCounter?: boolean;
  rounded?: string;
}

/**
 * Touch-first swipeable carousel built on native CSS scroll-snap so momentum
 * scrolling & swipe gestures stay on the browser's compositor thread (no JS
 * drag tracking needed) — this keeps it buttery smooth on mobile.
 */
export function ImageCarousel({
  images,
  alt,
  className = '',
  aspectClassName = 'aspect-video',
  onImageClick,
  showCounter = false,
  rounded = '',
}: ImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedFlags, setLoadedFlags] = useState<boolean[]>(() => images.map(() => false));

  const safeImages = images.length > 0 ? images : [];

  const scrollToIndex = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(idx, safeImages.length - 1));
    const child = track.children[clamped] as HTMLElement | undefined;
    if (child) {
      track.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    }
  }, [safeImages.length]);

  // Track which slide is active based on scroll position (for dots + counter)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const { scrollLeft, clientWidth } = track;
        const idx = Math.round(scrollLeft / Math.max(1, clientWidth));
        setActiveIndex((prev) => (prev !== idx ? idx : prev));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (safeImages.length === 0) return null;

  const hasMultiple = safeImages.length > 1;

  return (
    <div className={`relative group/carousel select-none ${className}`}>
      <div
        ref={trackRef}
        className={`carousel-track flex overflow-x-auto no-scrollbar ${rounded}`}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {safeImages.map((src, idx) => (
          <div
            key={idx}
            className={`shrink-0 w-full ${aspectClassName} relative bg-[#FAF7F2]/60 carousel-slide`}
            style={{ scrollSnapAlign: 'start' }}
            onClick={() => onImageClick?.(idx)}
          >
            {!loadedFlags[idx] && (
              <div className="absolute inset-0 shimmer-skeleton" aria-hidden="true" />
            )}
            <img
              src={src}
              alt={`${alt} ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              draggable={false}
              onLoad={() =>
                setLoadedFlags((prev) => {
                  const next = [...prev];
                  next[idx] = true;
                  return next;
                })
              }
              className={`w-full h-full object-cover transition-opacity duration-500 carousel-img ${
                loadedFlags[idx] ? 'opacity-100' : 'opacity-0'
              } ${onImageClick ? 'cursor-pointer' : ''}`}
            />
          </div>
        ))}
      </div>

      {hasMultiple && (
        <>
          {/* Prev / Next arrows (visible on hover for desktop; always tappable on mobile) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollToIndex(activeIndex - 1);
            }}
            disabled={activeIndex === 0}
            className="carousel-nav-btn absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white/85 hover:bg-white text-[#2C241B] shadow-md opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer touch-target"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollToIndex(activeIndex + 1);
            }}
            disabled={activeIndex === safeImages.length - 1}
            className="carousel-nav-btn absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 sm:p-2 rounded-full bg-white/85 hover:bg-white text-[#2C241B] shadow-md opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer touch-target"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {showCounter ? (
            <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-mono font-semibold pointer-events-none">
              {activeIndex + 1} / {safeImages.length}
            </div>
          ) : (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 pointer-events-none">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                  }`}
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
