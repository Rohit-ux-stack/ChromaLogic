import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Github, Youtube, ExternalLink, Layers, Target, BookOpen, Cog, FolderGit2 } from 'lucide-react';
import type { ProjectData } from '../types';
import { ImageCarousel } from './ImageCarousel';

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
  onOpenVideo?: (url: string) => void;
}

export function ProjectModal({ project, onClose, onOpenVideo }: ProjectModalProps) {
  // Lock background scroll while the modal is open & support Escape-to-close
  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const images = project.images && project.images.length > 0 ? project.images : project.imageUrl ? [project.imageUrl] : [];
  const techList = (project.techStack || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const hasYouTube = Boolean(project.youtubeUrl?.trim());

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[60] bg-[#2C241B]/80 project-modal-backdrop flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full max-h-[92vh] liquid-glass-card project-modal-panel rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (floats over image) */}
        <button
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2C241B] flex items-center justify-center transition-colors cursor-pointer shadow-lg touch-target"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* Carousel */}
          {images.length > 0 ? (
            <ImageCarousel
              images={images}
              alt={project.title}
              aspectClassName="aspect-video"
              showCounter
            />
          ) : (
            <div className="aspect-video w-full bg-[#FAF7F2] flex items-center justify-center">
              <FolderGit2 className="w-10 h-10 text-[#D96C51]/50" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 space-y-6 font-sans-body">
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#D96C51] uppercase tracking-widest flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>PROJECT #{project.order}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#2C241B] tracking-tight">
                {project.title}
              </h2>
              {project.description && (
                <p className="text-sm sm:text-base text-[#7A6F62] leading-[1.7] whitespace-pre-line">
                  {project.description}
                </p>
              )}
            </div>

            {/* Tech Stack Chips */}
            {techList.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-[#2C241B] uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#D96C51]" />
                  <span>Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techList.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-[#2C241B]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Purpose / Objective */}
            {project.purpose && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#2C241B] uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#D96C51]" />
                  <span>Purpose &amp; Objective</span>
                </div>
                <p className="text-sm text-[#7A6F62] leading-[1.7] whitespace-pre-line">{project.purpose}</p>
              </div>
            )}

            {/* Story Behind Its Creation */}
            {project.story && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#2C241B] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#D96C51]" />
                  <span>The Story Behind It</span>
                </div>
                <p className="text-sm text-[#7A6F62] leading-[1.7] whitespace-pre-line">{project.story}</p>
              </div>
            )}

            {/* How It Works */}
            {project.howItWorks && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#2C241B] uppercase tracking-wider flex items-center gap-1.5">
                  <Cog className="w-3.5 h-3.5 text-[#D96C51]" />
                  <span>How It Works</span>
                </div>
                <p className="text-sm text-[#7A6F62] leading-[1.7] whitespace-pre-line">{project.howItWorks}</p>
              </div>
            )}

            {/* Action Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-[#EFE8DF]">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C241B] hover:bg-[#1a1510] text-white text-xs font-semibold shadow-xs transition-all min-h-[44px] touch-target active:scale-98 mt-4"
                >
                  <Github className="w-4 h-4 text-white/85" />
                  <span>Source Code</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/60" />
                </a>
              )}
              {hasYouTube && (
                <button
                  onClick={() => onOpenVideo?.(project.youtubeUrl!)}
                  className="btn-terracotta-subtle inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer min-h-[44px] touch-target mt-4"
                >
                  <Youtube className="w-4 h-4 text-[#D96C51]" />
                  <span>Watch Demo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
