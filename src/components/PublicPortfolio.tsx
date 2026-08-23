import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { ProjectsSection } from './ProjectsSection';
import { DesignsSection } from './DesignsSection';
import { VideosSection } from './VideosSection';
import { SocialsSection } from './SocialsSection';
import { ResumeSection } from './ResumeSection';
import { Footer } from './Footer';
import { VideoModal } from './VideoModal';
import { PortfolioSkeleton } from './PortfolioSkeleton';
import { LiquidGlassBackground } from './LiquidGlassBackground';
import { ScrollProgressBar } from './ScrollProgressBar';

export function PublicPortfolio() {
  const navigate = useNavigate();
  const portfolio = usePortfolioData();
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  // Dynamic Title sync
  useEffect(() => {
    const personName = portfolio.profile?.name?.trim() || 'Rohit Banerjee';
    const tagline = portfolio.profile?.tagline?.trim();
    if (tagline) {
      document.title = `ChromaLogic — ${personName} | ${tagline}`;
    } else {
      document.title = `ChromaLogic — ${personName}`;
    }
  }, [portfolio.profile]);

  // Stealth keyboard shortcut listener: Ctrl+Shift+A or Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div 
      id="public-portfolio-root" 
      className="min-h-screen relative text-[#2C241B] flex flex-col justify-between selection:bg-[#F4CBAF] selection:text-[#2C241B] font-sans-body overflow-x-hidden"
    >
      {/* Viewport Scroll Depth Progress Bar */}
      <ScrollProgressBar />

      {/* Ambient Liquid Glass Dynamic Canvas Layer */}
      <LiquidGlassBackground />

      <div 
        className="relative z-10 flex-1 flex flex-col transition-[padding-top] duration-200"
        style={{
          paddingTop: headerHeight > 0 ? `${headerHeight}px` : 'var(--header-height, 90px)'
        }}
      >
        <Navbar 
          portfolio={portfolio} 
          onHeightChange={(height) => setHeaderHeight(height)} 
        />
        
        <main id="main-content-flow" className="flex-1">
          {portfolio.loading ? (
            <PortfolioSkeleton />
          ) : (
            <>
              <HeroSection 
                profile={portfolio.profile} 
                resume={portfolio.resume} 
              />
              
              <ProjectsSection 
                projects={portfolio.projects} 
                onOpenVideo={(url) => setActiveVideoUrl(url)} 
              />

              <DesignsSection 
                designs={portfolio.designs} 
              />
              
              <VideosSection 
                videos={portfolio.videos} 
                onOpenVideo={(url) => setActiveVideoUrl(url)} 
              />
              
              <SocialsSection 
                socials={portfolio.socials} 
              />
              
              <ResumeSection 
                resume={portfolio.resume} 
              />
            </>
          )}
        </main>
      </div>

      <Footer />

      <VideoModal
        videoUrl={activeVideoUrl}
        onClose={() => setActiveVideoUrl(null)}
      />
    </div>
  );
}
