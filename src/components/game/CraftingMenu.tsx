/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store';
import { X, Hammer, ChevronRight, Zap, Shield, Beaker } from 'lucide-react';

export const CraftingMenu = () => {
    const isCraftingOpen = useGameStore(s => s.isCraftingOpen);
    const setCraftingOpen = useGameStore(s => s.setCraftingOpen);
    const recipes = useGameStore(s => s.recipes);
    const inventory = useGameStore(s => s.inventory);
    const craftItem = useGameStore(s => s.craftItem);
    const triggerSound = useGameStore(s => s.triggerSound);

    const checkIngredients = (recipe: any) => {
        return recipe.ingredients.every((ing: any) => {
            const item = inventory.find(i => i.id === ing.itemId);
            return item && 'count' in item && item.count >= ing.count;
        });
    };

    const handleCraft = (recipe: any) => {
        if (checkIngredients(recipe)) {
            craftItem(recipe);
            triggerSound('level'); // Use level sound for "success" feedback
        }
    };

    return (
        <AnimatePresence>
            {isCraftingOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 lg:p-24 bg-black/80 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl h-[80vh] flex flex-col md:flex-row bg-[#151619] border border-[#333] rounded-lg overflow-hidden shadow-2xl overflow-y-auto md:overflow-hidden"
                    >
                        {/* Header Mobile / Close Button */}
                        <div className="absolute top-4 right-4 z-10">
                            <button 
                                onClick={() => setCraftingOpen(false)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Sidebar: Navigation / Hierarchy */}
                        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-6 bg-black/20">
                            <div className="flex items-center gap-3">
                                <Hammer className="text-cyan-400" size={20} />
                                <h2 className="font-mono text-lg font-bold tracking-tighter text-white">SOVEREIGN FORGE</h2>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-[#8E9299]">Subsystems</label>
                                <button className="flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/50 rounded text-cyan-400 font-mono text-xs text-left">
                                    <Zap size={14} /> WEAPONRY
                                </button>
                                <button className="flex items-center gap-2 p-2 hover:bg-white/5 rounded text-[#8E9299] font-mono text-xs text-left transition-colors">
                                    <Shield size={14} /> DEFENSE
                                </button>
                                <button className="flex items-center gap-2 p-2 hover:bg-white/5 rounded text-[#8E9299] font-mono text-xs text-left transition-colors">
                                    <Beaker size={14} /> ALCHEMY
                                </button>
                            </div>

                            <div className="mt-auto hidden md:block">
                                <p className="font-mono text-[9px] text-[#555] leading-relaxed uppercase">
                                    // SYSTEM VERSION 0.9.4<br/>
                                    // SYNCING WITH ABYSSAL PARAMETERS...
                                </p>
                            </div>
                        </div>

                        {/* Main Content: Recipes Grid */}
                        <div className="flex-1 p-6 overflow-y-auto bg-black/10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {recipes.map((recipe) => {
                                    const canCraft = checkIngredients(recipe);
                                    return (
                                        <motion.div 
                                            key={recipe.id}
                                            whileHover={{ scale: 1.02 }}
                                            className={`p-4 border ${canCraft ? 'border-white/20 hover:border-cyan-500/50' : 'border-white/5 opacity-60'} bg-[#1a1b1e] rounded flex flex-col gap-4 transition-colors cursor-pointer group`}
                                            onClick={() => handleCraft(recipe)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-tight">{recipe.name}</h3>
                                                    <p className="font-mono text-[10px] text-[#8E9299] uppercase">{recipe.result.type}</p>
                                                </div>
                                                <div className={`p-1.5 rounded ${canCraft ? 'text-cyan-400' : 'text-white/20'}`}>
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {recipe.ingredients.map((ing) => {
                                                    const invItem = inventory.find(i => i.id === ing.itemId);
                                                    const currentCount = invItem && 'count' in invItem ? invItem.count : 0;
                                                    const hasEnough = currentCount >= ing.count;
                                                    return (
                                                        <div 
                                                            key={ing.itemId} 
                                                            className={`px-2 py-1 rounded-sm text-[9px] font-mono flex gap-2 border ${hasEnough ? 'border-[#333] text-[#8E9299]' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}
                                                        >
                                                            <span className="opacity-60">{ing.itemId.toUpperCase()}</span>
                                                            <span className="font-bold">{currentCount}/{ing.count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-white/5">
                                                <button 
                                                    disabled={!canCraft}
                                                    className={`w-full py-2 font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                                                        canCraft 
                                                        ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/10' 
                                                        : 'bg-white/5 text-[#444] cursor-not-allowed'
                                                    }`}
                                                >
                                                    {canCraft ? 'SYNTHESIZE' : 'MISSING PARAMS'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Overlay Scanlines (Recipe vibe) */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] system-scanline" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
