import React from 'react';
import { motion } from 'framer-motion';

const MemoryCard = ({ card, isFlipped, onClick }) => {
  return (
    <motion.div
      className="relative w-16 h-20 sm:w-24 sm:h-32 cursor-pointer perspective-1000"
      onClick={onClick}
      whileHover={!isFlipped ? { scale: 1.05, rotateZ: 2 } : {}}
      whileTap={!isFlipped ? { scale: 0.95 } : {}}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front (Face Down) */}
        <div 
          className="absolute w-full h-full rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"></div>
          <div className="text-2xl opacity-40">?</div>
        </div>

        {/* Back (Face Up) - EMOJI SIDE */}
        <div 
          className="absolute w-full h-full rounded-2xl bg-slate-900 border-2 border-primary-500/50 flex items-center justify-center shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-3xl sm:text-5xl select-none">
            {card.value}
          </span>
          {card.matched && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] animate-bounce">
              ✅
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemoryCard;
