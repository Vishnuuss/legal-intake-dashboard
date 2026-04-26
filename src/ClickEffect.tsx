import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
}

const NUM_PARTICLES = 10;

const ClickEffect = () => {
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  let counter = 0;

  const handleClick = useCallback((e: MouseEvent) => {
    const id = Date.now() + counter++;
    setParticles((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999]">
      <AnimatePresence>
        {particles.map(({ id, x, y }) => (
          <div key={id} style={{ position: 'absolute', left: x, top: y }}>
            {/* Outer ring burst */}
            <motion.div
              className="absolute rounded-full border border-blue-400/60"
              style={{ translateX: '-50%', translateY: '-50%' }}
              initial={{ width: 0, height: 0, opacity: 0.9 }}
              animate={{ width: 80, height: 80, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Second ring */}
            <motion.div
              className="absolute rounded-full border border-indigo-400/40"
              style={{ translateX: '-50%', translateY: '-50%' }}
              initial={{ width: 0, height: 0, opacity: 0.7 }}
              animate={{ width: 120, height: 120, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            />
            {/* Center glow dot */}
            <motion.div
              className="absolute rounded-full"
              style={{
                translateX: '-50%',
                translateY: '-50%',
                width: 8,
                height: 8,
                background: 'radial-gradient(circle, #60A5FA, #818CF8)',
                boxShadow: '0 0 12px 4px rgba(96, 165, 250, 0.6)',
              }}
              initial={{ scale: 1.5, opacity: 1 }}
              animate={{ scale: 0, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
            {/* Particle burst */}
            {Array.from({ length: NUM_PARTICLES }).map((_, i) => {
              const angle = (i / NUM_PARTICLES) * 2 * Math.PI;
              const dist = 35 + Math.random() * 25;
              const tx = Math.cos(angle) * dist;
              const ty = Math.sin(angle) * dist;
              const size = Math.random() * 3 + 2;
              const colors = ['#60A5FA', '#818CF8', '#34D399', '#F472B6', '#FBBF24'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    translateX: '-50%',
                    translateY: '-50%',
                    width: size,
                    height: size,
                    backgroundColor: color,
                    boxShadow: `0 0 6px 2px ${color}80`,
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: tx, y: ty, opacity: 0, scale: 0.3 }}
                  exit={{}}
                  transition={{
                    duration: 0.55 + Math.random() * 0.2,
                    ease: 'easeOut',
                    delay: Math.random() * 0.04,
                  }}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ClickEffect;
