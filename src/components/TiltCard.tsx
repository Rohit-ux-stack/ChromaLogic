import React, { useRef, useState, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  maxTilt?: number; // Maximum tilt rotation in degrees (e.g. 10)
  glareOpacity?: number; // Glare reflection strength (0 - 1)
  onClick?: () => void;
  tabIndex?: number;
}

export function TiltCard({
  children,
  className = '',
  id,
  maxTilt = 7,
  glareOpacity = 0.25,
  onClick,
  tabIndex,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const width = rect.width;
      const height = rect.height;

      // Calculate percentage from center (-1 to 1)
      const xPct = (x / width - 0.5) * 2;
      const yPct = (y / height - 0.5) * 2;

      // Calculate 3D tilt rotation
      const rotateX = -yPct * maxTilt;
      const rotateY = xPct * maxTilt;

      // Calculate glare position in percentage (0% to 100%)
      const glareX = (x / width) * 100;
      const glareY = (y / height) * 100;

      setTransform({
        rotateX,
        rotateY,
        glareX,
        glareY,
        isHovered: true,
      });
    },
    [maxTilt]
  );

  const handleMouseEnter = () => {
    setTransform((prev) => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onClick={onClick}
      tabIndex={tabIndex}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
      className={`tilt-card-wrapper relative ${className}`}
    >
      <div
        className="tilt-card-inner w-full h-full relative"
        style={{
          transform: transform.isHovered
            ? `rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) translateZ(12px) scale3d(1.018, 1.018, 1.018)`
            : 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
          transition: transform.isHovered
            ? 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)'
            : 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}

        {/* Specular Liquid Glare Layer */}
        {glareOpacity > 0 && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-30"
            style={{
              opacity: transform.isHovered ? glareOpacity : 0,
              background: `radial-gradient(circle 320px at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 45%, transparent 80%)`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </div>
    </div>
  );
}
