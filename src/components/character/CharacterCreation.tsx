import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store';
import { Attribute } from '../../types';

export const CharacterCreation = () => {
  const { 
    attributes, attributePoints, upgradeAttribute, 
    skills, skillPoints, unlockSkill,
    setGamePhase, isMobile 
  } = useGameStore();

  const [activeTab, setActiveTab] = React.useState<'attributes' | 'skills'>('attributes');

  const handleNext = () => {
    setGamePhase('playing');
  };

  const attrLabels: Record<string, { label: string, desc: string }> = {
    strength: { label: "SOVEREIGN ESSENCE", desc: "Amplifica la potencia destructiva de tus ataques y habilidades abisales." },
    dexterity: { label: "AGILITY CLASS", desc: "Mejora los reflejos neuronales, la velocidad de ataque y la evasión." },
    intelligence: { label: "VOID LOCOMOTION", desc: "Optimiza la propulsión a través del abismo, aumentando la velocidad de desplazamieto." },
    vitality: { label: "INTEGRITY GRADE", desc: "Aumenta la estabilidad del nexo vital y la resistencia al daño crítico." }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020205] flex flex-col items-center overflow-y-auto overflow-x-hidden pt-safe pb-safe">
      {/* Background Grid & Scanline */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,242,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />
      <div className="system-scanline fixed inset-0 opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-4xl bg-black/60 border border-white/5 backdrop-blur-3xl p-6 md:p-12 mt-10 mb-20 mx-4"
      >
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
           <div>
              <span className="text-accent-neon text-[10px] font-black tracking-[0.5em] uppercase mb-2 block">Linkage Initializing</span>
              <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase italic tracking-tighter">System Configuration</h2>
           </div>
           
           <div className="flex gap-2 md:gap-4 border-b border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('attributes')}
                className={`flex-shrink-0 pb-2 px-3 md:px-4 text-[10px] font-black uppercase tracking-widest relative transition-colors ${activeTab === 'attributes' ? 'text-accent-neon' : 'text-white/20'}`}
              >
                Attributes
                {activeTab === 'attributes' && <motion.div layoutId="char-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-neon" />}
              </button>
              <button 
                onClick={() => setActiveTab('skills')}
                className={`flex-shrink-0 pb-2 px-3 md:px-4 text-[10px] font-black uppercase tracking-widest relative transition-colors ${activeTab === 'skills' ? 'text-accent-neon' : 'text-white/20'}`}
              >
                Skills
                {activeTab === 'skills' && <motion.div layoutId="char-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-neon" />}
              </button>
           </div>

           <div className="flex gap-8">
              <div className="flex flex-col items-end">
                 <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest mb-1">Attr Points</span>
                 <div className="text-3xl font-mono font-black text-accent-neon drop-shadow-[0_0_10px_rgba(0,242,255,0.4)]">{attributePoints}</div>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest mb-1">Skill Points</span>
                 <div className="text-3xl font-mono font-black text-purple-400 drop-shadow-[0_0_10px_rgba(187,0,255,0.4)]">{skillPoints}</div>
              </div>
           </div>
        </header>

        <div className="mb-12 min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === 'attributes' ? (
              <motion.div 
                key="attr"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {Object.entries(attributes).map(([key, val]) => (
                  <div key={key} className="group relative bg-white/[0.02] border border-white/5 p-4 md:p-6 hover:bg-white/[0.05] transition-all">
                      <div className="flex justify-between items-start mb-2 md:mb-4">
                        <div className="flex flex-col">
                            <span className="text-accent-neon text-[10px] font-black uppercase tracking-widest mb-1">{key}</span>
                            <span className="text-xl font-display font-black text-white uppercase tracking-tight">{attrLabels[key].label}</span>
                        </div>
                        <div className="text-3xl font-mono font-black text-white/20 group-hover:text-white transition-colors">{val}</div>
                      </div>
                      <p className="text-[10px] text-white/40 mb-6 uppercase leading-relaxed max-w-[80%]">{attrLabels[key].desc}</p>
                      <div className="flex gap-2">
                        {attributePoints > 0 && (
                          <button 
                            onClick={() => upgradeAttribute(key as Attribute)}
                            className="bg-accent-neon text-black font-black text-[10px] px-4 py-2 uppercase tracking-widest hover:bg-white transition-colors"
                          >
                            Allocate +1
                          </button>
                        )}
                      </div>
                      <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-accent-neon transition-all duration-300" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
              >
                {skills.map((skill) => (
                  <div key={skill.id} className="group relative bg-white/[0.02] border border-white/5 p-4 md:p-6 hover:bg-white/[0.05] transition-all">
                      <div className="flex justify-between items-start mb-2 md:mb-4">
                        <div className="flex flex-col">
                            <span className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-1">{skill.id}</span>
                            <span className="text-xl font-display font-black text-white uppercase tracking-tight font-black">{skill.name}</span>
                        </div>
                        <div className={`text-[10px] px-2 py-1 border ${skill.unlocked ? 'border-accent-neon text-accent-neon' : 'border-white/10 text-white/20'} font-black uppercase`}>
                          {skill.unlocked ? 'UNLOCKED' : 'LOCKED'}
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 mb-6 uppercase leading-relaxed">
                        {skill.name === 'Spark' ? 'Carga el sistema con energía eléctrica para lanzar proyectiles de plasma.' : 'Concentra la fuerza bruta en un impacto colosal capaz de aturdir enemigos.'}
                      </p>
                      <div className="flex gap-2">
                        {!skill.unlocked && skillPoints > 0 && (
                          <button 
                            onClick={() => unlockSkill(skill.id)}
                            className="bg-purple-500 text-white font-black text-[10px] px-4 py-2 uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                          >
                            Unlock Ability
                          </button>
                        )}
                      </div>
                      <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-purple-500 transition-all duration-300" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-white/5 pt-8 md:pt-12">
           {isMobile && attributePoints > 0 && (
             <div className="text-[10px] text-accent-neon animate-pulse uppercase tracking-[0.2em]">
               ↑ Allocate all points to synchronize fully ↑
             </div>
           )}
           <motion.button
             whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,242,255,0.3)" }}
             whileTap={{ scale: 0.95 }}
             onClick={handleNext}
             className="bg-white text-black font-display font-black text-lg md:text-xl px-8 md:px-16 py-3 md:py-4 uppercase tracking-[0.3em] md:tracking-[0.5em] flex items-center gap-4 transition-all w-full md:w-auto justify-center"
           >
             Synchronize & Play
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
           </motion.button>
        </div>
      </motion.div>

      {/* Decorative Floating Text */}
      <div className="absolute right-12 top-1/2 -rotate-90 text-[10px] text-white/5 font-black uppercase tracking-[2em] pointer-events-none">
         CHARACTER_DNA_SEQUENCE_ENCRYPTED
      </div>
    </div>
  );
};
