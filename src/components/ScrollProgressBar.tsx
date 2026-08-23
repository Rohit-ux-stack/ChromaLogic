import { useState, useEffect } from 'react';

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      id="scroll-progress-container"
      className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        id="scroll-progress-indicator"
        className="h-full bg-gradient-to-r from-[#D96C51] via-[#F4CBAF] to-[#D96C51] shadow-[0_0_10px_rgba(217,108,81,0.7)] transition-all duration-75 ease-out"
        style={{
          width: `${scrollProgress}%`,
        }}
      />
    </div>
  );
}
