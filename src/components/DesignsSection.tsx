import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Palette, ExternalLink, Sparkles, X, Eye, Layers } from 'lucide-react';
import type { DesignData } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { TiltCard } from './TiltCard';
import { ImageCarousel } from './ImageCarousel';

interface DesignsSectionProps {
  designs: DesignData[];
}

export function DesignsSection({ designs = [] }: DesignsSectionProps) {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePreview, setActivePreview] = useState<DesignData | null>(null);
  const safeDesigns = designs || [];
  const hasDesigns = safeDesigns.length > 0;

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    safeDesigns.forEach((d) => {
      if (d.category?.trim()) set.add(d.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [safeDesigns]);

  // Filter designs
  const filteredDesigns = useMemo(() => {
    if (selectedCategory === 'All') return safeDesigns;
    return safeDesigns.filter((d) => d.category?.trim() === selectedCategory);
  }, [safeDesigns, selectedCategory]);

  return (
    <section
      id="designs-section"
      ref={sectionRef}
      className={`py-20 sm:py-24 border-t border-[#EFE8DF] relative overflow-hidden reveal-on-scroll scroll-mt-28 min-h-[50vh] flex flex-col justify-center ${
        isRevealed ? 'is-revealed' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {/* Section Heading with Liquid Glass Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#D96C51] uppercase tracking-widest flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#D96C51]" />
              <span>VISUAL WORKS // DESIGN SHOWCASE</span>
            </div>
            <h2 id="designs-heading" className="text-3xl sm:text-4xl font-serif-heading font-bold tracking-tight text-[#2C241B]">
              Graphic Design & Visuals
            </h2>
          </div>

          <div className="text-xs text-[#7A6F62] font-mono px-3.5 py-1.5 rounded-full liquid-glass-pill self-start sm:self-auto flex items-center gap-2 font-sans-body">
            <span className="w-2 h-2 rounded-full bg-[#D96C51]" />
            <span>{safeDesigns.length} {safeDesigns.length === 1 ? 'ARTWORK' : 'ARTWORKS'}</span>
          </div>
        </div>

        {/* Content or Glassmorphism Placeholder */}
        {hasDesigns ? (
          <>
            {/* Category Filter Chips */}
            {categories.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 font-sans-body">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-98 shadow-2xs ${
                        isSelected
                          ? 'bg-[#D96C51] text-white border border-[#D96C51] shadow-xs'
                          : 'liquid-glass-pill text-[#7A6F62] hover:text-[#2C241B] hover:border-[#F4CBAF]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Staggered 3D Tilt Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredDesigns.map((design, idx) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  index={idx}
                  isParentRevealed={isRevealed}
                  onPreview={(d) => setActivePreview(d)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl liquid-glass-card border border-white/60 backdrop-blur-md text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/90 to-[#FAF2EC] border border-[#F4CBAF] flex items-center justify-center text-[#D96C51] shadow-2xs">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-heading font-bold text-[#2C241B]">
              No Graphic Designs Added Yet
            </h3>
            <p className="text-sm text-[#7A6F62] font-sans-body leading-relaxed max-w-md">
              Brand identities, illustrations, poster designs, and UI assets published from the admin panel will showcase here with high-resolution lightbox previewing.
            </p>
          </div>
        )}
      </div>

      {/* High-Res Liquid Glass Lightbox Modal */}
      {activePreview && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePreview.title}
          className="fixed inset-0 z-50 bg-[#2C241B]/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActivePreview(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] liquid-glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/70 flex items-center justify-between bg-[#FAF7F2]/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#FAF2EC] text-[#D96C51] text-[11px] font-mono font-semibold">
                  {activePreview.category || 'Graphic Design'}
                </span>
                <h3 className="text-base sm:text-lg font-serif-heading font-bold text-[#2C241B] truncate">
                  {activePreview.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#7A6F62] hover:text-[#2C241B] border border-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 overflow-auto bg-[#FAF7F2]/50 p-4 flex items-center justify-center min-h-[300px] max-h-[65vh]">
              {(() => {
                const modalImages =
                  activePreview.images && activePreview.images.length > 0
                    ? activePreview.images
                    : activePreview.imageUrl
                    ? [activePreview.imageUrl]
                    : [];
                return modalImages.length > 1 ? (
                  <ImageCarousel
                    images={modalImages}
                    alt={activePreview.title}
                    aspectClassName="aspect-[4/3]"
                    className="w-full max-w-2xl rounded-xl overflow-hidden shadow-lg border border-white/40"
                    showCounter
                  />
                ) : (
                  <img
                    src={modalImages[0]}
                    alt={activePreview.title}
                    className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-white/40"
                    referrerPolicy="no-referrer"
                  />
                );
              })()}
            </div>

            {/* Modal Footer Description */}
            <div className="p-6 border-t border-white/70 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans-body">
              <div className="space-y-1 max-w-xl">
                {activePreview.clientOrTool && (
                  <div className="text-xs font-mono text-[#D96C51] font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D96C51]" />
                    <span>Tools & Context: {activePreview.clientOrTool}</span>
                  </div>
                )}
                {activePreview.description && (
                  <p className="text-xs sm:text-sm text-[#7A6F62] leading-[1.7] whitespace-pre-line">
                    {activePreview.description}
                  </p>
                )}
              </div>

              {activePreview.projectUrl && (
                <a
                  href={activePreview.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-terracotta inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-xs transition-all shrink-0"
                >
                  <span>View Project</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

interface DesignCardProps {
  key?: string | number;
  design: DesignData;
  index: number;
  isParentRevealed: boolean;
  onPreview: (design: DesignData) => void;
}

function DesignCard({
  design,
  index,
  isParentRevealed,
  onPreview,
}: DesignCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const staggerClass = `stagger-${(index % 6) + 1}`;
  const coverImage = (design.images && design.images.length > 0 ? design.images[0] : design.imageUrl) || '';
  const hasMultipleImages = Boolean(design.images && design.images.length > 1);

  return (
    <div
      id={`design-card-${design.id}`}
      className={`reveal-on-scroll ${isParentRevealed ? `is-revealed ${staggerClass}` : ''}`}
    >
      <TiltCard
        maxTilt={7}
        glareOpacity={0.22}
        className="h-full rounded-2xl"
      >
        <div className="group flex flex-col h-full rounded-2xl liquid-glass-card liquid-glass-card-hover overflow-hidden relative">
          {/* Top Specular Accent Strip */}
          <div className="h-1 w-full bg-gradient-to-r from-[#D96C51] via-[#F4CBAF] to-white opacity-90 group-hover:opacity-100 transition-opacity" />

          {/* Image Thumbnail Area */}
          <div
            className="aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2]/60 relative cursor-pointer group/img border-b border-white/60"
            onClick={() => onPreview(design)}
          >
            {!imageError && coverImage ? (
              <>
                {/* Shimmer Skeleton while loading */}
                {!imageLoaded && (
                  <div className="absolute inset-0 shimmer-skeleton flex items-center justify-center z-0">
                    <div className="flex flex-col items-center gap-2 text-[#7A6F62]/40">
                      <div className="w-8 h-8 rounded-lg bg-[#EFE8DF]/60 flex items-center justify-center animate-pulse">
                        <Palette className="w-4 h-4 text-[#D96C51]/60" />
                      </div>
                    </div>
                  </div>
                )}

                <img
                  src={coverImage}
                  alt={design.title}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover/img:scale-106 relative z-1 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {hasMultipleImages && (
                  <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-mono font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{design.images!.length}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#7A6F62] bg-[#FAF7F2] p-4 text-center">
                <Palette className="w-8 h-8 mb-2 opacity-50 text-[#D96C51]" />
                <span className="text-xs font-mono">Visual Artwork</span>
              </div>
            )}

            {/* Hover Overlay with Quick Preview Icon */}
            <div className="absolute inset-0 bg-[#2C241B]/35 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 pointer-events-none backdrop-blur-[2px]">
              <div className="px-4 py-2 rounded-full bg-white/95 text-[#2C241B] text-xs font-semibold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover/img:translate-y-0 transition-transform">
                <Eye className="w-3.5 h-3.5 text-[#D96C51]" />
                <span>Expand Artwork</span>
              </div>
            </div>

            {/* Category Pill */}
            <div className="absolute top-3 left-3 pointer-events-none z-10">
              <span className="px-2.5 py-1 rounded-full bg-[#2C241B]/80 backdrop-blur-md text-white text-[10px] font-mono font-semibold uppercase tracking-wider shadow-sm">
                {design.category || 'Graphic Design'}
              </span>
            </div>
          </div>

          {/* Card Info */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7A6F62] font-mono">
                <div className="flex items-center gap-1 text-[#D96C51] font-semibold">
                  <Sparkles className="w-3 h-3 text-[#D96C51]" />
                  <span>DESIGN #{design.order || index + 1}</span>
                </div>
                {design.clientOrTool && (
                  <span className="truncate max-w-[140px] text-[11px] text-[#7A6F62] bg-white/80 px-2 py-0.5 rounded-md border border-[#F4CBAF]/60">
                    {design.clientOrTool}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-serif-heading font-bold text-[#2C241B] group-hover:text-[#D96C51] transition-colors tracking-tight line-clamp-1">
                {design.title}
              </h3>

              {design.description && (
                <p className="text-xs sm:text-sm text-[#7A6F62] font-normal leading-[1.7] line-clamp-2 font-sans-body">
                  {design.description}
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-1 flex items-center justify-between gap-2 font-sans-body">
              <button
                onClick={() => onPreview(design)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D96C51] hover:text-[#c45a40] transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Details</span>
              </button>

              {design.projectUrl && (
                <a
                  href={design.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-[#FAF2EC] text-[#2C241B] text-xs font-semibold transition-colors border border-[#F4CBAF]/80 shadow-2xs"
                >
                  <span>Link</span>
                  <ExternalLink className="w-3 h-3 text-[#7A6F62]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
