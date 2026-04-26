import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
      // After 3.2s, fade the entire intro screen out
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 3.2, times: [0, 0.85, 1], ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
    >
      {/* === Ambient glow layers (background VFX) === */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.15) 50%, transparent 75%)',
          filter: 'blur(80px)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1.2], opacity: [0, 0.8, 0.6] }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />

      {/* === Outer ring pulse === */}
      <motion.div
        className="absolute rounded-full border border-white/5 pointer-events-none"
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{
          width: ['0px', '500px', '700px'],
          height: ['0px', '500px', '700px'],
          opacity: [0, 0.15, 0],
        }}
        transition={{ duration: 2.4, ease: 'easeOut', delay: 0.3 }}
      />
      <motion.div
        className="absolute rounded-full border border-white/10 pointer-events-none"
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{
          width: ['0px', '300px', '500px'],
          height: ['0px', '300px', '500px'],
          opacity: [0, 0.25, 0],
        }}
        transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
      />

      {/* === Floating particles === */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const radius = 150 + Math.random() * 80;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = Math.random() * 3 + 1;
        const delay = Math.random() * 0.8 + 0.4;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400 pointer-events-none"
            style={{ width: size, height: size }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [0, x * 0.5, x],
              y: [0, y * 0.5, y],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0.5],
            }}
            transition={{ duration: 2.2, delay, ease: 'easeOut' }}
          />
        );
      })}

      {/* === Center glass card === */}
      <motion.div
        className="relative flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo icon with glow */}
        <motion.div
          className="relative"
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5, type: 'spring', damping: 12, stiffness: 120 }}
        >
          <div className="absolute inset-0 rounded-2xl blur-xl bg-blue-500/50 scale-110" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
            <Scale className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
        </motion.div>

        {/* Firm name reveal */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1
              className="text-5xl font-bold tracking-tight text-white"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              Antigravity{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Legal
              </span>
            </motion.h1>
          </motion.div>

          <motion.div
            className="overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.4, delay: 1.25 }}
          >
            <motion.p
              className="text-gray-400 text-base tracking-[0.3em] uppercase text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              Intake Intelligence System
            </motion.p>
          </motion.div>
        </div>

        {/* Loading bar */}
        <motion.div
          className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, delay: 1.6, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.p
          className="text-xs text-gray-600 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          Initializing...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default IntroScreen;
