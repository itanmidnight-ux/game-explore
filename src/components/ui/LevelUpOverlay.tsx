/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store';

export const LevelUpOverlay = () => {
  const isLevelingUp = useGameStore((s) => s.isLevelingUp);
  const level = useGameStore((s) => s.level);

  return (
    <AnimatePresence>
      {isLevelingUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden"
        >
          {/* Background Glitch Effects */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.2 }}
            className="absolute w-[800px] h-[800px] bg-accent-neon rounded-full blur-[120px]"
          />
          
          <div className="relative flex flex-col items-center">
             {/* Main Text */}
             <motion.div
               initial={{ y: 100, opacity: 0, skewX: -20 }}
               animate={{ y: 0, opacity: 1, skewX: 0 }}
               transition={{ type: "spring", damping: 10, stiffness: 100 }}
               className="flex flex-col items-center"
             >
                <div className="text-[12px] font-black text-accent-neon tracking-[1em] uppercase mb-4 drop-shadow-[0_0_10px_#00f2ff]">
                   Evolutionary_Sequence_Triggered
                </div>
                
                <h1 className="text-9xl font-display font-black text-white italic tracking-tighter relative">
                   LEVEL UP
                   <div className="absolute -inset-1 bg-accent-neon blur-xl opacity-20 animate-pulse" />
                </h1>

                <div className="flex gap-10 items-center mt-6">
                   <div className="w-32 h-[1px] bg-gradient-to-l from-accent-neon to-transparent" />
                   <div className="text-4xl font-display font-black text-white flex items-baseline gap-4">
                      <span className="text-xs opacity-40 uppercase tracking-widest">Sovereign_Rank:</span>
                      {level}
                   </div>
                   <div className="w-32 h-[1px] bg-gradient-to-r from-accent-neon to-transparent" />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2 px-10 opacity-60">
                   {[...Array(9)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="w-[1px] h-4 bg-accent-neon"
                      />
                   ))}
                </div>
             </motion.div>

             {/* Orbital Particles (Simulated) */}
             <div className="absolute inset-x-[-200px] inset-y-[-200px] pointer-events-none">
                {[...Array(20)].map((_, i) => (
                   <motion.div
                     key={i}
                     initial={{ 
                        x: Math.random() * 400 - 200, 
                        y: Math.random() * 400 - 200, 
                        opacity: 0,
                        scale: 0 
                     }}
                     animate={{ 
                        x: (Math.random() - 0.5) * 1000, 
                        y: (Math.random() - 0.5) * 1000, 
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0]
                     }}
                     transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                     className="absolute left-1/2 top-1/2 w-1 h-1 bg-white"
                   />
                ))}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
