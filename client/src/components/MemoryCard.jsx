import React from 'react';
import { motion } from 'framer-motion';

const MemoryCard = ({ card, index, isFlipped, isMatched, onFlip, disabled }) => {
  return (
    <motion.div
      className="relative w-24 h-32 cursor-pointer sm:w-28 sm:h-36 perspective-1000"
      onClick={() => !disabled && !isFlipped && !isMatched && onFlip(index)}
      whileHover={!disabled && !isFlipped && !isMatched ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isFlipped && !isMatched ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="w-full h-full preserve-3d transition-all duration-500"
        initial={false}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
      >
        {/* Front (Face Down) */}
        <div className="absolute w-full h-full backface-hidden rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg overflow-hidden group">
          <div className="w-full h-full bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M12 18V6M6 12h12" />
            </svg>
          </div>
        </div>

        {/* Back (Face Up) */}
        <div className="absolute w-full h-full backface-hidden rounded-xl bg-slate-900 border-2 border-primary-500/50 flex items-center justify-center shadow-xl rotate-Y-180">
          <span className="text-4xl font-bold text-primary-400">
            {isMatched || isFlipped ? card.value : ''}
          </span>
          {isMatched && (
            <div className="absolute inset-0 bg-emerald-500/10 rounded-xl border-2 border-emerald-500/50 flex items-center justify-center animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemoryCard;
