import React from 'react';

export function LiquidGlassBackground() {
  return (
    <div
      id="liquid-glass-mesh-bg"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
      aria-hidden="true"
    >
      {/* Dynamic Animated Mesh Base Background */}
      <div 
        className="absolute inset-0 animate-mesh-shift opacity-90"
        style={{
          background: 'linear-gradient(135deg, #FBF6EE 0%, #F5EAE0 25%, #FAEDE3 50%, #F4E4D7 75%, #FBF6EE 100%)',
          backgroundSize: '300% 300%',
        }}
      />

      {/* Floating Liquid Orb 1 - Vivid Terracotta & Coral */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[65vw] h-[65vw] max-w-[750px] max-h-[750px] rounded-full opacity-70 mix-blend-multiply blur-[80px] animate-liquid-orb-1"
        style={{
          background: 'radial-gradient(circle, rgba(217, 108, 81, 0.55) 0%, rgba(244, 150, 115, 0.35) 45%, rgba(244, 203, 175, 0.15) 70%, transparent 85%)',
        }}
      />

      {/* Floating Liquid Orb 2 - Vibrant Amber & Golden Peach */}
      <div
        className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full opacity-65 mix-blend-multiply blur-[90px] animate-liquid-orb-2"
        style={{
          background: 'radial-gradient(circle, rgba(245, 166, 108, 0.55) 0%, rgba(244, 203, 175, 0.35) 50%, rgba(250, 220, 195, 0.15) 75%, transparent 90%)',
        }}
      />

      {/* Floating Liquid Orb 3 - Rose Gold, Coral & Soft Magenta Hue */}
      <div
        className="absolute top-[65%] left-[5%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full opacity-60 mix-blend-multiply blur-[85px] animate-liquid-orb-3"
        style={{
          background: 'radial-gradient(circle, rgba(224, 110, 115, 0.45) 0%, rgba(217, 108, 81, 0.35) 45%, rgba(250, 215, 195, 0.2) 70%, transparent 85%)',
        }}
      />

      {/* Floating Liquid Orb 4 - Sky & Cyan Crystal Accent */}
      <div
        className="absolute top-[50%] left-[45%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full opacity-35 mix-blend-multiply blur-[95px] animate-liquid-orb-4"
        style={{
          background: 'radial-gradient(circle, rgba(125, 195, 220, 0.45) 0%, rgba(185, 225, 235, 0.25) 50%, transparent 75%)',
        }}
      />

      {/* Floating Liquid Orb 5 - Luminous Pearl Highlight */}
      <div
        className="absolute top-[15%] left-[25%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] rounded-full opacity-60 blur-[60px] animate-liquid-orb-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 245, 235, 0.5) 40%, transparent 75%)',
        }}
      />

      {/* Subtle Micro Geometric Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(#2C241B 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
}
