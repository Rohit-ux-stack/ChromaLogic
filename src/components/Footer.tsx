import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { registerSecretTap } from '../utils/secretSequence';

export function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const handleTapA = () => {
    registerSecretTap('A', () => navigate('/admin'));
  };

  const handleTapB = () => {
    registerSecretTap('B', () => navigate('/admin'));
  };

  return (
    <footer id="public-footer" className="py-12 border-t border-[#EFE8DF] bg-[#FAF7F2] text-[#7A6F62] text-xs select-none font-sans-body">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center gap-4">
        {/* Top Row: Clean ChromaLogic Branding */}
        <div className="flex items-center justify-center">
          <button
            id="footer-brand-tap-a"
            type="button"
            onClick={handleTapA}
            title="ChromaLogic"
            className="flex items-center gap-2 group cursor-pointer focus:outline-none p-1 rounded-xl"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FAF2EC] to-[#F4E3D7] border border-[#F4CBAF] flex items-center justify-center shadow-2xs group-hover:border-[#D96C51]/50 transition-colors">
              <svg
                className="w-3.5 h-3.5 text-[#D96C51]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
                <polyline points="2 15.5 12 8.5 22 15.5" />
              </svg>
            </div>
            <span className="font-bold text-[#2C241B] tracking-tight text-sm font-serif-heading">
              Chroma<span className="text-[#D96C51] font-sans-body font-semibold">Logic</span>
            </span>
          </button>
        </div>

        {/* Bottom Row: © 2026 Rohit Banerjee & Verified Portfolio centered */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-[#7A6F62] font-mono">
          <button
            id="footer-copyright-tap-b"
            type="button"
            onClick={handleTapB}
            className="hover:text-[#2C241B] transition-colors cursor-pointer"
          >
            © {year} Rohit Banerjee (Spyder)
          </button>
          
          <span className="text-[#EFE8DF]">•</span>
          
          <button
            id="footer-verified-tap-a"
            type="button"
            onClick={handleTapA}
            className="text-[#D96C51] hover:text-[#c45a40] transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
          >
            <Sparkles className="w-3 h-3 text-[#D96C51]" />
            <span>Verified Portfolio</span>
          </button>
        </div>
      </div>
    </footer>
  );
}



