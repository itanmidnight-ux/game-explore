/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Heart, BookOpen, Hammer, Move, Target, Zap, ArrowUp, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { Joystick } from 'react-joystick-component';
import { useGameStore } from '../../store';
import { GameMenu } from './Menu';

import { Compass } from './Compass';

export const HUD = () => {
  const level = useGameStore(s => s.level);
  const xp = useGameStore(s => s.xp);
  const xpToNextLevel = useGameStore(s => s.xpToNextLevel);
  const health = useGameStore(s => s.health);
  const maxHealth = useGameStore(s => s.maxHealth);
  const stamina = useGameStore(s => s.stamina);
  const maxStamina = useGameStore(s => s.maxStamina);
  const mana = useGameStore(s => s.mana);
  const maxMana = useGameStore(s => s.maxMana);
  const currentSpell = useGameStore(s => s.currentSpell);
  const isBlocking = useGameStore(s => s.isBlocking);
  const isMobile = useGameStore(s => s.isMobile);
  const gameTime = useGameStore(s => s.gameTime);
  const comboCount = useGameStore(s => s.comboCount);
  const comboMultiplier = useGameStore(s => s.comboMultiplier);
  const systemLogs = useGameStore(s => s.systemLogs);
  const audioEnabled = useGameStore(s => s.audioEnabled);
  const toggleAudio = useGameStore(s => s.toggleAudio);
  const isCraftingOpen = useGameStore(s => s.isCraftingOpen);
  const setCraftingOpen = useGameStore(s => s.setCraftingOpen);
  const setSettingsOpen = useGameStore(s => s.setSettingsOpen);
  const setMobileMovement = useGameStore(s => s.setMobileMovement);
  const skills = useGameStore(s => s.skills);
  const activeQuests = useGameStore(s => s.activeQuests);
  const enemies = useGameStore(s => s.enemies);
  const nearestInteractionId = useGameStore(s => s.nearestInteractionId);
  const interactionEvents = useGameStore(s => s.interactionEvents);
  const performInteraction = useGameStore(s => s.performInteraction);
  const setCurrentSpell = useGameStore(s => s.setCurrentSpell);
  const activeElement = useGameStore(s => s.activeElement);
  const setElement = useGameStore(s => s.setElement);
  const setMobileAction = useGameStore(s => s.setMobileAction);
  const attributePoints = useGameStore(s => s.attributePoints);
  const skillPoints = useGameStore(s => s.skillPoints);

  const nearestEvent = interactionEvents.find(e => e.id === nearestInteractionId);

  const getComboRank = (count: number) => {
    if (count > 100) return { rank: 'SSS', color: 'text-amber-400', shadow: 'shadow-amber-500/50' };
    if (count > 75) return { rank: 'SS', color: 'text-amber-500', shadow: 'shadow-amber-600/50' };
    if (count > 50) return { rank: 'S', color: 'text-red-500', shadow: 'shadow-red-500/50' };
    if (count > 30) return { rank: 'A', color: 'text-purple-500', shadow: 'shadow-purple-500/50' };
    if (count > 15) return { rank: 'B', color: 'text-blue-500', shadow: 'shadow-blue-500/50' };
    if (count > 5) return { rank: 'C', color: 'text-emerald-500', shadow: 'shadow-emerald-500/50' };
    return { rank: 'D', color: 'text-white/60', shadow: 'shadow-white/20' };
  };

  const activeBoss = enemies.find(e => e.isBoss && e.state !== 'dead');

  const [menuOpen, setMenuOpen] = useState<'progression' | null>(null);
  
  const xpPercent = (xp / xpToNextLevel) * 100;
  const healthPercent = (health / maxHealth) * 100;
  const staminaPercent = (stamina / maxStamina) * 100;
  const manaPercent = (mana / maxMana) * 100;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyK') setMenuOpen(prev => prev === 'progression' ? null : 'progression');
      if (e.code === 'Escape') {
        setMenuOpen(null);
        setCraftingOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const handleInteractKey = (e: KeyboardEvent) => {
        if (e.code === 'KeyF') performInteraction();
    };
    window.addEventListener('keydown', handleInteractKey);
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keydown', handleInteractKey);
    };
  }, [setCraftingOpen, performInteraction]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 font-sans p-4 md:p-10 flex flex-col justify-between select-none pt-safe pb-safe px-safe">
      <GameMenu 
        isOpen={menuOpen !== null} 
        onClose={() => setMenuOpen(null)} 
        type="progression" 
      />

      {/* Elemental Selector (Genshin Style) */}
      <div className="absolute right-6 bottom-[25%] flex flex-col gap-3 pointer-events-auto">
         {(['void', 'solar', 'lunar', 'chaos'] as const).map((el) => (
            <motion.button
              key={el}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setElement(activeElement === el ? 'none' : el)}
              className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center
                ${activeElement === el ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-black/40 text-white/40 border-white/20'}
              `}
            >
               <Zap className={`w-6 h-6 ${
                 el === 'void' ? 'text-cyan-400' : 
                 el === 'solar' ? 'text-orange-400' :
                 el === 'lunar' ? 'text-slate-100' : 'text-purple-500'
               }`} />
            </motion.button>
         ))}
      </div>

      {/* Mobile Touch Area for Camera Look (Right side) */}
      {isMobile && <MobileLookCapture />}

      {/* Interaction Prompt (Genshin Style) */}
      <AnimatePresence>
        {nearestEvent && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="absolute right-[15%] top-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-auto"
          >
             <div className="flex flex-col items-end">
                <div className="text-[10px] text-white/40 tracking-[0.4em] uppercase font-black mb-1">Target Object Detected</div>
                <div className="text-xl text-white font-display font-black tracking-widest uppercase">{nearestEvent.label}</div>
             </div>
             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => performInteraction()}
               className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] group relative"
             >
                <div className="absolute inset-0 rounded-full border border-white animate-ping opacity-20" />
                <span className="text-2xl font-black">{isMobile ? <Zap className="w-8 h-8" /> : 'F'}</span>
                
                {/* Visual indicator for type */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-accent-neon px-2 py-0.5 rounded text-[8px] font-black uppercase text-black tracking-tighter">
                   {nearestEvent.type}
                </div>
             </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Logs - Smaller and more professional */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 w-64">
         <div className="text-[7px] font-black text-white/30 tracking-[0.4em] mb-1 px-1">SYSTEM_FEEDBACK</div>
         <AnimatePresence mode="popLayout">
            {systemLogs.slice(0, 4).map((log) => (
               <motion.div 
                 key={log.id}
                 layout
                 initial={{ x: -50, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 exit={{ x: 50, opacity: 0 }}
                 className={`py-2 px-3 border-l-2 backdrop-blur-md transition-all
                   ${log.type === 'critical' ? 'bg-red-500/5 border-red-500/50 text-red-400' : 
                     log.type === 'level' ? 'bg-cyan-500/5 border-cyan-400/50 text-cyan-300' :
                     'bg-white/5 border-white/10 text-white/60'}
                 `}
               >
                  <div className="flex justify-between items-center mb-0.5 space-x-2">
                    <span className="text-[6px] font-black tracking-[0.2em] opacity-40 uppercase truncate">{log.type} // LOG_{log.id.slice(-3)}</span>
                    <span className="text-[6px] font-mono opacity-30 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                  </div>
                  <div className="text-[9px] font-medium leading-tight tracking-wide uppercase">{log.message}</div>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Minecraft Style Hotbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto flex gap-1 bg-black/40 p-1 border border-white/10 backdrop-blur-xl">
        {[...Array(9)].map((_, i) => {
          const slot = useGameStore.getState().hotbarSlots[i];
          const isActive = useGameStore.getState().hotbarIndex === i;
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={() => useGameStore.getState().setHotbarIndex(i)}
              className={`w-12 h-12 md:w-14 md:h-14 border-2 flex items-center justify-center relative cursor-pointer group transition-all
                ${isActive ? 'border-accent-neon bg-accent-neon/20 shadow-[0_0_20px_rgba(0,242,255,0.4)] z-10 scale-110' : 'border-white/10 bg-white/5 hover:border-white/30'}
              `}
            >
              <span className={`absolute top-0.5 left-1 text-[8px] font-mono transition-colors ${isActive ? 'text-accent-neon font-black' : 'text-white/40'}`}>{i + 1}</span>
              {slot ? (
                <div className="flex flex-col items-center">
                  <span className={`text-[7px] font-black uppercase leading-tight px-1 text-center ${isActive ? 'text-white' : 'text-white/60'}`}>{slot.replace('_', '\n')}</span>
                </div>
              ) : (
                <div className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-white/40 transition-colors" />
              )}
              {isActive && (
                 <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-neon shadow-[0_0_10px_#00f2ff]" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Combo Counter */}
      {comboCount > 1 && (
        <div className="absolute right-10 top-1/3 flex flex-col items-end gap-0">
           <motion.div 
             key={comboCount}
             initial={{ scale: 2, opacity: 0, x: 20 }}
             animate={{ scale: 1, opacity: 1, x: 0 }}
             className={`text-8xl font-display font-black italic tracking-tighter drop-shadow-2xl ${getComboRank(comboCount).color}`}
           >
              {getComboRank(comboCount).rank}
           </motion.div>
           <motion.div
             animate={{ x: [0, -5, 0] }}
             transition={{ repeat: Infinity, duration: 0.1 }}
             className="text-4xl font-display font-black text-white italic -mt-6 flex items-baseline gap-2"
           >
              {comboCount}<span className="text-xs uppercase tracking-[0.4em] opacity-40">Chain Hit</span>
           </motion.div>
           <div className="text-accent-neon font-mono font-black text-xl mt-1">x{comboMultiplier.toFixed(1)} DMG_BOOST</div>
        </div>
      )}

      {/* Boss Bar */}
      {activeBoss && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-10 flex flex-col items-center">
           <div className="flex justify-between w-full mb-1 px-4">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em]">{activeBoss.race} // THE CALAMITY</span>
              <span className="text-[10px] font-mono text-white/40">LVL {activeBoss.level}</span>
           </div>
           <div className="w-full h-2 bg-red-950/30 border border-red-500/20 relative overflow-hidden backdrop-blur-xl">
              <motion.div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                animate={{ width: `${(activeBoss.health / activeBoss.maxHealth) * 100}%` }}
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-10" />
           </div>
           <div className="mt-1 text-[8px] font-black text-white/20 uppercase tracking-[1em] text-center w-full">Sovereign_Protocol: Neutralize_Threat</div>
        </div>
      )}

      {/* Top Header - System Notification Style */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
           <motion.div 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="bg-black/60 border-l-4 border-accent-neon px-5 py-3 backdrop-blur-md"
           >
              <div className="text-[10px] text-accent-neon/80 font-black uppercase tracking-[0.4em] mb-1">Scenario: Abyssal Gate</div>
              <div className="text-2xl font-display font-black text-white uppercase tracking-tighter">REYNUN: THE ETERNAL NIGHT</div>
           </motion.div>
           
           <div className="flex gap-4 items-center mt-2 px-1">
              <div className="h-1.5 w-40 bg-white/5 overflow-hidden relative border border-white/5">
                 <motion.div 
                   className="h-full bg-accent-neon shadow-[0_0_10px_#00f2ff]"
                   animate={{ width: `${xpPercent}%` }}
                 />
              </div>
              <span className="text-[9px] text-accent-neon font-black uppercase tracking-widest">EXP: {xpPercent.toFixed(1)}%</span>
           </div>
        </div>
        
        <div className="hidden lg:block absolute left-1/2 top-10 -translate-x-1/2">
           <Compass />
        </div>

        <div className="flex gap-4 items-center pointer-events-auto">
           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => toggleAudio()}
             className={`px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all border ${audioEnabled ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40'}`}
           >
             {audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}
           </motion.button>

           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => setSettingsOpen(true)}
             className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all border bg-transparent text-white/40 border-white/10 hover:border-white/40 flex items-center gap-2"
           >
             <SettingsIcon className="w-3 h-3" />
             SETTINGS
           </motion.button>

           <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">System Time</span>
              <span className="text-xl font-mono font-black text-white">{Math.floor(gameTime).toString().padStart(2, '0')}:00</span>
           </div>
           
           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => setCraftingOpen(!isCraftingOpen)}
             className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.5em] transition-all border ${isCraftingOpen ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-transparent text-white/40 border-white/10 hover:border-white/40 shadow-[0_0_20px_rgba(0,242,255,0.1)]'}`}
           >
             FORGE
           </motion.button>

           <motion.button
             whileTap={{ scale: 0.95 }}
             onClick={() => setMenuOpen('progression')}
             className="bg-accent-neon hover:bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.5em] transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
           >
             SYSTEM
           </motion.button>
        </div>
      </div>

      {/* Crosshair - System Targeting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
        <div className={`transition-all duration-300 ${isBlocking ? 'scale-150 rotate-45 text-accent-blood' : 'text-accent-neon'}`}>
           <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.5}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              <rect x="11.5" y="11.5" width="1" height="1" fill="currentColor" />
           </svg>
        </div>
      </div>

      {/* Bottom Status & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
        {/* Vital Stats */}
        <div className="flex flex-col gap-6 w-full max-w-sm">
           <div className="flex items-end gap-4">
              <motion.div 
                className="text-7xl font-display font-black text-white leading-none tracking-tighter"
                key={level}
                initial={{ scale: 1.2, color: '#00f2ff' }}
                animate={{ scale: 1, color: '#ffffff' }}
              >
                {level}
              </motion.div>
              <div className="flex flex-col pb-1">
                 <span className="text-[9px] text-accent-neon font-black uppercase tracking-[0.4em] mb-1">Rank: Shadow Lord</span>
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-3 h-1 ${i < 3 ? 'bg-accent-neon' : 'bg-white/10'}`} />
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <StatBar label="VITALITY_LINK" value={health} max={maxHealth} color="bg-red-500" percent={healthPercent} />
              <StatBar label="ARCANE_FLOW" value={mana} max={maxMana} color="bg-cyan-500" percent={manaPercent} />
              <StatBar label="KINETIC_CORE" value={stamina} max={maxStamina} color="bg-orange-500" percent={staminaPercent} />
              <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col flex-1 gap-1">
                     <span className="text-[7px] text-white/30 font-black uppercase tracking-[0.4em]">Synaptic_Progress: {Math.floor((xp / (level * 1000)) * 100)}%</span>
                     <div className="h-0.5 w-full bg-white/5 overflow-hidden">
                        <motion.div 
                          className="h-full bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                          animate={{ width: `${(xp / (level * 1000)) * 100}%` }}
                        />
                     </div>
                  </div>
                  {(attributePoints > 0 || skillPoints > 0) && (
                     <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-[7px] font-black text-accent-neon uppercase tracking-widest"
                     >
                        POINTS_AVAILABLE_FOR_EVOLUTION
                     </motion.div>
                  )}
               </div>
           </div>
        </div>

        {/* System Spell Link Selector */}
        <div className="flex flex-col gap-3">
           <div className="flex gap-4">
              {skills.filter(s => s.unlocked).map(skill => (
                <div key={skill.id} className="bg-black/40 border border-white/10 px-3 py-1.5 flex flex-col gap-1 backdrop-blur-sm">
                   <div className="flex justify-between items-center gap-4">
                      <span className="text-[8px] font-black text-accent-neon uppercase">{skill.name}</span>
                      <span className="text-[8px] font-mono text-white/60">LVL {skill.level}</span>
                   </div>
                   <div className="h-0.5 w-16 bg-white/5 overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent-neon"
                        animate={{ width: `${(skill.xp / (skill.level * 200)) * 100}%` }}
                      />
                   </div>
                </div>
              ))}
           </div>
           <div className="flex gap-4">
              <div className={`px-4 py-2 border transition-all duration-300 ${currentSpell === 'fireball' ? 'border-accent-blood bg-accent-blood/20' : 'border-white/5 opacity-30 scale-95'}`}>
                 <div className="text-[8px] font-black text-white/40 mb-1 tracking-widest uppercase">Lnk_01: Fire</div>
                 <Sword size={14} className={currentSpell === 'fireball' ? 'text-accent-blood' : 'text-white'} />
              </div>
              <div className={`px-4 py-2 border transition-all duration-300 ${currentSpell === 'void_bolt' ? 'border-accent-neon bg-accent-neon/20' : 'border-white/5 opacity-30 scale-95'}`}>
                 <div className="text-[8px] font-black text-white/40 mb-1 tracking-widest uppercase">Lnk_02: Void</div>
                 <Target size={14} className={currentSpell === 'void_bolt' ? 'text-accent-neon' : 'text-white'} />
              </div>
           </div>
        </div>

        {/* Mobile Input - Genshin Impact Style */}
        {isMobile && (
          <div className="fixed inset-x-0 bottom-10 pointer-events-none px-12 flex justify-between items-end z-50">
            {/* Joystick Side */}
            <div className="pointer-events-auto bg-black/20 backdrop-blur-md rounded-full p-2 border border-white/10">
              <Joystick 
                size={120} 
                baseColor="rgba(255, 255, 255, 0.05)" 
                stickColor="rgba(0, 242, 255, 0.6)" 
                move={(e) => setMobileMovement({ x: e.x || 0, y: e.y || 0 })} 
                stop={() => setMobileMovement(null)} 
              />
            </div>

            {/* Action Cluster Side */}
            <div className="relative w-72 h-72 flex items-center justify-center pointer-events-none">
               {/* Main Attack Button */}
               <motion.button
                 whileTap={{ scale: 0.9, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                 onPointerDown={(e) => {
                   e.preventDefault();
                   window.dispatchEvent(new Event('mobileAttack'));
                 }}
                 className="absolute bottom-6 right-6 w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white backdrop-blur-xl pointer-events-auto shadow-[0_0_30px_rgba(255,255,255,0.1)] active:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-shadow"
               >
                  <Sword size={40} className="drop-shadow-lg" />
                  <div className="absolute inset-2 border border-white/5 rounded-full" />
               </motion.button>

               {/* Dash / Dodge Button */}
               <motion.button
                 whileTap={{ scale: 0.9 }}
                 onPointerDown={(e) => { e.preventDefault(); setMobileAction('dash', true); }}
                 onPointerUp={(e) => { e.preventDefault(); setMobileAction('dash', false); }}
                 onPointerLeave={() => setMobileAction('dash', false)}
                 className="absolute bottom-12 right-40 w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 backdrop-blur-lg pointer-events-auto shadow-[0_0_15px_rgba(0,255,255,0.2)]"
               >
                  <Zap size={24} />
               </motion.button>

               {/* Jump Button */}
               <motion.button
                 whileTap={{ scale: 0.9 }}
                 onPointerDown={(e) => { e.preventDefault(); setMobileAction('jump', true); }}
                 onPointerUp={(e) => { e.preventDefault(); setMobileAction('jump', false); }}
                 onPointerLeave={() => setMobileAction('jump', false)}
                 className="absolute bottom-36 right-40 w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-lg pointer-events-auto shadow-[0_0_15px_rgba(255,255,255,0.1)]"
               >
                  <ArrowUp size={24} />
               </motion.button>

               {/* Spell Switcher */}
               <motion.button
                 whileTap={{ scale: 0.9, rotate: 180 }}
                 onClick={() => setCurrentSpell(currentSpell === 'fireball' ? 'void_bolt' : 'fireball')}
                 className="absolute bottom-36 right-12 w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 backdrop-blur-lg pointer-events-auto"
               >
                  <RefreshCw size={24} />
               </motion.button>

               {/* Interact / Use Button */}
               <motion.button
                 whileTap={{ scale: 0.9 }}
                 onClick={() => performInteraction()}
                 className={`absolute bottom-56 right-20 w-14 h-14 rounded-full border flex items-center justify-center backdrop-blur-sm pointer-events-auto transition-all ${nearestInteractionId ? 'bg-accent-neon/20 border-accent-neon text-accent-neon shadow-[0_0_15px_rgba(0,242,255,0.3)]' : 'bg-white/5 border-white/10 text-white/20'}`}
               >
                  <div className="text-[10px] font-black uppercase tracking-tighter">Use</div>
               </motion.button>

               {/* Menu Button */}
               <motion.button
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setMenuOpen('progression')}
                 className="absolute bottom-56 right-4 w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 backdrop-blur-sm pointer-events-auto"
               >
                  <BookOpen size={18} />
               </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBar = ({ label, value, max, color, percent }: any) => {
  const isLow = percent < 20;
  return (
    <div className="flex flex-col gap-1">
       <div className="flex justify-between items-end px-1">
          <span className={`text-[7px] font-black uppercase tracking-[0.4em] ${isLow && label === 'KINETIC_CORE' ? 'text-red-500 animate-pulse' : 'text-white/30'}`}>
            {label} {isLow && label === 'KINETIC_CORE' ? '// STAMINA_LOW' : ''}
          </span>
          <span className="text-[9px] font-mono text-white tracking-widest">{Math.round(value)}<span className="opacity-30 text-[7px]"> / {max}</span></span>
       </div>
       <div className="h-1 w-full bg-white/5 border-l-2 border-white/10 relative overflow-hidden">
          <motion.div 
             className={`h-full ${color}`}
             animate={{ width: `${percent}%`, backgroundColor: isLow && label === 'KINETIC_CORE' ? '#ef4444' : undefined }}
          />
       </div>
    </div>
  );
};

const MobileLookCapture = () => {
  const setTouchLook = useGameStore(s => s.setTouchLook);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!lastPos.current) return;
    
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    
    setTouchLook({ x: dx, y: dy });
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    lastPos.current = null;
  };

  return (
    <div 
      className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto z-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

