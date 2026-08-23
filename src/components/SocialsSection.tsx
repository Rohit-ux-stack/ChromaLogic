import { 
  Github, 
  Linkedin, 
  Youtube, 
  Instagram, 
  Globe, 
  ExternalLink,
  Share2
} from 'lucide-react';
import type { SocialData, SocialPlatform } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface SocialsSectionProps {
  socials: SocialData[];
}

export function SocialsSection({ socials = [] }: SocialsSectionProps) {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const safeSocials = socials || [];
  const validSocials = safeSocials.filter((s) => s.socialUrl && s.socialUrl.trim().length > 0);
  const hasSocials = validSocials.length > 0;

  return (
    <section
      id="socials-section"
      ref={sectionRef}
      className={`py-20 sm:py-24 border-t border-[#EFE8DF] relative overflow-hidden reveal-on-scroll scroll-mt-28 min-h-[50vh] flex flex-col justify-center ${
        isRevealed ? 'is-revealed' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#D96C51] uppercase tracking-widest flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-[#D96C51]" />
              <span>COMMUNICATION // DIRECT CHANNELS</span>
            </div>
            <h2 id="socials-heading" className="text-3xl sm:text-4xl font-serif-heading font-bold tracking-tight text-[#2C241B]">
              Connect & Follow
            </h2>
          </div>
          <div className="text-xs text-[#7A6F62] font-mono px-3.5 py-1.5 rounded-full liquid-glass-pill self-start sm:self-auto flex items-center gap-2 font-sans-body">
            <span className="w-2 h-2 rounded-full bg-[#D96C51]" />
            <span>{validSocials.length} {validSocials.length === 1 ? 'CHANNEL' : 'CHANNELS'}</span>
          </div>
        </div>

        {/* Content or Glassmorphism Placeholder */}
        {hasSocials ? (
          <div className="flex flex-wrap gap-3 sm:gap-4 font-sans-body">
            {validSocials.map((social, idx) => (
              <SocialButton
                key={social.id}
                social={social}
                index={idx}
                isParentRevealed={isRevealed}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl liquid-glass-card border border-white/60 backdrop-blur-md text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/90 to-[#FAF2EC] border border-[#F4CBAF] flex items-center justify-center text-[#D96C51] shadow-2xs">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-heading font-bold text-[#2C241B]">
              No Social Channels Added Yet
            </h3>
            <p className="text-sm text-[#7A6F62] font-sans-body leading-relaxed max-w-md">
              GitHub, LinkedIn, YouTube, Twitter/X, and custom links added in the admin console will render here as interactive liquid glass badges.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

interface SocialButtonProps {
  key?: string | number;
  social: SocialData;
  index: number;
  isParentRevealed: boolean;
}

function SocialButton({ social, index, isParentRevealed }: SocialButtonProps) {
  const staggerClass = `stagger-${(index % 6) + 1}`;

  const getPlatformConfig = (platform: SocialPlatform) => {
    switch (platform) {
      case 'GitHub':
        return {
          icon: <Github className="w-5 h-5 text-stone-900" />,
          accent: 'hover:border-stone-800 hover:bg-stone-50',
          textColor: 'text-stone-900',
        };
      case 'LinkedIn':
        return {
          icon: <Linkedin className="w-5 h-5 text-[#0077b5]" />,
          accent: 'hover:border-[#0077b5] hover:bg-blue-50/50',
          textColor: 'text-stone-900',
        };
      case 'YouTube':
        return {
          icon: <Youtube className="w-5 h-5 text-[#ff0000]" />,
          accent: 'hover:border-red-500 hover:bg-red-50/50',
          textColor: 'text-stone-900',
        };
      case 'Instagram':
        return {
          icon: <Instagram className="w-5 h-5 text-[#e4405f]" />,
          accent: 'hover:border-pink-500 hover:bg-pink-50/50',
          textColor: 'text-stone-900',
        };
      case 'Twitter/X':
        return {
          icon: (
            <span className="font-bold font-sans text-sm flex items-center justify-center w-5 h-5 text-stone-900">
              𝕏
            </span>
          ),
          accent: 'hover:border-stone-800 hover:bg-stone-50',
          textColor: 'text-stone-900',
        };
      case 'Other':
      default:
        return {
          icon: <Globe className="w-5 h-5 text-amber-600" />,
          accent: 'hover:border-amber-500 hover:bg-amber-50/50',
          textColor: 'text-stone-900',
        };
    }
  };

  const config = getPlatformConfig(social.socialPlatform);

  return (
    <a
      id={`social-link-${social.id}`}
      href={social.socialUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl liquid-glass-card liquid-glass-card-hover text-[#2C241B] font-semibold text-xs sm:text-sm shadow-xs transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96C51] min-h-[48px] touch-target active:scale-98 reveal-on-scroll ${
        isParentRevealed ? `is-revealed ${staggerClass}` : ''
      } ${config.accent}`}
    >
      <div className="transition-transform group-hover:scale-110 shrink-0">
        {config.icon}
      </div>
      <span className={config.textColor}>
        {social.socialPlatform}
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-[#7A6F62] group-hover:text-[#2C241B] transition-colors ml-1 shrink-0" />
    </a>
  );
}
