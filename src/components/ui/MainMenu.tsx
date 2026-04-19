import React from 'react';
import { motion } from 'motion/react';
import { useGameStore } from '../../store';

export const MainMenu = () => {
  const { startNewGame, setGamePhase, level } = useGameStore();

  const handleContinue = () => {
    setGamePhase('playing');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* Cinematic Background (Video/Animated Gradients) */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-black to-purple-900 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.15),transparent_70%)]" />
      </div>

      {/* Floating Particles in Background */}
      <div className="absolute inset-0 system-scanline opacity-20" />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="relative z-10 w-full h-full flex flex-col justify-between p-12 md:p-20"
      >
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-accent-neon text-[10px] font-black uppercase tracking-[0.8em] mb-4">SYSTEM_BOOT_INITIALIZED</span>
              <h1 className="text-[12vw] md:text-[8vw] font-display font-black text-white leading-[0.85] uppercase tracking-tighter mix-blend-difference">
                 Shadow<br />
                 <span className="text-accent-neon">Sovereignty</span>
              </h1>
           </div>
           <div className="hidden md:flex flex-col items-end gap-2 text-right">
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em]">Neural Link Status</span>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-accent-neon animate-pulse" />
                 <span className="text-xs font-mono text-accent-neon tracking-widest uppercase italic">Stable_Connection</span>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="flex flex-col gap-8 w-full max-w-sm">
            {level > 1 && (
              <motion.button
                whileHover={{ x: 10 }}
                onClick={handleContinue}
                className="group flex flex-col items-start text-left"
              >
                <span className="text-[10px] text-white/40 font-black tracking-[0.5em] uppercase mb-1">01_Resume_Linkage</span>
                <span className="text-3xl font-display font-black text-white group-hover:text-accent-neon uppercase tracking-widest transition-colors">Continue Journey</span>
                <span className="text-[8px] font-mono text-accent-neon/60 mt-1">LVL {level} // Nexus_Shard_Saved</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ x: 10 }}
              onClick={startNewGame}
              className="group flex flex-col items-start text-left"
            >
              <span className="text-[10px] text-white/40 font-black tracking-[0.5em] uppercase mb-1">02_New_Initialization</span>
              <span className="text-3xl font-display font-black text-white group-hover:text-accent-neon uppercase tracking-widest transition-colors">Start Linkage</span>
            </motion.button>
            
            <motion.button
              whileHover={{ x: 10 }}
              className="group flex flex-col items-start text-left opacity-60"
            >
              <span className="text-[10px] text-white/40 font-black tracking-[0.5em] uppercase mb-1">03_System_Options</span>
              <span className="text-3xl font-display font-black text-white group-hover:text-accent-neon uppercase tracking-widest transition-colors">Settings</span>
            </motion.button>
          </div>

          <div className="flex flex-col items-end gap-1">
             <div className="text-[10px] text-white/20 font-black uppercase tracking-[1em] mb-4">Build_Registry: v1.2.4R</div>
             <div className="flex gap-2">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`w-1 h-1 ${i < 12 ? 'bg-accent-neon/50' : 'bg-white/5'}`} />
                ))}
             </div>
          </div>
        </div>
      </motion.div>

      {/* Epic Corner Accents */}
      <div className="absolute top-10 left-10 w-32 h-32 border-l border-t border-white/10" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-r border-b border-white/10" />
      
      {/* Floating UI Deco */}
      <div className="absolute left-10 bottom-10 flex flex-col gap-1">
         <div className="w-1 h-1 bg-accent-neon" />
         <div className="w-1 h-1 bg-accent-neon/50" />
         <div className="w-1 h-1 bg-accent-neon/20" />
      </div>

      {/* Credits/Disclaimer */}
      <div className="absolute bottom-8 text-[8px] text-white/20 uppercase tracking-[0.5em] font-medium">
         All Rights Reserved // Shadow Sovereign Digital Media
      </div>
    </div>
  );
};
