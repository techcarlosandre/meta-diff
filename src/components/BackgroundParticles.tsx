'use client';
import { useEffect, useState } from 'react';

interface Particle {
  left: string;
  duration: string;
  delay: string;
  opacity: number;
  height: string;
  color: 'primary' | 'secondary';
  isDot?: boolean;
}

export default function BackgroundParticles() {
  const [elements, setElements] = useState<{ rays: Particle[], dots: Particle[] }>({ rays: [], dots: [] });

  useEffect(() => {
    // Generate Rays (High Impact Restoration)
    const newRays = [...Array(80)].map(() => ({
      left: `${Math.random() * 100}%`,
      duration: `${4 + Math.random() * 8}s`,
      delay: `${-Math.random() * 10}s`,
      opacity: Math.random() * 0.4 + 0.1,
      height: `${100 + Math.random() * 200}px`,
      color: Math.random() > 0.6 ? 'secondary' : 'primary' as 'primary' | 'secondary',
    }));

    // Generate Stardust
    const newDots = [...Array(40)].map(() => ({
      left: `${Math.random() * 100}%`,
      duration: `${15 + Math.random() * 15}s`,
      delay: `${-Math.random() * 15}s`,
      opacity: Math.random() * 0.3 + 0.1,
      height: '4px',
      color: Math.random() > 0.5 ? 'secondary' : 'primary' as 'primary' | 'secondary',
      isDot: true
    }));
    
    setElements({ rays: newRays, dots: newDots });
  }, []);

  return (
    <div className="bg-particles">
      {/* Background Stardust */}
      {elements.dots.map((p, i) => (
        <div
          key={`dot-${i}`}
          className={`particle particle-dot bg-${p.color === 'primary' ? '[#00ffcc]' : '[#ffb800]'}`}
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Main Rising Rays */}
      {elements.rays.map((p, i) => (
        <div
          key={`ray-${i}`}
          className={`particle ${p.color === 'primary' ? 'particle-primary' : 'particle-secondary'}`}
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
            height: p.height,
          }}
        />
      ))}
    </div>
  );
}
