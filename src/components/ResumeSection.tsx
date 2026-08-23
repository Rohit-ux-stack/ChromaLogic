import { FileText, ArrowUpRight, Award, CheckCircle2 } from 'lucide-react';
import type { ResumeData } from '../types';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface ResumeSectionProps {
  resume: ResumeData | null;
}

export function ResumeSection({ resume }: ResumeSectionProps) {
  const { ref: sectionRef, isRevealed } = useScrollReveal({ threshold: 0.1 });
  const hasResume = Boolean(resume && resume.resumeUrl && resume.resumeUrl.trim().length > 0);

  return (
    <section
      id="resume-section"
      ref={sectionRef}
      className={`py-20 sm:py-24 border-t border-[#EFE8DF] relative overflow-hidden reveal-on-scroll scroll-mt-28 min-h-[50vh] flex flex-col justify-center ${
        isRevealed ? 'is-revealed' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {hasResume ? (
          <div className="p-6 sm:p-8 md:p-12 rounded-2xl liquid-glass-card liquid-glass-card-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D96C51] via-[#F4CBAF] to-white" />

            <div className="space-y-3 max-w-xl">
              <div className="text-xs font-mono text-[#D96C51] uppercase tracking-wider flex items-center gap-2 font-semibold">
                <Award className="w-4 h-4 text-[#D96C51]" />
                <span>DOCUMENTS // VERIFIED CREDENTIALS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif-heading font-bold tracking-tight text-[#2C241B] flex items-center gap-2.5">
                <span>Curriculum Vitae / Resume</span>
                <CheckCircle2 className="w-5 h-5 text-[#D96C51] inline shrink-0" />
              </h3>
              <p className="text-xs sm:text-sm text-[#7A6F62] font-normal leading-[1.7] font-sans-body">
                Review full track record, technical depth, design portfolio, engineering leadership, and delivered milestones.
              </p>
            </div>

            <a
              id="public-resume-download-btn"
              href={resume?.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terracotta inline-flex items-center gap-2.5 px-6 sm:px-8 py-4 font-bold text-sm shadow-xs transition-all shrink-0 cursor-pointer min-h-[48px] touch-target"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Open Resume Document</span>
              <ArrowUpRight className="w-4 h-4 text-white/90" />
            </a>
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-2xl liquid-glass-card border border-white/60 backdrop-blur-md text-center max-w-xl mx-auto flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/90 to-[#FAF2EC] border border-[#F4CBAF] flex items-center justify-center text-[#D96C51] shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif-heading font-bold text-[#2C241B]">
              No Resume Uploaded Yet
            </h3>
            <p className="text-sm text-[#7A6F62] font-sans-body leading-relaxed max-w-md">
              A PDF or Google Docs resume URL uploaded in the admin dashboard will provide instant viewing and download credentials here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
