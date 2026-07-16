import React, { useRef, useState } from 'react';

interface GlareHoverProps {
  children: React.ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
}

export default function GlareHover({
  children,
  glareColor = '#ffffff',
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 100,
  transitionDuration = 800,
  playOnce = false,
  className = '',
}: GlareHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hasPlayed = useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playOnce && hasPlayed.current) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (playOnce && hasPlayed.current) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (playOnce) {
      hasPlayed.current = true;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: 'inherit' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: isHovered ? glareOpacity : 0,
          transition: `opacity ${transitionDuration}ms ease`,
          background: `radial-gradient(circle ${glareSize}px at ${mousePos.x}px ${mousePos.y}px, ${glareColor}, transparent)`,
        }}
      />
    </div>
  );
}
