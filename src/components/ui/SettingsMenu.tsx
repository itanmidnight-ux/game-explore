/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '../../store';
import { Settings, X, Cpu, Monitor, Maximize } from 'lucide-react';

export const SettingsMenu = () => {
  const isOpen = useGameStore(s => s.isSettingsOpen);
  const setOpen = useGameStore(s => s.setSettingsOpen);
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">System Configuration</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Performance & Graphics</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
            
            {/* Visual Quality */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-widest">
                <Monitor className="w-4 h-4" />
                <span>Visual Fidelity</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => updateSettings({ quality: q })}
                    className={`p-3 rounded-lg border text-sm font-bold uppercase transition-all ${
                      settings.quality === q 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </section>

            {/* Performance Toggles */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-widest">
                <Cpu className="w-4 h-4" />
                <span>Computational Optimizations</span>
              </div>
              <div className="space-y-3">
                <Toggle
                  label="Nameplate Rendering"
                  description="Displays enemy labels, lore, and health bars. Disabling improves performance in large hordes."
                  active={settings.showBillboards}
                  onToggle={() => updateSettings({ showBillboards: !settings.showBillboards })}
                />
                <Toggle
                  label="Adaptive AI Throttling"
                  description="Reduces AI update frequency to save CPU cycles. Highly recommended for PC fluid play."
                  active={settings.aiThrottling}
                  onToggle={() => updateSettings({ aiThrottling: !settings.aiThrottling })}
                />
                <Toggle
                  label="Dynamic Entity Shadows"
                  description="Enables high-quality shadows for monsters and structures."
                  active={settings.dynamicShadows}
                  onToggle={() => updateSettings({ dynamicShadows: !settings.dynamicShadows })}
                />
              </div>
            </section>

            {/* Framerate */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-widest">
                <Maximize className="w-4 h-4" />
                <span>Frame Rate Target</span>
              </div>
              <input
                type="range"
                min="30"
                max="144"
                step="30"
                value={settings.maxFps}
                onChange={e => updateSettings({ maxFps: parseInt(e.target.value) })}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-600">
                <span>30 FPS</span>
                <span>60 FPS</span>
                <span>90 FPS</span>
                <span>120 FPS</span>
                <span>144 FPS</span>
              </div>
              <p className="text-center text-blue-400 font-mono text-lg font-bold">{settings.maxFps} FPS</p>
            </section>

          </div>

          {/* Footer */}
          <div className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
             <button 
               onClick={() => setOpen(false)}
               className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
             >
               Apply Configuration
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Toggle = ({ label, description, active, onToggle }: { label: string, description: string, active: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
    <div className="flex-1">
      <h3 className="text-sm font-bold text-zinc-100 mb-0.5">{label}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        active ? 'bg-blue-600' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          active ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);
