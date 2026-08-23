import { useState } from 'react';
import { Github, Youtube, ExternalLink, Sparkles, FolderGit2 } from 'lucide-react';
import type { ProjectData } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { TiltCard } from './TiltCard';

interface ProjectsSectionProps {
  projects: ProjectData[];
  onOpenVideo?: (url: string) => void;
}

export function ProjectsSection({ projects, onOpenVideo }: ProjectsSectionProps) {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const hasProjects = Boolean(projects && projects.length > 0);

  return (
    <section 
      id="projects-section" 
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
              <FolderGit2 className="w-3.5 h-3.5 text-[#D96C51]" />
              <span>PORTFOLIO // FEATURED BUILDS</span>
            </div>
            <h2 id="projects-heading" className="text-3xl sm:text-4xl font-serif-heading font-bold tracking-tight text-[#2C241B]">
              Featured Projects
            </h2>
          </div>
          <div className="text-xs text-[#7A6F62] font-mono px-3.5 py-1.5 rounded-full liquid-glass-pill self-start sm:self-auto flex items-center gap-2 font-sans-body">
            <span className="w-2 h-2 rounded-full bg-[#D96C51]" />
            <span>{projects?.length || 0} {(projects?.length || 0) === 1 ? 'PROJECT' : 'PROJECTS'}</span>
          </div>
        </div>

        {/* Content or Glassmorphism Placeholder */}
        {hasProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {projects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
                isParentRevealed={isRevealed}
                onOpenVideo={onOpenVideo}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl liquid-glass-card border border-white/60 backdrop-blur-md text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/90 to-[#FAF2EC] border border-[#F4CBAF] flex items-center justify-center text-[#D96C51] shadow-2xs">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-heading font-bold text-[#2C241B]">
              No Projects Added Yet
            </h3>
            <p className="text-sm text-[#7A6F62] font-sans-body leading-relaxed max-w-md">
              Projects published in the admin console will appear here with live preview screenshots, source repositories, and video walkthroughs.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

interface ProjectCardProps {
  key?: string | number;
  project: ProjectData;
  index: number;
  isParentRevealed: boolean;
  onOpenVideo?: (url: string) => void;
}

function ProjectCard({
  project,
  index,
  isParentRevealed,
  onOpenVideo,
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage = Boolean(project.imageUrl?.trim()) && !imageError;
  const hasYouTube = Boolean(project.youtubeUrl?.trim());
  const staggerClass = `stagger-${(index % 6) + 1}`;

  return (
    <div
      id={`project-card-${project.id}`}
      className={`reveal-on-scroll ${isParentRevealed ? `is-revealed ${staggerClass}` : ''}`}
    >
      <TiltCard
        maxTilt={6}
        glareOpacity={0.2}
        className="h-full rounded-2xl"
      >
        <div className="group flex flex-col h-full rounded-2xl liquid-glass-card liquid-glass-card-hover overflow-hidden relative">
          {/* Top Specular Line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#D96C51] via-[#F4CBAF] to-white opacity-90 group-hover:opacity-100 transition-opacity" />

          {/* Screenshot / Image Blob (with Shimmer Skeleton Loading) */}
          {hasImage && (
            <div className="aspect-video w-full overflow-hidden bg-[#FAF7F2]/60 relative border-b border-white/60">
              {/* Shimmer Skeleton while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 shimmer-skeleton flex items-center justify-center z-0">
                  <div className="flex flex-col items-center gap-2 text-[#7A6F62]/40">
                    <div className="w-8 h-8 rounded-lg bg-[#EFE8DF]/60 flex items-center justify-center animate-pulse">
                      <FolderGit2 className="w-4 h-4 text-[#D96C51]/60" />
                    </div>
                  </div>
                </div>
              )}

              <img
                src={project.imageUrl}
                alt={project.title}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 relative z-1 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          )}

          {/* Card Content */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-mono font-semibold text-[#D96C51] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D96C51]" />
                  <span>PROJECT #{project.order || index + 1}</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif-heading font-bold text-[#2C241B] group-hover:text-[#D96C51] transition-colors tracking-tight">
                {project.title}
              </h3>
              <p className="text-sm text-[#7A6F62] font-normal leading-[1.7] whitespace-pre-line font-sans-body">
                {project.description}
              </p>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {project.githubUrl && (
                <a
                  id={`project-github-${project.id}`}
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C241B] hover:bg-[#1a1510] text-white text-xs font-semibold shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C241B] min-h-[44px] touch-target active:scale-98"
                >
                  <Github className="w-4 h-4 text-white/85" />
                  <span>Source Code</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/60" />
                </a>
              )}

              {hasYouTube && (
                <button
                  id={`project-youtube-${project.id}`}
                  onClick={() => onOpenVideo && onOpenVideo(project.youtubeUrl!)}
                  className="btn-terracotta-subtle inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C51] min-h-[44px] touch-target"
                >
                  <Youtube className="w-4 h-4 text-[#D96C51]" />
                  <span>Watch Demo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}

