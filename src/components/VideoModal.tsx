import { X } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../utils/youtube';

interface VideoModalProps {
  videoUrl: string | null;
  onClose: () => void;
}

export function VideoModal({ videoUrl, onClose }: VideoModalProps) {
  if (!videoUrl) return null;

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div
      id="video-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="video-modal-content"
        className="relative w-full max-w-4xl glass-surface-elevated rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-video-modal-btn"
          onClick={onClose}
          aria-label="Close video player"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2.5 rounded-full bg-black/70 hover:bg-black text-neutral-300 hover:text-white transition-liquid focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFFF] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer touch-target border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-video w-full bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="YouTube video player"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-mono text-xs">
              INVALID VIDEO URL OR RESTRICTED BROADCAST
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
