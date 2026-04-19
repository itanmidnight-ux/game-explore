/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store';
import { Recipe, Attribute, Skill } from '../../types';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'crafting' | 'progression';
}

const RECIPES: Recipe[] = [
  {
    id: 'obsidian_sword',
    name: 'Obsidian Blade',
    ingredients: [{ itemId: 'mineral_1', count: 10 }],
    result: { id: 'obs_blade_2', name: 'Master Obsidian Blade', type: 'weapon', stats: { strength: 5 } }
  },
  {
    id: 'health_pot',
    name: 'Blood Potion',
    ingredients: [{ itemId: 'herb_1', count: 3 }],
    result: { id: 'pot_1', name: 'Blood Potion', type: 'potion' }
  }
];

export const GameMenu = ({ isOpen, onClose, type }: MenuProps) => {
  const { 
    attributes, level, attributePoints, upgradeAttribute,
    skills, skillPoints, unlockSkill,
    inventory, craftItem, addXP,
    rest, gameTime, activeQuests
  } = useGameStore();

  if (!isOpen) return null;

  const hours = Math.floor(gameTime);
  const minutes = Math.floor((gameTime % 1) * 60);
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full h-full md:h-[80vh] md:max-w-5xl bg-[#0c0c0c] md:border md:border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
      >
        {/* System Header */}
        <div className="flex justify-between items-stretch border-b border-white/5 bg-white/[0.02] pt-safe">
           <div className="flex">
              <button 
                onClick={() => onClose()}
                className={`px-6 md:px-10 py-4 md:py-5 text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] transition-all relative text-accent-neon`}
              >
                {type === 'progression' ? 'Hunter Profile' : 'Void Forge'}
                <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-1 bg-accent-neon shadow-[0_0_20px_#00f2ff]" />
              </button>
           </div>

           <div className="flex items-center px-4 md:px-6 gap-4 md:gap-6 border-l border-white/5">
              <div className="hidden sm:flex flex-col items-end">
                 <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">System Sync</span>
                 <span className="text-xs font-mono text-accent-neon">{timeString} CORE</span>
              </div>
              <button onClick={onClose} className="p-3 md:p-4 hover:bg-white/5 transition-colors group">
                 <div className="w-8 h-8 md:w-6 md:h-6 border border-white/40 flex items-center justify-center group-hover:border-accent-neon rounded-full md:rounded-none">
                    <span className="text-sm md:text-xs font-black text-white">X</span>
                 </div>
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-safe">
          {type === 'progression' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
               <div className="flex flex-col gap-6 md:gap-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-accent-neon font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-4">Hunter Profile</span>
                     <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">SOVEREIGN OF<br />SHADOWS</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                     <InfoItem label="Level" value={level} />
                     <InfoItem label="Rank" value="S-CLASS" />
                     <InfoItem label="Attributes" value={attributePoints} sub="Points Available" highlight={attributePoints > 0} />
                     <InfoItem label="Skills" value={skillPoints} sub="Points Available" highlight={skillPoints > 0} />
                  </div>
                  <button 
                    onClick={() => { rest(); onClose(); }}
                    className="w-full py-4 border border-accent-neon/30 hover:border-accent-neon bg-accent-neon/5 text-accent-neon text-[10px] font-black uppercase tracking-[0.4em] transition-all"
                  >
                    REGENERATE SYSTEM (SKIP 8H)
                  </button>
               </div>
               <div className="space-y-4 pt-4 md:pt-0">
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Active Quests</span>
                  {activeQuests.length > 0 ? activeQuests.map(q => (
                    <div key={q.id} className="bg-white/5 border border-white/10 p-4">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-black text-white uppercase">{q.title}</span>
                          <span className="text-accent-neon text-[8px] font-black uppercase tracking-widest">{q.xpReward} XP</span>
                       </div>
                       <p className="text-[9px] text-white/40 leading-relaxed uppercase">{q.description}</p>
                    </div>
                  )) : (
                    <div className="text-[10px] text-white/20 uppercase tracking-widest italic">No active missions</div>
                  )}

                   <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-6 block">Attributes</span>
                   {(Object.entries(attributes) as [any, number][]).map(([key, val]) => (
                     <div key={key} className="group bg-white/[0.02] border border-white/5 p-4 flex justify-between items-center hover:bg-white/[0.05] transition-all">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">{key}</span>
                           <span className="text-xl md:text-2xl font-display font-black text-white">{val}</span>
                        </div>
                        {attributePoints > 0 && (
                          <button 
                            onClick={() => upgradeAttribute(key)}
                            className="w-10 h-10 bg-accent-neon text-black font-black flex items-center justify-center hover:bg-white transition-colors text-xl"
                          >
                            +
                          </button>
                        )}
                     </div>
                   ))}

                   <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em] mt-8 mb-4 block">Skills & Mastery</span>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skills.map((skill: Skill) => (
                      <div key={skill.id} className={`group p-5 border transition-all ${skill.unlocked ? 'bg-white/[0.03] border-white/10' : 'bg-black/40 border-white/5 opacity-50 hover:opacity-80'}`}>
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                               <span className={`text-[8px] font-black tracking-widest uppercase mb-1 ${skill.unlocked ? 'text-accent-neon' : 'text-white/40'}`}>
                                  {skill.unlocked ? 'ACTIVE_PROTOCOL' : 'ENCRYPTED_DATA'}
                               </span>
                               <span className="text-sm font-black text-white uppercase tracking-wider">{skill.name}</span>
                            </div>
                            <div className="text-[10px] font-mono text-white/40">LVL_{skill.level.toString().padStart(2, '0')}</div>
                         </div>
                         
                         <div className="flex flex-col gap-3">
                            <div className="w-full h-1 bg-white/5 overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${(skill.xp / (skill.level * 200)) * 100}%` }}
                                 className="h-full bg-accent-neon" 
                               />
                            </div>
                            {!skill.unlocked && skillPoints > 0 ? (
                              <button 
                                onClick={() => unlockSkill(skill.id)}
                                className="w-full py-2 bg-accent-neon text-black font-black text-[9px] uppercase tracking-widest hover:bg-white transition-colors"
                              >
                                Initialize_Link (1pt)
                              </button>
                            ) : (
                              <div className="text-[7px] text-white/30 font-bold uppercase tracking-tighter">Sync_Rate: {Math.floor((skill.xp / (skill.level * 200)) * 100)}%</div>
                            )}
                         </div>
                      </div>
                    ))}
                   </div>

                  {/* Mobile Footer Spacing/Button */}
                  <div className="md:hidden pt-10">
                     <button 
                       onClick={onClose}
                       className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.5em]"
                     >
                       CLOSE INTERFACE
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
               <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {RECIPES.map(recipe => (
                    <div key={recipe.id} className="p-4 md:p-5 bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:border-accent-neon/30 transition-all">
                       <div>
                          <div className="text-white font-black text-sm md:text-base uppercase mb-1 tracking-widest">{recipe.name}</div>
                          <div className="flex flex-wrap gap-1 md:gap-2 mb-4 md:mb-6">
                             {recipe.ingredients.map(ing => (
                               <div key={ing.itemId} className="px-2 py-1 bg-white/5 text-[7px] md:text-[8px] font-bold text-white/60 uppercase">
                                  {ing.itemId.split('_')[0]}: {ing.count}
                               </div>
                             ))}
                          </div>
                       </div>
                       <button 
                         onClick={() => craftItem(recipe)}
                         className="w-full py-2 bg-white/10 hover:bg-accent-neon hover:text-black text-white text-[9px] font-black uppercase tracking-widest transition-all"
                       >
                         Synthesize
                       </button>
                    </div>
                  ))}
               </div>
               <div className="bg-white/[0.01] md:border-l border-white/5 p-4 md:p-6 space-y-4 md:space-y-6">
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em] block">Storage Units</span>
                  {inventory.length > 0 ? inventory.map((item, i) => (
                    <div key={i} className="p-3 border-b border-white/5 flex justify-between items-center">
                       <span className="text-xs font-bold text-white uppercase tracking-widest">{item.name}</span>
                       <span className="text-xs font-mono text-accent-neon">x{('count' in item) ? item.count : 1}</span>
                    </div>
                  )) : (
                    <div className="text-[10px] text-white/10 uppercase tracking-widest italic text-center py-4">Void empty</div>
                  )}
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const InfoItem = ({ label, value, sub, highlight }: any) => (
  <div className={`p-5 border ${highlight ? 'border-accent-neon/40' : 'border-white/5'} bg-white/[0.01]`}>
     <div className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">{label}</div>
     <div className={`text-4xl font-display font-black leading-none ${highlight ? 'text-accent-neon' : 'text-white'}`}>{value}</div>
     {sub && <div className="text-[8px] text-white/30 font-bold uppercase mt-2 tracking-tighter">{sub}</div>}
  </div>
);
