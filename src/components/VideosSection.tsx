import { useState } from 'react';
import { Play, Film, Youtube, Sparkles } from 'lucide-react';
import type { VideoData } from '../types';
import { getYouTubeThumbnail } from '../utils/youtube';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { TiltCard } from './TiltCard';

interface VideosSectionProps {
  videos: VideoData[];
  onOpenVideo: (url: string) => void;
}

export function VideosSection({ videos = [], onOpenVideo }: VideosSectionProps) {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const safeVideos = videos || [];
  const hasVideos = safeVideos.length > 0;

  return (
    <section
      id="videos-section"
      ref={sectionRef}
      className={`py-20 sm:py-24 border-t border-[#EFE8DF] relative overflow-hidden reveal-on-scroll scroll-mt-28 min-h-[50vh] flex flex-col justify-center ${
        isRevealed ? 'is-revealed' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {/* Section Heading with Liquid Glass Badge */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#D96C51] uppercase tracking-widest flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#D96C51]" />
              <span>DEMONSTRATIONS // MEDIA STREAM</span>
            </div>
            <h2 id="videos-heading" className="text-3xl sm:text-4xl font-serif-heading font-bold tracking-tight text-[#2C241B]">
              Featured Videos
            </h2>
          </div>
          <div className="text-xs text-[#7A6F62] font-mono px-3.5 py-1.5 rounded-full liquid-glass-pill self-start sm:self-auto flex items-center gap-2 font-sans-body">
            <span className="w-2 h-2 rounded-full bg-[#D96C51]" />
            <span>{safeVideos.length} {safeVideos.length === 1 ? 'VIDEO' : 'VIDEOS'}</span>
          </div>
        </div>

        {/* Content or Glassmorphism Placeholder */}
        {hasVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeVideos.map((video, idx) => (
              <VideoCard
                key={video.id}
                video={video}
                index={idx}
                isParentRevealed={isRevealed}
                onOpenVideo={onOpenVideo}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl liquid-glass-card border border-white/60 backdrop-blur-md text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/90 to-[#FAF2EC] border border-[#F4CBAF] flex items-center justify-center text-[#D96C51] shadow-2xs">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-heading font-bold text-[#2C241B]">
              No Videos Added Yet
            </h3>
            <p className="text-sm text-[#7A6F62] font-sans-body leading-relaxed max-w-md">
              YouTube project walkthroughs, tech deep-dives, and tutorials published from the admin dashboard will embed here with one-click modal playback.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

interface VideoCardProps {
  key?: string | number;
  video: VideoData;
  index: number;
  isParentRevealed: boolean;
  onOpenVideo: (url: string) => void;
}

function VideoCard({
  video,
  index,
  isParentRevealed,
  onOpenVideo,
}: VideoCardProps) {
  const [thumbError, setThumbError] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const thumbnail = getYouTubeThumbnail(video.youtubeUrl);
  const staggerClass = `stagger-${(index % 6) + 1}`;

  return (
    <div
      id={`video-card-${video.id}`}
      className={`reveal-on-scroll ${isParentRevealed ? `is-revealed ${staggerClass}` : ''}`}
    >
      <TiltCard
        maxTilt={7}
        glareOpacity={0.2}
        className="h-full rounded-2xl cursor-pointer"
        onClick={() => onOpenVideo(video.youtubeUrl)}
      >
        <div className="group relative flex flex-col h-full rounded-2xl liquid-glass-card liquid-glass-card-hover overflow-hidden">
          {/* Accent top gradient line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#D96C51] via-[#F4CBAF] to-white opacity-90 group-hover:opacity-100 transition-opacity" />

          {/* Thumbnail area with play button overlay */}
          <div className="aspect-video w-full bg-[#2C241B] relative overflow-hidden border-b border-white/60">
            {thumbnail && !thumbError ? (
              <>
                {!thumbLoaded && (
                  <div className="absolute inset-0 shimmer-skeleton-dark flex items-center justify-center z-0">
                    <Youtube className="w-8 h-8 text-[#D96C51]/40 animate-pulse" />
                  </div>
                )}
                <img
                  src={thumbnail}
                  alt={video.title}
                  onLoad={() => setThumbLoaded(true)}
                  onError={() => {
                    setThumbError(true);
                    setThumbLoaded(true);
                  }}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-106 relative z-1 ${
                    thumbLoaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'
                  }`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#2C241B] text-[#F4CBAF] font-mono text-xs">
                <Youtube className="w-8 h-8 text-[#D96C51] mb-1" />
                <span>YOUTUBE VIDEO</span>
              </div>
            )}

            {/* Play Icon Badge with Liquid Glass Glow */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#2C241B]/30 group-hover:bg-[#2C241B]/15 transition-colors z-10 backdrop-blur-[1px]">
              <div className="w-12 h-12 rounded-full btn-terracotta text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>

          {/* Video Title and Metadata */}
          <div className="p-5 sm:p-6 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-[#D96C51] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#D96C51]" />
                <span>VIDEO #{video.order || index + 1}</span>
              </div>
              <h3 className="text-base sm:text-lg font-serif-heading font-bold text-[#2C241B] group-hover:text-[#D96C51] transition-colors line-clamp-2 leading-snug">
                {video.title}
              </h3>
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
