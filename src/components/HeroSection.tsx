import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, FileText, ArrowUpRight, ArrowDown, Terminal, Code2 } from 'lucide-react';
import type { ProfileData, ResumeData } from '../types';
import { registerSecretTap } from '../utils/secretSequence';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface HeroSectionProps {
  profile: ProfileData | null;
  resume: ResumeData | null;
}

export function HeroSection({ profile, resume }: HeroSectionProps) {
  const navigate = useNavigate();
  const [photoError, setPhotoError] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });

  const handleTapB = () => {
    registerSecretTap('B', () => navigate('/admin'));
  };

  const displayName = profile?.name?.trim() || 'Rohit Banerjee';
  const roleSubheadline = profile?.tagline?.trim() || 'Full-Stack Developer & UI/UX Specialist';
  const hasBio = Boolean(profile?.bio?.trim());
  const hasPhoto = Boolean(profile?.photoUrl?.trim()) && !photoError;
  const hasEmail = Boolean(profile?.email?.trim());
  const hasLocation = Boolean(profile?.location?.trim());
  const hasResume = Boolean(resume?.resumeUrl?.trim());

  const skillsList = profile?.skills
    ? profile.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  return (
    <section 
      id="about-me" 
      ref={sectionRef} 
      className={`relative pt-4 pb-16 md:pt-8 md:pb-24 overflow-hidden reveal-on-scroll scroll-mt-28 ${
        isRevealed ? 'is-revealed' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 md:gap-10 mb-8">
          {/* Circular Photo with Floating 3D Micro-interaction & Liquid Glass Glow - Secret Tap B */}
          {hasPhoto && (
            <div className="relative shrink-0 animate-float">
              <button
                type="button"
                onClick={handleTapB}
                title="Identity (B)"
                className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden p-1.5 bg-gradient-to-tr from-[#D96C51] via-[#F4CBAF] to-white/90 shadow-[0_12px_32px_rgba(217,108,81,0.22)] hover:scale-105 transition-all duration-400 cursor-pointer block group backdrop-blur-xl"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white/90 relative">
                  {!photoLoaded && (
                    <div className="absolute inset-0 shimmer-skeleton z-0" />
                  )}
                  <img
                    id="hero-profile-avatar"
                    src={profile?.photoUrl}
                    alt={displayName}
                    onLoad={() => setPhotoLoaded(true)}
                    onError={() => {
                      setPhotoError(true);
                      setPhotoLoaded(true);
                    }}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-108 relative z-1 ${
                      photoLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              </button>
            </div>
          )}

          {/* Main Info Header */}
          <div className="flex-1 space-y-3.5 min-w-0">
            <h1
              id="hero-person-name"
              onClick={handleTapB}
              title="Identity (B)"
              className="text-4xl sm:text-5xl md:text-6xl font-serif-heading font-bold tracking-tight text-[#2C241B] leading-[1.15] break-words cursor-pointer select-none drop-shadow-2xs"
            >
              {displayName}
            </h1>

            {/* Subheadline Defining Professional Role */}
            <p
              id="hero-role-subheadline"
              className="text-base sm:text-lg md:text-xl font-medium text-[#D96C51] leading-[1.5] max-w-2xl font-sans-body"
            >
              {roleSubheadline}
            </p>

            {/* Contact details & location with liquid glass pills */}
            {(hasEmail || hasLocation) && (
              <div id="hero-meta-details" className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-sans-body">
                {hasLocation && (
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[#7A6F62]">
                    <MapPin className="w-3.5 h-3.5 text-[#D96C51] shrink-0" />
                    <span className="truncate">{profile?.location}</span>
                  </div>
                )}
                {hasEmail && (
                  <a
                    href={`mailto:${profile?.email}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[#7A6F62] hover:text-[#2C241B] hover:border-[#D96C51]/60 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D96C51] shrink-0" />
                    <span className="truncate">{profile?.email}</span>
                  </a>
                )}
              </div>
            )}

            {/* Primary Call-To-Action Button below Location Tag */}
            <div className="pt-2">
              <a
                id="hero-cta-view-projects"
                href="#projects-section"
                className="group btn-terracotta inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold cursor-pointer active:scale-98 touch-target min-h-[44px]"
              >
                <span>View Projects</span>
                <ArrowDown className="w-4 h-4 text-white/90 transition-transform duration-300 group-hover:translate-y-1 group-hover:animate-bounce" />
              </a>
            </div>
          </div>
        </div>

        {/* 3-Item Highlights Stats Bar in Liquid Glass with 3D Hover Depth */}
        <div id="hero-stats-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-8 font-sans-body">
          <div className="p-5 rounded-2xl liquid-glass-subcard cursor-default flex flex-col justify-center">
            <div className="text-lg sm:text-xl font-serif-heading font-bold text-[#2C241B]">Full-Stack</div>
            <div className="text-xs text-[#7A6F62] font-medium mt-1">Cloud Architecture & Modern APIs</div>
          </div>
          <div className="p-5 rounded-2xl liquid-glass-subcard cursor-default flex flex-col justify-center">
            <div className="text-lg sm:text-xl font-serif-heading font-bold text-[#2C241B]">UI/UX Craft</div>
            <div className="text-xs text-[#7A6F62] font-medium mt-1">Refined Typography & 3D Glass</div>
          </div>
          <div className="p-5 rounded-2xl liquid-glass-subcard cursor-default flex flex-col justify-center">
            <div className="text-lg sm:text-xl font-serif-heading font-bold text-[#2C241B]">Production-Ready</div>
            <div className="text-xs text-[#7A6F62] font-medium mt-1">Verified End-to-End Execution</div>
          </div>
        </div>

        {/* Content Cards for Bio & Skills */}
        <div className="space-y-6">
          {/* Bio Card */}
          {hasBio && (
            <div className="p-6 sm:p-8 rounded-2xl liquid-glass-card liquid-glass-card-hover relative overflow-hidden">
              <div className="text-xs font-mono font-bold text-[#D96C51] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D96C51]" />
                <span>ABOUT & JOURNEY</span>
              </div>
              <p
                id="hero-bio-text"
                className="text-sm sm:text-base text-[#2C241B] font-normal leading-[1.75] whitespace-pre-line font-sans-body"
              >
                {profile?.bio}
              </p>
            </div>
          )}

          {/* Technical Capabilities / Skills Card */}
          {skillsList.length > 0 && (
            <div
              id="hero-skills-container"
              className="p-6 sm:p-8 rounded-2xl liquid-glass-card liquid-glass-card-hover relative overflow-hidden"
            >
              <div className="text-xs font-mono font-bold text-[#D96C51] uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#D96C51]" />
                <span>SKILLS & EXPERTISE</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => {
                  return (
                    <span
                      key={index}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-white/70 hover:bg-[#FAF2EC] text-[#2C241B] border border-[#F4CBAF]/80 hover:border-[#D96C51]/60 transition-all cursor-default select-none shadow-2xs font-sans-body backdrop-blur-md"
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resume CTA */}
          {hasResume && (
            <div className="pt-2">
              <a
                id="hero-resume-cta-btn"
                href={resume?.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-terracotta inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C51] min-h-[48px] touch-target"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>View Full Resume</span>
                <ArrowUpRight className="w-4 h-4 text-white/90" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


