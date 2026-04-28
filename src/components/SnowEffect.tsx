import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Snowflake {
  id: number;
  x: string;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  drift: number;
}

export const SnowEffect = () => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 20,
      size: 2 + Math.random() * 4,
      opacity: 0.1 + Math.random() * 0.4,
      drift: -100 + Math.random() * 200,
    }));
  }, []);

  const windParticles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      y: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      duration: 5 + Math.random() * 10,
      width: 100 + Math.random() * 300,
      opacity: 0.05 + Math.random() * 0.1,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Snowflakes */}
      {snowflakes.map((snow) => (
        <motion.div
          key={`snow-${snow.id}`}
          className="absolute rounded-full bg-white blur-[1px]"
          style={{
            left: snow.x,
            top: -20,
            width: snow.size,
            height: snow.size,
            opacity: snow.opacity,
          }}
          animate={{
            top: '110%',
            left: `calc(${snow.x} + ${snow.drift}px)`,
          }}
          transition={{
            duration: snow.duration,
            repeat: Infinity,
            delay: snow.delay,
            ease: 'linear',
          }}
        />
      ))}

      {/* Wind Streaks */}
      {windParticles.map((particle) => (
        <motion.div
          key={`wind-${particle.id}`}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-frost-400/20 to-transparent"
          style={{
            top: particle.y,
            left: '-20%',
            width: particle.width,
            opacity: particle.opacity,
          }}
          animate={{
            left: '120%',
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
      
      {/* Atmospheric Fog layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-[#050505]/50" />
    </div>
  );
};
