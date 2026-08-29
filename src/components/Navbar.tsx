import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, FileText, FolderGit2, Palette, Video, Share2 } from 'lucide-react';
import type { PortfolioData } from '../types';
import { registerSecretTap } from '../utils/secretSequence';

interface NavbarProps {
  portfolio?: PortfolioData;
  onHeightChange?: (height: number) => void;
}

export function Navbar({ onHeightChange }: NavbarProps) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const isScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(80);

  // Dynamic Header Height Tracking via ResizeObserver
  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
        document.documentElement.style.setProperty('--header-height', `${height}px`);
        document.documentElement.style.setProperty('--header-offset', `${height + 16}px`);
        if (onHeightChange) {
          onHeightChange(height);
        }
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(headerRef.current);
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [onHeightChange]);

  // 6 Nav Links starting with "About Me"
  const navItems = useMemo(() => {
    return [
      { id: 'about-me', label: 'About Me', icon: User },
      { id: 'projects-section', label: 'Projects', icon: FolderGit2 },
      { id: 'designs-section', label: 'Graphic Designs', icon: Palette },
      { id: 'videos-section', label: 'Videos', icon: Video },
      { id: 'socials-section', label: 'Socials', icon: Share2 },
      { id: 'resume-section', label: 'Resume', icon: FileText },
    ];
  }, []);

  const [activeSection, setActiveSection] = useState<string>('about-me');

  // Robust Scroll-Spy with IntersectionObserver & Scroll Boundary Tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 15);

      // If user clicked a link and programmatic scroll is in progress, skip observer updates
      if (isScrolling.current) return;

      // Top of page boundary check
      if (scrollY < 120) {
        setActiveSection('about-me');
        return;
      }

      // Bottom of page boundary check
      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 70;
      if (isAtBottom) {
        setActiveSection('resume-section');
        return;
      }

      // Dynamic Section check position using current measured header height
      const currentHeaderOffset = (headerRef.current?.offsetHeight || headerHeight || 80) + 70;
      const scrollCheckPos = scrollY + currentHeaderOffset;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const id = navItems[i].id;
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollCheckPos) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // High-precision dynamic IntersectionObserver
    const rootMarginTop = `-${(headerRef.current?.offsetHeight || headerHeight || 80) + 10}px 0px -40% 0px`;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling.current) return;

        if (window.scrollY < 120) {
          setActiveSection('about-me');
          return;
        }

        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) => {
            return Math.abs(curr.boundingClientRect.top - 100) <
              Math.abs(prev.boundingClientRect.top - 100)
              ? curr
              : prev;
          });
          if (topEntry.target.id) {
            setActiveSection(topEntry.target.id);
          }
        }
      },
      {
        rootMargin: rootMarginTop,
        threshold: [0.1, 0.3, 0.6],
      }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [navItems, headerHeight]);

  const handleBrandTap = () => {
    // Secret sequence tap A (ABAABBBA)
    registerSecretTap('A', () => navigate('/admin'));
  };

  // Immediate, buttery-smooth zero-lag programmatic scroll using exact dynamic header height
  const scrollTo = useCallback((id: string) => {
    // 1. Immediately pause observer updates to avoid vibrating/conflicting state jumps
    isScrolling.current = true;
    setActiveSection(id);

    // 2. Schedule resuming observer updates after scroll transition settles
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 850);

    // 3. Immediate instant execution (no timeout or artificial frame delay)
    if (id === 'about-me') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const currentHeight = headerRef.current?.offsetHeight || headerHeight || 80;
      const navOffset = currentHeight + 16; // Measured height + safety breathing room
      const rect = targetElement.getBoundingClientRect();
      const targetY = Math.max(0, rect.top + window.pageYOffset - navOffset);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, [headerHeight]);

  return (
    <header
      ref={headerRef}
      id="main-nav-header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'bg-white/55 backdrop-blur-md border-b border-white/30 py-2.5 shadow-sm'
          : 'bg-white/40 backdrop-blur-md border-b border-white/20 py-3 sm:py-3.5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 md:gap-6">
        {/* Brand: Clean, Modern ChromaLogic Logo with Prism / Logic Geometry - Secret Tap A */}
        <button
          id="brand-logo-link"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleBrandTap();
          }}
          title="ChromaLogic (Tap A)"
          className="flex items-center gap-2.5 text-[#2C241B] font-semibold tracking-tight text-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C51] rounded-xl p-1 min-h-[40px] select-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/90 to-[#FAF2EC] border border-[#F4CBAF] flex items-center justify-center shadow-2xs shrink-0 group-hover:border-[#D96C51]/60 transition-colors duration-500 ease-in-out">
            {/* ChromaLogic Modern Geometric Prism / Code Logic Glyph */}
            <svg
              className="w-4 h-4 text-[#D96C51]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
              <polyline points="2 15.5 12 8.5 22 15.5" />
            </svg>
          </div>
          <span className="text-[#2C241B] font-bold tracking-tight text-base sm:text-lg font-serif-heading">
            Chroma<span className="text-[#D96C51] font-sans-body font-semibold">Logic</span>
          </span>
        </button>

        {/* Center/Right Apple-Style Liquid Glass Segmented Navigation Slider with 6 Links */}
        <nav
          id="desktop-nav-items"
          className="relative p-1 rounded-2xl sm:rounded-full bg-white/40 backdrop-blur-md border border-white/40 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-full shadow-2xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Portfolio sections"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => scrollTo(item.id)}
                className={`relative px-2.5 sm:px-3.5 md:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer shrink-0 min-h-[34px] sm:min-h-[36px] flex items-center gap-1 sm:gap-1.5 select-none ${
                  isActive
                    ? 'text-[#D96C51] font-semibold'
                    : 'text-[#7A6F62] hover:text-[#2C241B]'
                }`}
              >
                {/* Apple-Style Framer Motion Spring Pill Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-white/90 backdrop-blur-xl border border-[#F4CBAF] shadow-sm -z-10 pointer-events-none"
                  >
                    {/* Specular Liquid Glass Top Shimmer */}
                    <div className="absolute inset-x-3 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />
                  </motion.div>
                )}

                <Icon
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-300 ease-in-out relative z-10 ${
                    isActive ? 'text-[#D96C51]' : 'text-[#7A6F62]'
                  }`}
                />
                <span className="whitespace-nowrap transition-colors duration-300 ease-in-out relative z-10">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
